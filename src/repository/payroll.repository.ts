import prisma from "../config/db";

const GESTORA_RATE = 0.1271;

function parseDate(value: any): Date | null {
  if (!value) return null;
  const str = typeof value === "string" ? value.split("T")[0] : value.toISOString().split("T")[0];
  const [year, month, day] = str.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameMonth(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth()
  );
}

function isBeforeMonth(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() < dateB.getFullYear() ||
    (dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() < dateB.getMonth())
  );
}

function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getPayrollDay(date: Date): number {
  const day = date.getDate();
  const lastDay = getLastDayOfMonth(date);
  if (lastDay < 30 && day === lastDay) {
    return 30;
  }
  return Math.min(day, 30);
}

function clampDays(days: number): number {
  return Math.max(0, Math.min(days, 30));
}

function getEffectiveDate(currentDate: Date, endDate: Date | null): Date {
  const today = normalizeDate(currentDate);
  if (!endDate || endDate >= today) {
    return today;
  }
  return endDate;
}

function getAnniversary(hireDate: Date, years: number): Date {
  return new Date(
    hireDate.getFullYear() + years,
    hireDate.getMonth(),
    hireDate.getDate()
  );
}

function calculateWorkedDays(contract: any, currentDate = new Date()): number {
  const hireDate = parseDate(contract?.hireDate);
  const endDate = parseDate(contract?.endDate);
  const today = normalizeDate(currentDate);

  if (!hireDate || hireDate > today) {
    return 0;
  }

  if (endDate && isBeforeMonth(endDate, today)) {
    return 0;
  }

  const effectiveDate = getEffectiveDate(today, endDate);

  if (sameMonth(hireDate, today)) {
    return clampDays(effectiveDate.getDate() - hireDate.getDate());
  }

  return clampDays(getPayrollDay(effectiveDate));
}

function getMonthlySeniorityBonus(baseSalary: number, rate: number): number {
  return baseSalary * rate * 3;
}

function calculateSeniorityBonus(
  contract: any,
  baseSalary: number,
  currentDate = new Date()
): number {
  const hireDate = parseDate(contract?.hireDate);
  const endDate = parseDate(contract?.endDate);
  const today = normalizeDate(currentDate);

  if (!hireDate || !baseSalary) {
    return 0;
  }

  const effectiveDate = getEffectiveDate(today, endDate);

  if (endDate && isBeforeMonth(endDate, today)) {
    return 0;
  }

  const anniversary2 = getAnniversary(hireDate, 2);
  const anniversary5 = getAnniversary(hireDate, 5);

  if (effectiveDate < anniversary2) {
    return 0;
  }

  const fullBonus5 = getMonthlySeniorityBonus(baseSalary, 0.05);
  const fullBonus11 = getMonthlySeniorityBonus(baseSalary, 0.11);

  if (sameMonth(anniversary2, today)) {
    const bonusDays = clampDays(
      effectiveDate.getDate() - anniversary2.getDate()
    );
    return (fullBonus5 / 30) * bonusDays;
  }

  if (effectiveDate < anniversary5) {
    const bonusDays = getPayrollDay(effectiveDate);
    return (fullBonus5 / 30) * bonusDays;
  }

  if (sameMonth(anniversary5, today)) {
    const totalPayrollDays = getPayrollDay(effectiveDate);
    const daysAt11 = clampDays(
      effectiveDate.getDate() - anniversary5.getDate()
    );
    const daysAt5 = Math.max(totalPayrollDays - daysAt11, 0);
    const amountAt5 = (fullBonus5 / 30) * daysAt5;
    const amountAt11 = (fullBonus11 / 30) * daysAt11;
    return amountAt5 + amountAt11;
  }

  const bonusDays = getPayrollDay(effectiveDate);
  return (fullBonus11 / 30) * bonusDays;
}

export const syncPayrollsForPeriod = async (year: number, month: number) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Solo sincronizar automáticamente si el período es el mes actual en curso
  if (year !== currentYear || month !== currentMonth) {
    return;
  }

  const startDateOfMonth = new Date(year, month - 1, 1);
  const endDateOfMonth = new Date(year, month, 0, 23, 59, 59);

  const activeContracts = await prisma.employeeContract.findMany({
    where: {
      isActive: true,
      status: "ACTIVE",
    },
    include: {
      employee: true,
    },
  });

  for (const contract of activeContracts) {
    const existingPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_year_month: {
          employeeId: contract.employeeId,
          year,
          month,
        },
      },
    });

    const isFiscal = contract.contractType !== "CONSULTING";
    const baseSalary = Number(contract.baseSalary) || 0;
    const workedDays = calculateWorkedDays(contract, now);
    const earnedSalary = Number(((baseSalary / 30) * workedDays).toFixed(2));

    // Bono de antigüedad idéntico a salaryCalculator.js
    const seniorityBonusRaw = isFiscal
      ? calculateSeniorityBonus(contract, baseSalary, now)
      : 0;
    const seniorityBonus = Number(seniorityBonusRaw.toFixed(2));

    // Movimientos extra (bonos)
    const movements = await prisma.employeeMovement.findMany({
      where: {
        employeeId: contract.employeeId,
        type: "BONUS",
        movementDate: {
          gte: startDateOfMonth,
          lte: endDateOfMonth,
        },
      },
    });
    const otherBonuses = Number(
      movements.reduce((acc, m) => acc + Number(m.amount), 0).toFixed(2)
    );

    const grossPay = Number(
      (earnedSalary + seniorityBonus + otherBonuses).toFixed(2)
    );

    // Descuento Gestora/AFP (12.71% sobre grossPay si es fiscal, 0 si es consultor)
    const afpDeduction = isFiscal
      ? Number((grossPay * GESTORA_RATE).toFixed(2))
      : 0;

    // Descuento Faltas/Incidentes en el mes
    const incidents = await prisma.attendanceIncident.findMany({
      where: {
        employeeId: contract.employeeId,
        incidentDate: {
          gte: startDateOfMonth,
          lte: endDateOfMonth,
        },
      },
    });
    const absenceDeduction = Number(
      incidents.reduce((acc, inc) => acc + Number(inc.discount), 0).toFixed(2)
    );

    // Descuento Anticipos en el mes (TODOS los anticipos registrados en el mes)
    const advances = await prisma.employeeAdvance.findMany({
      where: {
        employeeId: contract.employeeId,
        advanceDate: {
          gte: startDateOfMonth,
          lte: endDateOfMonth,
        },
      },
    });
    const advanceDeduction = Number(
      advances.reduce((acc, adv) => acc + Number(adv.amount), 0).toFixed(2)
    );

    const totalDeductions = Number(
      (afpDeduction + absenceDeduction + advanceDeduction).toFixed(2)
    );
    const netSalary = Number((grossPay - totalDeductions).toFixed(2));

    if (!existingPayroll) {
      await prisma.payroll.create({
        data: {
          employeeId: contract.employeeId,
          contractCompanyId: contract.contractCompanyId,
          consolidatedCompanyId: contract.consolidatedCompanyId,
          year,
          month,
          baseSalary: contract.baseSalary,
          workedDays: workedDays,
          earnedSalary: earnedSalary,
          seniorityBonus: seniorityBonus,
          otherBonuses: otherBonuses,
          grossPay: grossPay,
          afpDeduction: afpDeduction,
          absenceDeduction: absenceDeduction,
          advanceDeduction: advanceDeduction,
          totalDeductions: totalDeductions,
          netSalary: netSalary,
          status: "DRAFT",
        },
      });
    } else {
      // Si ya existe la nómina del mes actual, actualizar con los mismos cálculos exactos
      await prisma.payroll.update({
        where: { id: existingPayroll.id },
        data: {
          workedDays,
          earnedSalary,
          seniorityBonus,
          otherBonuses,
          grossPay,
          afpDeduction,
          absenceDeduction,
          advanceDeduction,
          totalDeductions,
          netSalary,
        },
      });
    }
  }
};

export const getPayrollsByPeriodAndCompany = async (
  year: number,
  month: number,
  companyId: number,
  companyType: "contract" | "consolidated"
) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Solo sincronizar para el mes actual
  if (year === currentYear && month === currentMonth) {
    await syncPayrollsForPeriod(year, month);
  }

  const whereClause: any = {
    year,
    month,
  };

  if (companyType === "contract") {
    whereClause.contractCompanyId = companyId;
  } else {
    whereClause.consolidatedCompanyId = companyId;
  }

  return prisma.payroll.findMany({
    where: whereClause,
    include: {
      employee: {
        include: {
          contracts: {
            where: { isActive: true },
            include: {
              jobTitle: true,
              contractJobTitle: true,
            },
          },
        },
      },
      contractCompany: true,
      consolidatedCompany: true,
    },
    orderBy: {
      employee: {
        lastNames: "asc",
      },
    },
  });
};

export const updatePayroll = async (
  id: number,
  data: {
    workedDays?: number;
    otherBonuses?: number;
    absenceDeduction?: number;
    advanceDeduction?: number;
    status?: "DRAFT" | "GENERATED" | "APPROVED" | "PAID" | "CANCELLED";
  }
) => {
  const currentPayroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          contracts: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!currentPayroll) {
    throw new Error("Payroll record not found");
  }

  const activeContract = currentPayroll.employee.contracts[0];
  const isFiscal = activeContract ? activeContract.contractType !== "CONSULTING" : true;

  const baseSalary = Number(currentPayroll.baseSalary);
  const workedDays =
    data.workedDays !== undefined
      ? data.workedDays
      : Number(currentPayroll.workedDays);
  const earnedSalary = Number(((baseSalary / 30) * workedDays).toFixed(2));
  const seniorityBonus = Number(currentPayroll.seniorityBonus);
  const otherBonuses =
    data.otherBonuses !== undefined
      ? data.otherBonuses
      : Number(currentPayroll.otherBonuses);

  const grossPay = Number(
    (earnedSalary + seniorityBonus + otherBonuses).toFixed(2)
  );
  const afpDeduction = isFiscal
    ? Number((grossPay * GESTORA_RATE).toFixed(2))
    : 0;

  const absenceDeduction =
    data.absenceDeduction !== undefined
      ? data.absenceDeduction
      : Number(currentPayroll.absenceDeduction);
  const advanceDeduction =
    data.advanceDeduction !== undefined
      ? data.advanceDeduction
      : Number(currentPayroll.advanceDeduction);

  const totalDeductions = Number(
    (afpDeduction + absenceDeduction + advanceDeduction).toFixed(2)
  );
  const netSalary = Number((grossPay - totalDeductions).toFixed(2));

  return prisma.payroll.update({
    where: { id },
    data: {
      workedDays,
      earnedSalary,
      otherBonuses,
      grossPay,
      afpDeduction,
      absenceDeduction,
      advanceDeduction,
      totalDeductions,
      netSalary,
      status: data.status || currentPayroll.status,
    },
    include: {
      employee: {
        include: {
          contracts: {
            where: { isActive: true },
            include: {
              jobTitle: true,
              contractJobTitle: true,
            },
          },
        },
      },
      contractCompany: true,
      consolidatedCompany: true,
    },
  });
};

import prisma from "../config/db";

const GESTORA_RATE = 0.1271;

function getBoliviaDate(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(
    get("year"),
    get("month") - 1,
    get("day")
  );
}

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

function calculateWorkedDays(contract: any, currentDate = getBoliviaDate()): number {
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

export function getSeniorityBonusDetails(
  contract: any,
  baseSalary: number,
  currentDate = getBoliviaDate()
): { amount: number; description: string } {
  const hireDate = parseDate(contract?.hireDate);
  const endDate = parseDate(contract?.endDate);
  const today = normalizeDate(currentDate);

  if (!hireDate || !baseSalary) {
    return { amount: 0, description: "Menos de 2 años" };
  }

  const effectiveDate = getEffectiveDate(today, endDate);

  if (endDate && isBeforeMonth(endDate, today)) {
    return { amount: 0, description: "Contrato finalizado" };
  }

  const anniversary2 = getAnniversary(hireDate, 2);
  const anniversary5 = getAnniversary(hireDate, 5);

  if (effectiveDate < anniversary2) {
    return { amount: 0, description: "Menos de 2 años" };
  }

  const fullBonus5 = getMonthlySeniorityBonus(baseSalary, 0.05);
  const fullBonus11 = getMonthlySeniorityBonus(baseSalary, 0.11);

  if (sameMonth(anniversary2, today)) {
    const bonusDays = clampDays(
      effectiveDate.getDate() - anniversary2.getDate()
    );
    const amount = Number(((fullBonus5 / 30) * bonusDays).toFixed(2));
    return {
      amount,
      description: `2 a 4 años (5 %) - ${bonusDays} días de bono`,
    };
  }

  if (effectiveDate < anniversary5) {
    const bonusDays = getPayrollDay(effectiveDate);
    const amount = Number(((fullBonus5 / 30) * bonusDays).toFixed(2));
    return {
      amount,
      description: "2 a 4 años (5 %)",
    };
  }

  if (sameMonth(anniversary5, today)) {
    const totalPayrollDays = getPayrollDay(effectiveDate);
    const daysAt11 = clampDays(
      effectiveDate.getDate() - anniversary5.getDate()
    );
    const daysAt5 = Math.max(totalPayrollDays - daysAt11, 0);
    const amountAt5 = (fullBonus5 / 30) * daysAt5;
    const amountAt11 = (fullBonus11 / 30) * daysAt11;
    const amount = Number((amountAt5 + amountAt11).toFixed(2));
    return {
      amount,
      description: `5 a 7 años (11 %) - ${daysAt11} días al 11% / ${daysAt5} días al 5%`,
    };
  }

  const bonusDays = getPayrollDay(effectiveDate);
  const amount = Number(((fullBonus11 / 30) * bonusDays).toFixed(2));
  return {
    amount,
    description: "5 a 7 años (11 %)",
  };
}

function calculateSeniorityBonus(
  contract: any,
  baseSalary: number,
  currentDate = getBoliviaDate()
): number {
  return getSeniorityBonusDetails(contract, baseSalary, currentDate).amount;
}

export const syncPayrollsForPeriod = async (year: number, month: number) => {
  const now = getBoliviaDate();
  const lastDayOfPeriod = new Date(year, month, 0, 23, 59, 59);
  const evaluationDate = now > lastDayOfPeriod ? lastDayOfPeriod : now;

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
    const parsedEndDate = parseDate(contract.endDate);

    // Si la fecha de fin de contrato es anterior al inicio del mes evaluado, el contrato ha finalizado
    if (parsedEndDate && parsedEndDate < startDateOfMonth) {
      // 1. Marcar contrato como finalizado e inactivo
      await prisma.employeeContract.update({
        where: { id: contract.id },
        data: { isActive: false, status: "ENDED" },
      });

      // 2. Verificar si el empleado posee algún otro contrato activo
      const otherActiveContracts = await prisma.employeeContract.findFirst({
        where: {
          employeeId: contract.employeeId,
          id: { not: contract.id },
          isActive: true,
          status: "ACTIVE",
        },
      });

      // Si no tiene más contratos activos, cambiar estado del empleado a INACTIVE
      if (!otherActiveContracts) {
        await prisma.employee.update({
          where: { id: contract.employeeId },
          data: { status: "INACTIVE" },
        });
      }

      // 3. Eliminar planilla borrador si existiera para este período posterior a su fin de contrato
      await prisma.payroll.deleteMany({
        where: {
          employeeId: contract.employeeId,
          year,
          month,
          status: "DRAFT",
        },
      });

      continue;
    }

    const existingPayroll = await prisma.payroll.findUnique({
      where: {
        employeeId_year_month: {
          employeeId: contract.employeeId,
          year,
          month,
        },
      },
    });

    // Si la planilla para este empleado ya fue finalizada/cerrada, conservar intactos los valores
    if (
      existingPayroll &&
      (existingPayroll.status === "CLOSED" ||
        existingPayroll.status === "PAID" ||
        existingPayroll.status === "APPROVED")
    ) {
      continue;
    }

    const isFiscal = contract.contractType !== "CONSULTING";
    const baseSalary = Number(contract.baseSalary) || 0;
    const workedDays = calculateWorkedDays(contract, evaluationDate);
    const earnedSalary = Number(((baseSalary / 30) * workedDays).toFixed(2));

    // Bono de antigüedad idéntico a salaryCalculator.js
    const seniorityBonusRaw = isFiscal
      ? calculateSeniorityBonus(contract, baseSalary, evaluationDate)
      : 0;
    const seniorityBonus = Number(seniorityBonusRaw.toFixed(2));

    // Bonos personalizados (employee_bonuses)
    const activeBonuses = await prisma.employeeBonus.findMany({
      where: {
        employeeId: contract.employeeId,
        isActive: true,
      },
    });
    const bonusesAmount = activeBonuses.reduce((acc, bonus) => {
      const bAmount = Number(bonus.amount) || 0;
      if (bAmount <= 0) return acc;
      return acc + (bAmount / 30) * workedDays;
    }, 0);

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
    const movementsAmount = movements.reduce((acc, m) => acc + Number(m.amount), 0);

    const otherBonuses = Number((bonusesAmount + movementsAmount).toFixed(2));

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
      // Si ya existe la nómina del mes actual, actualizar con los mismos cálculos exactos y el haber básico del contrato
      await prisma.payroll.update({
        where: { id: existingPayroll.id },
        data: {
          baseSalary: contract.baseSalary,
          contractCompanyId: contract.contractCompanyId,
          consolidatedCompanyId: contract.consolidatedCompanyId,
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

export const finalizePayrollForPeriod = async (
  year: number,
  month: number,
  companyId: number,
  companyType: "contract" | "consolidated"
) => {
  // Sincroniza una última vez antes de cerrar
  await syncPayrollsForPeriod(year, month);

  const whereClause: any = {
    year,
    month,
    status: {
      notIn: ["CLOSED", "PAID", "APPROVED"],
    },
  };

  if (companyType === "contract") {
    whereClause.contractCompanyId = companyId;
  } else {
    whereClause.consolidatedCompanyId = companyId;
  }

  return prisma.payroll.updateMany({
    where: whereClause,
    data: {
      status: "CLOSED",
    },
  });
};

export const getPayrollsByPeriodAndCompany = async (
  year: number,
  month: number,
  companyId: number,
  companyType: "contract" | "consolidated"
) => {
  // Sincronizar automáticamente registros no cerrados del período solicitado
  await syncPayrollsForPeriod(year, month);

  const whereClause: any = {
    year,
    month,
  };

  if (companyType === "contract") {
    whereClause.contractCompanyId = companyId;
    whereClause.employee = {
      contracts: {
        some: {
          contractType: { not: "CONSULTING" },
        },
      },
    };
  } else {
    whereClause.consolidatedCompanyId = companyId;
  }

  const rawPayrolls = await prisma.payroll.findMany({
    where: whereClause,
    include: {
      employee: {
        include: {
          contracts: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              jobTitle: true,
              contractJobTitle: true,
              branch: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
      },
      contractCompany: true,
      consolidatedCompany: true,
    },
    orderBy: [
      {
        employee: {
          lastNames: "asc",
        },
      },
      {
        employee: {
          firstNames: "asc",
        },
      },
    ],
  });

  const startDateOfMonth = new Date(year, month - 1, 1);

  // Excluir registros de empleados cuyo contrato terminó antes del inicio del mes solicitado
  return rawPayrolls.filter((p) => {
    const contract = p.employee.contracts ? p.employee.contracts[0] : null;
    if (!contract) return true;
    const endDate = parseDate(contract.endDate);
    if (endDate && endDate < startDateOfMonth) {
      return false;
    }
    return true;
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
            orderBy: {
              createdAt: "desc",
            },
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

  const baseSalary = activeContract ? Number(activeContract.baseSalary) : Number(currentPayroll.baseSalary);
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
      baseSalary: activeContract ? activeContract.baseSalary : currentPayroll.baseSalary,
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
              branch: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
      },
      contractCompany: true,
      consolidatedCompany: true,
    },
  });
};

export const getEmployeeSalarySummary = async (
  employeeId: number,
  year?: number,
  month?: number
) => {
  const now = getBoliviaDate();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || now.getMonth() + 1;

  // Sincronizar nóminas del período solicitado
  await syncPayrollsForPeriod(targetYear, targetMonth);

  // Obtener empleado con sus contratos
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      contracts: {
        orderBy: [
          { isActive: "desc" },
          { id: "desc" },
        ],
        include: {
          branch: { include: { city: true } },
          area: true,
          jobTitle: true,
          contractJobTitle: true,
          contractCompany: true,
          consolidatedCompany: true,
        },
      },
    },
  });

  if (!employee) {
    return null;
  }

  const activeContract = employee.contracts?.find((c) => c.isActive) || employee.contracts?.[0] || null;
  const isFiscal = activeContract?.contractType !== "CONSULTING";
  const baseSalary = activeContract ? Number(activeContract.baseSalary) : 0;

  // Obtener la nómina calculada y guardada en BD para este empleado y período
  const payroll = await prisma.payroll.findUnique({
    where: {
      employeeId_year_month: {
        employeeId,
        year: targetYear,
        month: targetMonth,
      },
    },
  });

  const workedDays = payroll ? Number(payroll.workedDays) : 0;

  // Bonos registrados del empleado
  const activeBonuses = await prisma.employeeBonus.findMany({
    where: {
      employeeId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBonuses = activeBonuses.map((b) => {
    const bAmount = Number(b.amount) || 0;
    const monthlyAmount = workedDays > 0 ? Number(((bAmount / 30) * workedDays).toFixed(2)) : 0;
    return {
      id: b.id,
      name: b.name,
      amount: bAmount,
      monthlyAmount,
      isActive: b.isActive,
      createdAt: b.createdAt,
    };
  });

  const seniorityDetails = activeContract && isFiscal
    ? getSeniorityBonusDetails(activeContract, baseSalary, now)
    : {
        amount: 0,
        description: isFiscal ? "Sin antigüedad" : "No aplica para consultores",
      };

  // Rescatar estrictamente los datos de la planilla calculada
  const basicEarnings = payroll ? Number(payroll.earnedSalary) : 0;
  const seniorityBonus = payroll ? Number(payroll.seniorityBonus) : 0;
  const otherBonusesTotal = payroll ? Number(payroll.otherBonuses) : 0;
  const totalEarned = payroll ? Number(payroll.grossPay) : 0;
  const gestoraDeduction = payroll ? Number(payroll.afpDeduction) : 0;
  const deudasDeduction = payroll ? Number(payroll.absenceDeduction) : 0;
  const anticiposDeduction = payroll ? Number(payroll.advanceDeduction) : 0;
  const totalDeductions = payroll ? Number(payroll.totalDeductions) : 0;
  const netPayable = payroll ? Number(payroll.netSalary) : 0;

  // Historial de nóminas de meses anteriores
  const history = await prisma.payroll.findMany({
    where: {
      employeeId,
      NOT: {
        AND: [
          { year: targetYear },
          { month: targetMonth },
        ],
      },
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
    include: {
      contractCompany: true,
      consolidatedCompany: true,
    },
  });

  const formattedHistory = history.map((h) => ({
    id: h.id,
    year: h.year,
    month: h.month,
    baseSalary: Number(h.baseSalary),
    workedDays: Number(h.workedDays),
    earnedSalary: Number(h.earnedSalary),
    seniorityBonus: Number(h.seniorityBonus),
    otherBonuses: Number(h.otherBonuses),
    grossPay: Number(h.grossPay),
    afpDeduction: Number(h.afpDeduction),
    absenceDeduction: Number(h.absenceDeduction),
    advanceDeduction: Number(h.advanceDeduction),
    totalDeductions: Number(h.totalDeductions),
    netSalary: Number(h.netSalary),
    status: h.status,
    contractCompanyName: h.contractCompany?.name || "",
  }));

  return {
    year: targetYear,
    month: targetMonth,
    baseSalary,
    workedDays,
    basicEarnings,
    seniorityBonus,
    seniorityDescription: seniorityDetails.description,
    otherBonuses: otherBonusesTotal,
    bonuses: formattedBonuses,
    totalEarned,
    gestoraDeduction,
    deudasDeduction,
    anticiposDeduction,
    totalDeductions,
    netPayable,
    isFiscal,
    history: formattedHistory,
  };
};

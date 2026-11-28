import prisma from "../config/db";
import { getSeniorityBonusDetails } from "./payroll.repository";

function parseDate(value: any): Date | null {
  if (!value) return null;
  const str = typeof value === "string" ? value.split("T")[0] : value.toISOString().split("T")[0];
  const [year, month, day] = str.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * Calcula los meses y días trabajados para un contrato en el año dado (base comercial de 30 días)
 * Reglas:
 * - Si hireDate <= 1 de enero del año: 12 meses y 0 días
 * - Si hireDate >= 2 de enero del año:
 *   - Meses completos desde (mesIngreso + 1) hasta diciembre (mes 12)
 *   - Días del mes de ingreso: 30 - diaIngreso + 1
 */
export function calculateChristmasWorkedPeriod(hireDateInput: any, year: number): { workedMonths: number; workedDays: number } {
  const hireDate = parseDate(hireDateInput);
  if (!hireDate) return { workedMonths: 0, workedDays: 0 };

  const hireYear = hireDate.getFullYear();
  const hireMonth = hireDate.getMonth() + 1; // 1 - 12
  const hireDay = hireDate.getDate();

  // Si fue contratado en un año anterior o el 1 de enero del año vigente
  if (hireYear < year || (hireYear === year && hireMonth === 1 && hireDay === 1)) {
    return { workedMonths: 12, workedDays: 0 };
  }

  // Si fue contratado en el año vigente a partir del 2 de enero
  if (hireYear === year) {
    if (hireDay === 1) {
      const fullMonths = 12 - hireMonth + 1;
      return { workedMonths: fullMonths, workedDays: 0 };
    }

    const daysInStartMonth = 30 - hireDay + 1;
    const remainingFullMonths = 12 - hireMonth; // Meses de (hireMonth + 1) hasta 12

    return {
      workedMonths: Math.max(0, remainingFullMonths),
      workedDays: Math.max(0, daysInStartMonth),
    };
  }

  return { workedMonths: 0, workedDays: 0 };
}

/**
 * Obtiene la lista de aguinaldos calculados o finalizados para una empresa y año.
 */
export async function getChristmasBonusesRepository(companyId: number, year: number) {
  // 1. Si ya está finalizada en BD, devolver los registros históricos inmutables
  const existingFinalized = await prisma.christmasBonus.findMany({
    where: {
      companyId,
      year,
      status: { in: ["APPROVED", "PAID", "CLOSED"] },
    },
    include: {
      employee: {
        include: {
          contracts: {
            where: { isActive: true },
            include: {
              contractJobTitle: true,
              jobTitle: true,
              branch: { include: { city: true } },
              city: true,
            },
          },
        },
      },
      contract: {
        include: {
          contractJobTitle: true,
          jobTitle: true,
          branch: { include: { city: true } },
          city: true,
        },
      },
    },
    orderBy: [
      { employee: { lastNames: "asc" } },
      { employee: { firstNames: "asc" } },
    ],
  });

  if (existingFinalized.length > 0) {
    return {
      isFinalized: true,
      data: existingFinalized.map((item) => {
        const c = item.contract || (item.employee.contracts ? item.employee.contracts[0] : null);
        return {
          id: item.id,
          employeeId: item.employeeId,
          contractId: item.contractId,
          employeeName: `${item.employee.lastNames} ${item.employee.firstNames}`.trim(),
          employeeDocumentNumber: item.employee.documentNumber,
          employeeCiExtension: item.employee.ciExtension,
          contractJobTitleName: c?.contractJobTitle?.name || c?.jobTitle?.name || "Sin cargo",
          hireDate: c?.hireDate ? c.hireDate.toISOString().split("T")[0] : null,
          employeeType: "Fiscal",
          averageBaseSalary: Number(item.averageBaseSalary),
          averageSeniorityBonus: Number(item.averageSeniorityBonus),
          averageOtherBonuses: Number(item.averageOtherBonuses),
          averageGrossPay: Number(item.averageGrossPay),
          workedMonths: item.workedMonths,
          workedDays: item.workedDays,
          christmasBonusAmount: Number(item.bonusAmount),
          status: item.status,
          isFinalized: true,
        };
      }),
    };
  }

  // 2. Cálculo dinámico asumiendo 30 DÍAS COMPLETOS para Octubre, Noviembre y Diciembre
  // Elegibles: Tipo de contrato FISCAL, de la empresa dada, ingreso máximo 1 de octubre del año
  const cutoffHireDate = new Date(year, 9, 1, 23, 59, 59); // 1 de Octubre inclusive
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const activeFiscalContracts = await prisma.employeeContract.findMany({
    where: {
      contractCompanyId: companyId,
      contractType: "INDEFINITE", // Fiscal
      hireDate: { lte: cutoffHireDate },
      OR: [
        { endDate: null },
        { endDate: { gte: endOfYear } },
      ],
      employee: {
        status: "ACTIVE",
      },
    },
    include: {
      employee: {
        include: {
          bonuses: {
            where: { isActive: true },
          },
        },
      },
      contractJobTitle: true,
      jobTitle: true,
      branch: { include: { city: true } },
      city: true,
    },
    orderBy: [
      { employee: { lastNames: "asc" } },
      { employee: { firstNames: "asc" } },
    ],
  });

  const calculatedRows = activeFiscalContracts.map((contract) => {
    const emp = contract.employee;
    const baseSalary = Number(contract.baseSalary || 0);

    // =========================================================================
    // A) HABER BÁSICO DE CADA MES ASUMIENDO 30 DÍAS COMPLETOS
    // =========================================================================
    // Para octubre, noviembre y diciembre a 30 días, el ganado básico es baseSalary
    const octEarned = baseSalary;
    const novEarned = baseSalary;
    const dicEarned = baseSalary;
    const averageBaseSalary = Number(((octEarned + novEarned + dicEarned) / 3).toFixed(2));

    // =========================================================================
    // B) BONO DE ANTIGÜEDAD DE CADA MES ASUMIENDO 30 DÍAS COMPLETOS
    // Reutiliza exactamente la misma función `getSeniorityBonusDetails` de las planillas
    // evaluando al último día de cada mes (31 oct, 30 nov, 31 dic)
    // =========================================================================
    const octDate = new Date(year, 9, 31);
    const novDate = new Date(year, 10, 30);
    const dicDate = new Date(year, 11, 31);

    const octSeniority = getSeniorityBonusDetails(contract, baseSalary, octDate).amount;
    const novSeniority = getSeniorityBonusDetails(contract, baseSalary, novDate).amount;
    const dicSeniority = getSeniorityBonusDetails(contract, baseSalary, dicDate).amount;
    const averageSeniorityBonus = Number(((octSeniority + novSeniority + dicSeniority) / 3).toFixed(2));

    // =========================================================================
    // C) OTROS BONOS ASUMIENDO 30 DÍAS COMPLETOS
    // Suma de bonos activos del empleado (employee_bonuses) a 30 días en cada mes
    // =========================================================================
    const monthlyOtherBonuses = (emp.bonuses || []).reduce((acc: number, b: any) => {
      return acc + (Number(b.amount) || 0);
    }, 0);

    const octOther = monthlyOtherBonuses;
    const novOther = monthlyOtherBonuses;
    const dicOther = monthlyOtherBonuses;
    const averageOtherBonuses = Number(((octOther + novOther + dicOther) / 3).toFixed(2));

    // =========================================================================
    // D) PROMEDIO TOTAL GANADO = Suma de los 3 promedios
    // =========================================================================
    const averageGrossPay = Number((averageBaseSalary + averageSeniorityBonus + averageOtherBonuses).toFixed(2));

    // =========================================================================
    // E) MESES Y DÍAS TRABAJADOS (Base comercial 30 días)
    // =========================================================================
    const { workedMonths, workedDays } = calculateChristmasWorkedPeriod(contract.hireDate, year);

    // =========================================================================
    // F) DUODÉCIMAS:
    // Aguinaldo Meses = (Salario Promedio / 12) * Meses
    // Aguinaldo Días = (Salario Promedio / 360) * Días
    // =========================================================================
    const bonusMonths = (averageGrossPay / 12) * workedMonths;
    const bonusDays = (averageGrossPay / 360) * workedDays;
    const christmasBonusAmount = Number((bonusMonths + bonusDays).toFixed(2));

    return {
      id: contract.id,
      employeeId: emp.id,
      contractId: contract.id,
      employeeName: `${emp.lastNames} ${emp.firstNames}`.trim(),
      employeeDocumentNumber: emp.documentNumber,
      employeeCiExtension: emp.ciExtension,
      contractJobTitleName: contract.contractJobTitle?.name || contract.jobTitle?.name || "Sin cargo",
      hireDate: contract.hireDate ? contract.hireDate.toISOString().split("T")[0] : null,
      employeeType: "Fiscal",
      averageBaseSalary,
      averageSeniorityBonus,
      averageOtherBonuses,
      averageGrossPay,
      workedMonths,
      workedDays,
      christmasBonusAmount,
      status: "DRAFT",
      isFinalized: false,
    };
  });

  return {
    isFinalized: false,
    data: calculatedRows,
  };
}

/**
 * Finaliza y congela la planilla de aguinaldos para una empresa y año.
 */
export async function finalizeChristmasBonusesRepository(companyId: number, year: number) {
  const { data: rowsToFinalize } = await getChristmasBonusesRepository(companyId, year);

  if (!rowsToFinalize || rowsToFinalize.length === 0) {
    throw new Error("No hay empleados elegibles para generar y finalizar la planilla de aguinaldos.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.christmasBonus.deleteMany({
      where: {
        companyId,
        year,
      },
    });

    const created = [];
    for (const row of rowsToFinalize) {
      const record = await tx.christmasBonus.create({
        data: {
          employeeId: row.employeeId,
          contractId: row.contractId,
          companyId,
          year,
          averageBaseSalary: row.averageBaseSalary,
          averageSeniorityBonus: row.averageSeniorityBonus,
          averageOtherBonuses: row.averageOtherBonuses,
          averageGrossPay: row.averageGrossPay,
          workedMonths: row.workedMonths,
          workedDays: row.workedDays,
          bonusAmount: row.christmasBonusAmount,
          status: "PAID",
        },
      });
      created.push(record);
    }

    return created;
  });
}

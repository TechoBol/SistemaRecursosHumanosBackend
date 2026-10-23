import { Request, Response } from "express";
import {
  getPayrollsByPeriodAndCompany,
  syncPayrollsForPeriod,
  updatePayroll,
  finalizePayrollForPeriod,
  getEmployeeSalarySummary,
} from "../repository/payroll.repository";

export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
    const companyId = req.query.companyId ? Number(req.query.companyId) : null;
    const companyType = req.query.companyType === "consolidated" ? "consolidated" : "contract";

    if (!companyId || isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({
        message: "Debe proporcionar una empresa válida para filtrar las nóminas.",
      });
    }

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        message: "El año y mes especificados no son válidos.",
      });
    }

    const payrolls = await getPayrollsByPeriodAndCompany(
      year,
      month,
      companyId,
      companyType
    );

    let formattedPayrolls = payrolls.map((p) => {
      const activeContract = p.employee.contracts ? p.employee.contracts[0] : null;
      const branchCity = (activeContract?.branch as any)?.city;
      return {
        id: p.id,
        employeeId: p.employeeId,
        employeeFirstNames: p.employee.firstNames,
        employeeLastNames: p.employee.lastNames,
        employeeName: `${p.employee.lastNames} ${p.employee.firstNames}`.trim(),
        employeeDocumentNumber: p.employee.documentNumber,
        hireDate: activeContract?.hireDate ? activeContract.hireDate.toISOString().split("T")[0] : null,
        employeeType: activeContract?.contractType === "CONSULTING" ? "Consultor" : "Fiscal",
        jobTitleName:
          companyType === "contract"
            ? activeContract?.contractJobTitle?.name || "Sin cargo"
            : activeContract?.jobTitle?.name || "Sin cargo",
        contractJobTitleName: activeContract?.contractJobTitle?.name || "Sin cargo",
        branchId: activeContract?.branchId || 0,
        branchName: activeContract?.branch?.name || "Sin Sucursal",
        cityId: activeContract?.branch?.cityId || branchCity?.id || 0,
        cityName: branchCity?.name || "Sin Ciudad",
        contractCompanyId: p.contractCompanyId,
        contractCompanyName: p.contractCompany.name,
        consolidatedCompanyId: p.consolidatedCompanyId,
        consolidatedCompanyName: p.consolidatedCompany.name,
        year: p.year,
        month: p.month,
        baseSalary: Number(p.baseSalary),
        workedDays: Number(p.workedDays),
        earnedSalary: Number(p.earnedSalary),
        seniorityBonus: Number(p.seniorityBonus),
        otherBonuses: Number(p.otherBonuses),
        grossPay: Number(p.grossPay),
        afpDeduction: Number(p.afpDeduction),
        absenceDeduction: Number(p.absenceDeduction),
        advanceDeduction: Number(p.advanceDeduction),
        totalDeductions: Number(p.totalDeductions),
        netSalary: Number(p.netSalary),
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    if (companyType === "contract") {
      formattedPayrolls = formattedPayrolls.filter(
        (p) => p.employeeType !== "Consultor"
      );
    }

    return res.json(formattedPayrolls);
  } catch (error) {
    console.error("Error getting payrolls:", error);
    return res.status(500).json({
      message: "Ocurrió un error al obtener la nómina de empleados.",
    });
  }
};

export const updatePayrollController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la nómina no es válido.",
      });
    }

    const { workedDays, otherBonuses, absenceDeduction, advanceDeduction, status } = req.body;

    const updateData: any = {};
    if (workedDays !== undefined) updateData.workedDays = Number(workedDays);
    if (otherBonuses !== undefined) updateData.otherBonuses = Number(otherBonuses);
    if (absenceDeduction !== undefined) updateData.absenceDeduction = Number(absenceDeduction);
    if (advanceDeduction !== undefined) updateData.advanceDeduction = Number(advanceDeduction);
    if (status !== undefined) updateData.status = status;

    const updated = await updatePayroll(id, updateData);
    const activeContract = updated.employee.contracts ? updated.employee.contracts[0] : null;
    const branchCity = (activeContract?.branch as any)?.city;

    return res.json({
      message: "Nómina actualizada correctamente",
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        employeeFirstNames: updated.employee.firstNames,
        employeeLastNames: updated.employee.lastNames,
        employeeName: `${updated.employee.lastNames} ${updated.employee.firstNames}`.trim(),
        employeeDocumentNumber: updated.employee.documentNumber,
        hireDate: activeContract?.hireDate ? activeContract.hireDate.toISOString().split("T")[0] : null,
        employeeType: activeContract?.contractType === "CONSULTING" ? "Consultor" : "Fiscal",
        jobTitleName: activeContract?.jobTitle?.name || "Sin cargo",
        contractJobTitleName: activeContract?.contractJobTitle?.name || "Sin cargo",
        branchId: activeContract?.branchId || 0,
        branchName: activeContract?.branch?.name || "Sin Sucursal",
        cityId: activeContract?.branch?.cityId || branchCity?.id || 0,
        cityName: branchCity?.name || "Sin Ciudad",
        contractCompanyId: updated.contractCompanyId,
        contractCompanyName: updated.contractCompany.name,
        consolidatedCompanyId: updated.consolidatedCompanyId,
        consolidatedCompanyName: updated.consolidatedCompany.name,
        year: updated.year,
        month: updated.month,
        baseSalary: Number(updated.baseSalary),
        workedDays: Number(updated.workedDays),
        earnedSalary: Number(updated.earnedSalary),
        seniorityBonus: Number(updated.seniorityBonus),
        otherBonuses: Number(updated.otherBonuses),
        grossPay: Number(updated.grossPay),
        afpDeduction: Number(updated.afpDeduction),
        absenceDeduction: Number(updated.absenceDeduction),
        advanceDeduction: Number(updated.advanceDeduction),
        totalDeductions: Number(updated.totalDeductions),
        netSalary: Number(updated.netSalary),
        status: updated.status,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating payroll:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el registro de la nómina.",
    });
  }
};

export const generatePayrollsController = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.body;
    const targetYear = Number(year) || new Date().getFullYear();
    const targetMonth = Number(month) || new Date().getMonth() + 1;

    await syncPayrollsForPeriod(targetYear, targetMonth);

    return res.json({
      message: `Nóminas sincronizadas correctamente para el período ${targetMonth}/${targetYear}`,
    });
  } catch (error) {
    console.error("Error generating payrolls:", error);
    return res.status(500).json({
      message: "No se pudieron sincronizar las nóminas para el período especificado.",
    });
  }
};

export const finalizePayrollController = async (req: Request, res: Response) => {
  try {
    const { year, month, companyId, companyType } = req.body;
    const targetYear = Number(year);
    const targetMonth = Number(month);
    const targetCompanyId = Number(companyId);
    const cType = companyType === "consolidated" ? "consolidated" : "contract";

    if (!targetCompanyId || isNaN(targetCompanyId) || targetCompanyId <= 0) {
      return res.status(400).json({
        message: "Debe proporcionar una empresa válida para finalizar la planilla.",
      });
    }

    if (isNaN(targetYear) || isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        message: "El año y mes especificados no son válidos.",
      });
    }

    const now = new Date();
    const lastDayObj = new Date(targetYear, targetMonth, 0);
    const startOfLastDay = new Date(targetYear, targetMonth - 1, lastDayObj.getDate(), 0, 0, 0);

    if (now < startOfLastDay) {
      return res.status(400).json({
        message: `La planilla solo puede finalizarse a partir del último día del mes (${lastDayObj.getDate()}/${targetMonth}/${targetYear}).`,
      });
    }

    await finalizePayrollForPeriod(targetYear, targetMonth, targetCompanyId, cType);

    return res.json({
      message: `La planilla del período ${targetMonth}/${targetYear} ha sido finalizada correctamente.`,
    });
  } catch (error) {
    console.error("Error finalizing payroll:", error);
    return res.status(500).json({
      message: "No se pudo finalizar la planilla para el período especificado.",
    });
  }
};

export const getEmployeeSalarySummaryController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido.",
      });
    }

    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;

    if (year !== undefined && (isNaN(year) || year < 2000)) {
      return res.status(400).json({
        message: "El año especificado no es válido.",
      });
    }

    if (month !== undefined && (isNaN(month) || month < 1 || month > 12)) {
      return res.status(400).json({
        message: "El mes especificado no es válido.",
      });
    }

    const summary = await getEmployeeSalarySummary(employeeId, year, month);
    if (!summary) {
      return res.status(404).json({
        message: "Empleado no encontrado.",
      });
    }

    return res.json(summary);
  } catch (error) {
    console.error("Error getting employee salary summary:", error);
    return res.status(500).json({
      message: "Ocurrió un error al obtener el resumen salarial del empleado.",
    });
  }
};

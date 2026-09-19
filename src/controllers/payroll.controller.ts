import { Request, Response } from "express";
import {
  getPayrollsByPeriodAndCompany,
  syncPayrollsForPeriod,
  updatePayroll,
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

    const formattedPayrolls = payrolls.map((p) => {
      const activeContract = p.employee.contracts ? p.employee.contracts[0] : null;
      return {
        id: p.id,
        employeeId: p.employeeId,
        employeeName: `${p.employee.firstNames} ${p.employee.lastNames}`,
        employeeDocumentNumber: p.employee.documentNumber,
        hireDate: activeContract?.hireDate ? activeContract.hireDate.toISOString().split("T")[0] : null,
        employeeType: activeContract?.contractType === "CONSULTING" ? "Consultor" : "Fiscal",
        jobTitleName: activeContract?.jobTitle?.name || "Sin cargo",
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

    return res.json({
      message: "Nómina actualizada correctamente",
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        employeeName: `${updated.employee.firstNames} ${updated.employee.lastNames}`,
        employeeDocumentNumber: updated.employee.documentNumber,
        hireDate: activeContract?.hireDate ? activeContract.hireDate.toISOString().split("T")[0] : null,
        employeeType: activeContract?.contractType === "CONSULTING" ? "Consultor" : "Fiscal",
        jobTitleName: activeContract?.jobTitle?.name || "Sin cargo",
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

import { Request, Response } from "express";
import {
  createEmployeeRepository,
  deleteEmployeeRepository,
  getAllEmployeesRepository,
  getEmployeeByIdRepository,
  getEmployeeByDocumentRepository,
  updateEmployeeRepository,
} from "../repository/employee.repository";

export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await getAllEmployeesRepository();
    return res.json(employees);
  } catch (error) {
    console.error("Error getting employees:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los empleados",
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const employee = await getEmployeeByIdRepository(id);

    if (!employee) {
      return res.status(404).json({
        message: "Empleado no encontrado",
      });
    }

    return res.json(employee);
  } catch (error) {
    console.error("Error getting employee:", error);
    return res.status(500).json({
      message: "No se pudo obtener el empleado",
    });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      ci,
      birthDate,
      email,
      phone,
      address,
      contractCompanyId,
      contractJobTitleId,
      consolidatedCompanyId,
      employeeType,
      branchId,
      areaId,
      jobTitleId,
      contractDate,
      endDate,
      baseSalary,
      status,
    } = req.body;

    if (!firstName || !lastName || !ci || !contractCompanyId || !contractJobTitleId || !consolidatedCompanyId || !branchId || !areaId || !jobTitleId || !contractDate) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar al empleado",
      });
    }

    const trimmedCI = String(ci).trim();

    // Validar CI único
    const existingEmployee = await getEmployeeByDocumentRepository(trimmedCI);
    if (existingEmployee) {
      return res.status(409).json({
        message: "Ya existe un empleado registrado con esa Cédula de Identidad (CI)",
      });
    }

    // Mapear Tipo de Contrato
    const dbContractType = employeeType === "Consultor" ? "CONSULTING" : "INDEFINITE";

    const employeeData = {
      firstNames: String(firstName).trim(),
      lastNames: String(lastName).trim(),
      documentNumber: trimmedCI,
      birthDate: birthDate ? new Date(birthDate) : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      address: address ? String(address).trim() : null,
      status: status === "Inactivo" ? "INACTIVE" : "ACTIVE" as any,
    };

    const contractData = {
      contractCompanyId: Number(contractCompanyId),
      contractJobTitleId: Number(contractJobTitleId),
      consolidatedCompanyId: Number(consolidatedCompanyId),
      branchId: Number(branchId),
      areaId: Number(areaId),
      jobTitleId: Number(jobTitleId),
      contractType: dbContractType as any,
      hireDate: new Date(contractDate),
      endDate: endDate ? new Date(endDate) : null,
      baseSalary: baseSalary ? Number(baseSalary) : 0,
    };

    const employee = await createEmployeeRepository(employeeData, contractData);

    return res.status(201).json({
      message: "Empleado registrado correctamente",
      data: employee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({
      message: "No se pudo crear el empleado",
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const currentEmployee = await getEmployeeByIdRepository(id);
    if (!currentEmployee) {
      return res.status(404).json({
        message: "Empleado no encontrado",
      });
    }

    const {
      firstName,
      lastName,
      ci,
      birthDate,
      email,
      phone,
      address,
      contractCompanyId,
      contractJobTitleId,
      consolidatedCompanyId,
      employeeType,
      branchId,
      areaId,
      jobTitleId,
      contractDate,
      endDate,
      baseSalary,
      status,
    } = req.body;

    const employeeUpdateData: any = {};
    if (firstName !== undefined) employeeUpdateData.firstNames = String(firstName).trim();
    if (lastName !== undefined) employeeUpdateData.lastNames = String(lastName).trim();
    if (birthDate !== undefined) employeeUpdateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (email !== undefined) employeeUpdateData.email = email ? String(email).trim() : null;
    if (phone !== undefined) employeeUpdateData.phone = phone ? String(phone).trim() : null;
    if (address !== undefined) employeeUpdateData.address = address ? String(address).trim() : null;
    if (status !== undefined) {
      employeeUpdateData.status = status === "Inactivo" ? "INACTIVE" : "ACTIVE";
    }

    if (ci !== undefined) {
      const trimmedCI = String(ci).trim();
      const existingEmployee = await getEmployeeByDocumentRepository(trimmedCI);
      if (existingEmployee && existingEmployee.id !== id) {
        return res.status(409).json({
          message: "Ya existe otro empleado registrado con esa Cédula de Identidad (CI)",
        });
      }
      employeeUpdateData.documentNumber = trimmedCI;
    }

    let contractUpdateData: any = undefined;
    if (
      contractCompanyId !== undefined ||
      contractJobTitleId !== undefined ||
      consolidatedCompanyId !== undefined ||
      branchId !== undefined ||
      areaId !== undefined ||
      jobTitleId !== undefined ||
      employeeType !== undefined ||
      contractDate !== undefined ||
      endDate !== undefined ||
      baseSalary !== undefined ||
      status !== undefined
    ) {
      contractUpdateData = {};
      if (contractCompanyId !== undefined) contractUpdateData.contractCompanyId = Number(contractCompanyId);
      if (contractJobTitleId !== undefined) contractUpdateData.contractJobTitleId = Number(contractJobTitleId);
      if (consolidatedCompanyId !== undefined) contractUpdateData.consolidatedCompanyId = Number(consolidatedCompanyId);
      if (branchId !== undefined) contractUpdateData.branchId = Number(branchId);
      if (areaId !== undefined) contractUpdateData.areaId = Number(areaId);
      if (jobTitleId !== undefined) contractUpdateData.jobTitleId = Number(jobTitleId);
      if (employeeType !== undefined) {
        contractUpdateData.contractType = employeeType === "Consultor" ? "CONSULTING" : "INDEFINITE";
      }
      if (contractDate !== undefined) contractUpdateData.hireDate = new Date(contractDate);
      if (endDate !== undefined) contractUpdateData.endDate = endDate ? new Date(endDate) : null;
      if (baseSalary !== undefined) contractUpdateData.baseSalary = Number(baseSalary);
      if (status !== undefined) {
        contractUpdateData.status = status === "Inactivo" ? "ENDED" : "ACTIVE";
      }
    }

    const updatedEmployee = await updateEmployeeRepository(id, employeeUpdateData, contractUpdateData);

    return res.json({
      message: "Empleado actualizado correctamente",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el empleado",
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const employee = await getEmployeeByIdRepository(id);

    if (!employee) {
      return res.status(404).json({
        message: "Empleado no encontrado",
      });
    }

    await deleteEmployeeRepository(id);

    return res.json({
      message: "Empleado desactivado correctamente",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      message: "No se pudo desactivar el empleado",
    });
  }
};

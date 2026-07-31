import { Request, Response } from "express";
import {
  createCompanyRepository,
  deleteCompanyRepository,
  getAllCompaniesRepository,
  getCompanyByIdRepository,
  getCompanyByNameRepository,
  updateCompanyRepository,
} from "../repository/company.repository";

export const getCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await getAllCompaniesRepository();
    return res.json(companies);
  } catch (error) {
    console.error("Error getting companies:", error);
    return res.status(500).json({
      message: "No se pudieron obtener las empresas",
    });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la empresa no es válido",
      });
    }

    const company = await getCompanyByIdRepository(id);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    return res.json(company);
  } catch (error) {
    console.error("Error getting company:", error);
    return res.status(500).json({
      message: "No se pudo obtener la empresa",
    });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, legalName, taxId } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre de la empresa es obligatorio",
      });
    }

    const trimmedName = String(name).trim();

    const existingCompany = await getCompanyByNameRepository(trimmedName);

    if (existingCompany) {
      return res.status(409).json({
        message: "Ya existe una empresa registrada con ese nombre comercial",
      });
    }

    const company = await createCompanyRepository({
      name: trimmedName,
      legalName: legalName ? String(legalName).trim() : undefined,
      taxId: taxId ? String(taxId).trim() : undefined,
    });

    return res.status(201).json({
      message: "Empresa creada correctamente",
      data: company,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({
      message: "No se pudo crear la empresa",
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, legalName, taxId, isActive } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la empresa no es válido",
      });
    }

    const currentCompany = await getCompanyByIdRepository(id);

    if (!currentCompany) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    const data: {
      name?: string;
      legalName?: string;
      taxId?: string;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      const existingCompany = await getCompanyByNameRepository(trimmedName);

      if (existingCompany && existingCompany.id !== id) {
        return res.status(409).json({
          message: "Ya existe otra empresa registrada con ese nombre comercial",
        });
      }
      data.name = trimmedName;
    }

    if (legalName !== undefined) {
      data.legalName = String(legalName).trim();
    }

    if (taxId !== undefined) {
      data.taxId = String(taxId).trim();
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updatedCompany = await updateCompanyRepository(id, data);

    return res.json({
      message: "Empresa actualizada correctamente",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return res.status(500).json({
      message: "No se pudo actualizar la empresa",
    });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la empresa no es válido",
      });
    }

    const company = await getCompanyByIdRepository(id);

    if (!company) {
      return res.status(404).json({
        message: "Empresa no encontrada",
      });
    }

    await deleteCompanyRepository(id);

    return res.json({
      message: "Empresa desactivada correctamente",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return res.status(500).json({
      message: "No se pudo desactivar la empresa",
    });
  }
};

import { Request, Response } from "express";
import {
  createBranchRepository,
  deleteBranchRepository,
  getAllBranchesRepository,
  getBranchByIdRepository,
  getBranchByNameInCityRepository,
  updateBranchRepository,
} from "../repository/branch.repository";

export const getBranches = async (_req: Request, res: Response) => {
  try {
    const branches = await getAllBranchesRepository();
    return res.json(branches);
  } catch (error) {
    console.error("Error getting branches:", error);
    return res.status(500).json({
      message: "No se pudieron obtener las sucursales",
    });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la sucursal no es válido",
      });
    }

    const branch = await getBranchByIdRepository(id);

    if (!branch) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    return res.json(branch);
  } catch (error) {
    console.error("Error getting branch:", error);
    return res.status(500).json({
      message: "No se pudo obtener la sucursal",
    });
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, description, address, cityId, companyIds } = req.body;

    if (!name || !cityId) {
      return res.status(400).json({
        message: "El nombre y la ciudad de la sucursal son obligatorios",
      });
    }

    const trimmedName = String(name).trim();
    const cityIdNum = Number(cityId);

    const existingBranch = await getBranchByNameInCityRepository(trimmedName, cityIdNum);

    if (existingBranch) {
      return res.status(409).json({
        message: "Ya existe una sucursal con ese nombre en esta ciudad",
      });
    }

    const branch = await createBranchRepository({
      name: trimmedName,
      description: description ? String(description).trim() : undefined,
      address: address ? String(address).trim() : undefined,
      cityId: cityIdNum,
      companyIds: companyIds ? companyIds.map(Number) : [],
    });

    return res.status(201).json({
      message: "Sucursal creada correctamente",
      data: branch,
    });
  } catch (error) {
    console.error("Error creating branch:", error);
    return res.status(500).json({
      message: "No se pudo crear la sucursal",
    });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, address, cityId, isActive, companyIds } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la sucursal no es válido",
      });
    }

    const currentBranch = await getBranchByIdRepository(id);

    if (!currentBranch) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    const data: {
      name?: string;
      description?: string;
      address?: string;
      cityId?: number;
      isActive?: boolean;
      companyIds?: number[];
    } = {};

    if (name !== undefined || cityId !== undefined) {
      const targetName = name !== undefined ? String(name).trim() : currentBranch.name;
      const targetCityId = cityId !== undefined ? Number(cityId) : currentBranch.cityId;

      const existingBranch = await getBranchByNameInCityRepository(targetName, targetCityId);

      if (existingBranch && existingBranch.id !== id) {
        return res.status(409).json({
          message: "Ya existe otra sucursal registrada con ese nombre en esta ciudad",
        });
      }

      if (name !== undefined) data.name = targetName;
      if (cityId !== undefined) data.cityId = targetCityId;
    }

    if (description !== undefined) {
      data.description = String(description).trim();
    }

    if (address !== undefined) {
      data.address = String(address).trim();
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    if (companyIds !== undefined) {
      data.companyIds = companyIds.map(Number);
    }

    const updatedBranch = await updateBranchRepository(id, data);

    return res.json({
      message: "Sucursal actualizada correctamente",
      data: updatedBranch,
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    return res.status(500).json({
      message: "No se pudo actualizar la sucursal",
    });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la sucursal no es válido",
      });
    }

    const branch = await getBranchByIdRepository(id);

    if (!branch) {
      return res.status(404).json({
        message: "Sucursal no encontrada",
      });
    }

    await deleteBranchRepository(id);

    return res.json({
      message: "Sucursal desactivada correctamente",
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return res.status(500).json({
      message: "No se pudo desactivar la sucursal",
    });
  }
};

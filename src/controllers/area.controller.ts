import { Request, Response } from "express";
import {
  createAreaRepository,
  deleteAreaRepository,
  getAllAreasRepository,
  getAreaByIdRepository,
  getAreaByNameRepository,
  updateAreaRepository,
} from "../repository/area.repository";

export const getAreas = async (_req: Request, res: Response) => {
  try {
    const areas = await getAllAreasRepository();
    return res.json(areas);
  } catch (error) {
    console.error("Error getting areas:", error);
    return res.status(500).json({
      message: "No se pudieron obtener las áreas",
    });
  }
};

export const getAreaById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la área no es válido",
      });
    }

    const area = await getAreaByIdRepository(id);

    if (!area) {
      return res.status(404).json({
        message: "Área no encontrada",
      });
    }

    return res.json(area);
  } catch (error) {
    console.error("Error getting area:", error);
    return res.status(500).json({
      message: "No se pudo obtener el área",
    });
  }
};

export const createArea = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre de la área es obligatorio",
      });
    }

    const trimmedName = String(name).trim();

    const existingArea = await getAreaByNameRepository(trimmedName);

    if (existingArea) {
      return res.status(409).json({
        message: "Ya existe una área registrada con ese nombre",
      });
    }

    const area = await createAreaRepository({
      name: trimmedName,
      description: description ? String(description).trim() : undefined,
    });

    return res.status(201).json({
      message: "Área creada correctamente",
      data: area,
    });
  } catch (error) {
    console.error("Error creating area:", error);
    return res.status(500).json({
      message: "No se pudo crear el área",
    });
  }
};

export const updateArea = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, isActive } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la área no es válido",
      });
    }

    const currentArea = await getAreaByIdRepository(id);

    if (!currentArea) {
      return res.status(404).json({
        message: "Área no encontrada",
      });
    }

    const data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      const existingArea = await getAreaByNameRepository(trimmedName);

      if (existingArea && existingArea.id !== id) {
        return res.status(409).json({
          message: "Ya existe otra área registrada con ese nombre",
        });
      }
      data.name = trimmedName;
    }

    if (description !== undefined) {
      data.description = String(description).trim();
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updatedArea = await updateAreaRepository(id, data);

    return res.json({
      message: "Área actualizada correctamente",
      data: updatedArea,
    });
  } catch (error) {
    console.error("Error updating area:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el área",
    });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la área no es válido",
      });
    }

    const area = await getAreaByIdRepository(id);

    if (!area) {
      return res.status(404).json({
        message: "Área no encontrada",
      });
    }

    await deleteAreaRepository(id);

    return res.json({
      message: "Área desactivada correctamente",
    });
  } catch (error) {
    console.error("Error deleting area:", error);
    return res.status(500).json({
      message: "No se pudo desactivar el área",
    });
  }
};

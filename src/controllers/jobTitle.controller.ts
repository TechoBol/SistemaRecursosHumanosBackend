import { Request, Response } from "express";
import {
  createJobTitleRepository,
  deleteJobTitleRepository,
  getAllJobTitlesRepository,
  getJobTitleByIdRepository,
  getJobTitleByNameRepository,
  updateJobTitleRepository,
} from "../repository/jobTitle.repository";

export const getJobTitles = async (_req: Request, res: Response) => {
  try {
    const jobTitles = await getAllJobTitlesRepository();
    return res.json(jobTitles);
  } catch (error) {
    console.error("Error getting job titles:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los cargos",
    });
  }
};

export const getJobTitleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del cargo no es válido",
      });
    }

    const jobTitle = await getJobTitleByIdRepository(id);

    if (!jobTitle) {
      return res.status(404).json({
        message: "Cargo no encontrado",
      });
    }

    return res.json(jobTitle);
  } catch (error) {
    console.error("Error getting job title:", error);
    return res.status(500).json({
      message: "No se pudo obtener el cargo",
    });
  }
};

export const createJobTitle = async (req: Request, res: Response) => {
  try {
    const { name, description, areaIds } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre del cargo es obligatorio",
      });
    }

    if (!areaIds || !Array.isArray(areaIds) || areaIds.length === 0) {
      return res.status(400).json({
        message: "Debes seleccionar al menos un área para el cargo",
      });
    }

    const trimmedName = String(name).trim();

    const existingJob = await getJobTitleByNameRepository(trimmedName);

    if (existingJob) {
      return res.status(409).json({
        message: "Ya existe un cargo registrado con ese nombre",
      });
    }

    const jobTitle = await createJobTitleRepository({
      name: trimmedName,
      description: description ? String(description).trim() : undefined,
      areaIds: areaIds.map(Number),
    });

    return res.status(201).json({
      message: "Cargo creado correctamente",
      data: jobTitle,
    });
  } catch (error) {
    console.error("Error creating job title:", error);
    return res.status(500).json({
      message: "No se pudo crear el cargo",
    });
  }
};

export const updateJobTitle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, isActive, areaIds } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del cargo no es válido",
      });
    }

    const currentJob = await getJobTitleByIdRepository(id);

    if (!currentJob) {
      return res.status(404).json({
        message: "Cargo no encontrado",
      });
    }

    const data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      areaIds?: number[];
    } = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      const existingJob = await getJobTitleByNameRepository(trimmedName);

      if (existingJob && existingJob.id !== id) {
        return res.status(409).json({
          message: "Ya existe otro cargo registrado con ese nombre",
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

    if (areaIds !== undefined) {
      if (!Array.isArray(areaIds) || areaIds.length === 0) {
        return res.status(400).json({
          message: "Debes seleccionar al menos un área para el cargo",
        });
      }
      data.areaIds = areaIds.map(Number);
    }

    const updatedJob = await updateJobTitleRepository(id, data);

    return res.json({
      message: "Cargo actualizado correctamente",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job title:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el cargo",
    });
  }
};

export const deleteJobTitle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del cargo no es válido",
      });
    }

    const jobTitle = await getJobTitleByIdRepository(id);

    if (!jobTitle) {
      return res.status(404).json({
        message: "Cargo no encontrado",
      });
    }

    await deleteJobTitleRepository(id);

    return res.json({
      message: "Cargo desactivado correctamente",
    });
  } catch (error) {
    console.error("Error deleting job title:", error);
    return res.status(500).json({
      message: "No se pudo desactivar el cargo",
    });
  }
};

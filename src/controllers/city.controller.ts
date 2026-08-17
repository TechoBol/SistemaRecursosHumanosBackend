import { Request, Response } from "express";
import {
  createCityRepository,
  deleteCityRepository,
  getAllCitiesRepository,
  getCityByIdRepository,
  getCityByNameRepository,
  updateCityRepository,
} from "../repository/city.repository";

export const getCities = async (_req: Request, res: Response) => {
  try {
    const cities = await getAllCitiesRepository();
    return res.json(cities);
  } catch (error) {
    console.error("Error getting cities:", error);
    return res.status(500).json({
      message: "No se pudieron obtener las ciudades",
    });
  }
};

export const getCityById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la ciudad no es válido",
      });
    }

    const city = await getCityByIdRepository(id);

    if (!city) {
      return res.status(404).json({
        message: "Ciudad no encontrada",
      });
    }

    return res.json(city);
  } catch (error) {
    console.error("Error getting city:", error);
    return res.status(500).json({
      message: "No se pudo obtener la ciudad",
    });
  }
};

export const createCity = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre de la ciudad es obligatorio",
      });
    }

    const trimmedName = String(name).trim();

    const existingCity = await getCityByNameRepository(trimmedName);

    if (existingCity) {
      return res.status(409).json({
        message: "Ya existe una ciudad registrada con ese nombre",
      });
    }

    const city = await createCityRepository({
      name: trimmedName,
    });

    return res.status(201).json({
      message: "Ciudad creada correctamente",
      data: city,
    });
  } catch (error) {
    console.error("Error creating city:", error);
    return res.status(500).json({
      message: "No se pudo crear la ciudad",
    });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la ciudad no es válido",
      });
    }

    const currentCity = await getCityByIdRepository(id);

    if (!currentCity) {
      return res.status(404).json({
        message: "Ciudad no encontrada",
      });
    }

    const data: {
      name?: string;
      isActive?: boolean;
    } = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      const existingCity = await getCityByNameRepository(trimmedName);

      if (existingCity && existingCity.id !== id) {
        return res.status(409).json({
          message: "Ya existe otra ciudad registrada con ese nombre",
        });
      }
      data.name = trimmedName;
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updatedCity = await updateCityRepository(id, data);

    return res.json({
      message: "Ciudad actualizada correctamente",
      data: updatedCity,
    });
  } catch (error) {
    console.error("Error updating city:", error);
    return res.status(500).json({
      message: "No se pudo actualizar la ciudad",
    });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la ciudad no es válido",
      });
    }

    const city = await getCityByIdRepository(id);

    if (!city) {
      return res.status(404).json({
        message: "Ciudad no encontrada",
      });
    }

    await deleteCityRepository(id);

    return res.json({
      message: "Ciudad desactivada correctamente",
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    return res.status(500).json({
      message: "No se pudo desactivar la ciudad",
    });
  }
};

import { Request, Response } from "express";
import {
  createBonus,
  deleteBonus,
  getBonusesByEmployeeId,
  updateBonus,
} from "../repository/employeeBonus.repository";

export const getBonuses = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const dbBonuses = await getBonusesByEmployeeId(employeeId);
    const bonuses = dbBonuses.map((bonus) => ({
      id: bonus.id,
      employeeId: bonus.employeeId,
      name: bonus.name,
      amount: Number(bonus.amount),
      isActive: bonus.isActive,
      createdAt: bonus.createdAt,
      updatedAt: bonus.updatedAt,
    }));

    return res.json(bonuses);
  } catch (error) {
    console.error("Error getting employee bonuses:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los bonos del empleado",
    });
  }
};

export const createBonusController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { name, amount } = req.body;

    if (!name || amount === undefined) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar el bono",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        message: "El monto del bono debe ser un número válido",
      });
    }

    const newBonus = await createBonus(employeeId, {
      name: String(name).trim(),
      amount: numericAmount,
    });

    return res.status(201).json({
      message: "Bono creado correctamente",
      data: {
        ...newBonus,
        amount: Number(newBonus.amount),
      },
    });
  } catch (error) {
    console.error("Error creating employee bonus:", error);
    return res.status(500).json({
      message: "No se pudo crear el bono",
    });
  }
};

export const updateBonusController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del bono no es válido",
      });
    }

    const { name, amount, isActive } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          message: "El monto del bono debe ser un número válido",
        });
      }
      updateData.amount = numericAmount;
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await updateBonus(id, updateData);

    return res.json({
      message: "Bono actualizado correctamente",
      data: {
        ...updated,
        amount: Number(updated.amount),
      },
    });
  } catch (error) {
    console.error("Error updating employee bonus:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el bono",
    });
  }
};

export const deleteBonusController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del bono no es válido",
      });
    }

    await deleteBonus(id);

    return res.json({
      message: "Bono eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting employee bonus:", error);
    return res.status(500).json({
      message: "No se pudo eliminar el bono",
    });
  }
};

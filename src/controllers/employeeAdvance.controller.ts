import { Request, Response } from "express";
import {
  createAdvance,
  deleteAdvance,
  getAdvancesByEmployeeId,
  updateAdvance,
} from "../repository/employeeAdvance.repository";
import { AdvanceType } from "@prisma/client";

const TYPE_MAP: Record<string, AdvanceType> = {
  salary: AdvanceType.SALARY,
  debt: AdvanceType.DEBT,
};

const REVERSE_TYPE_MAP: Record<AdvanceType, string> = {
  [AdvanceType.SALARY]: "salary",
  [AdvanceType.DEBT]: "debt",
};

export const getAdvances = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const dbAdvances = await getAdvancesByEmployeeId(employeeId);
    const advances = dbAdvances.map((adv) => ({
      id: adv.id,
      employeeId: adv.employeeId,
      type: REVERSE_TYPE_MAP[adv.type] || "salary",
      amount: Number(adv.amount),
      date: adv.advanceDate.toISOString().split("T")[0],
      notes: adv.notes || "",
      registeredBy: adv.registeredBy,
      createdAt: adv.createdAt,
      updatedAt: adv.updatedAt,
    }));

    return res.json(advances);
  } catch (error) {
    console.error("Error getting employee advances:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los anticipos de sueldo",
    });
  }
};

export const createAdvanceController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { type, amount, date, notes, registeredBy } = req.body;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0 || !date || !registeredBy) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar el anticipo",
      });
    }

    const advanceDate = new Date(date + "T00:00:00");
    if (isNaN(advanceDate.getTime())) {
      return res.status(400).json({
        message: "La fecha proporcionada no es válida",
      });
    }

    const advanceType = type && TYPE_MAP[type] ? TYPE_MAP[type] : AdvanceType.SALARY;

    const newAdvance = await createAdvance(employeeId, {
      type: advanceType,
      amount: parsedAmount,
      advanceDate,
      notes: notes ? String(notes).trim() : null,
      registeredBy: String(registeredBy).trim(),
    });

    return res.status(201).json({
      message: "Anticipo registrado correctamente",
      data: {
        id: newAdvance.id,
        employeeId: newAdvance.employeeId,
        type: REVERSE_TYPE_MAP[newAdvance.type],
        amount: Number(newAdvance.amount),
        date: newAdvance.advanceDate.toISOString().split("T")[0],
        notes: newAdvance.notes || "",
        registeredBy: newAdvance.registeredBy,
        createdAt: newAdvance.createdAt,
        updatedAt: newAdvance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating employee advance:", error);
    return res.status(500).json({
      message: "No se pudo registrar el anticipo de sueldo",
    });
  }
};

export const updateAdvanceController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del anticipo no es válido",
      });
    }

    const { type, amount, date, notes, registeredBy } = req.body;
    const updateData: any = {};

    if (type !== undefined) {
      updateData.type = TYPE_MAP[type] || AdvanceType.SALARY;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          message: "El monto ingresado no es válido",
        });
      }
      updateData.amount = parsedAmount;
    }

    if (date !== undefined) {
      const advanceDate = new Date(date + "T00:00:00");
      if (isNaN(advanceDate.getTime())) {
        return res.status(400).json({
          message: "La fecha proporcionada no es válida",
        });
      }
      updateData.advanceDate = advanceDate;
    }

    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null;
    if (registeredBy !== undefined) updateData.registeredBy = String(registeredBy).trim();

    const updated = await updateAdvance(id, updateData);

    return res.json({
      message: "Anticipo actualizado correctamente",
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        type: REVERSE_TYPE_MAP[updated.type],
        amount: Number(updated.amount),
        date: updated.advanceDate.toISOString().split("T")[0],
        notes: updated.notes || "",
        registeredBy: updated.registeredBy,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating employee advance:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el anticipo de sueldo",
    });
  }
};

export const deleteAdvanceController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del anticipo no es válido",
      });
    }

    await deleteAdvance(id);

    return res.json({
      message: "Anticipo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting employee advance:", error);
    return res.status(500).json({
      message: "No se pudo eliminar el anticipo de sueldo",
    });
  }
};

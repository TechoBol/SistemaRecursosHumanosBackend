import { Request, Response } from "express";
import {
  createVacation,
  deleteVacation,
  getVacationsByEmployeeId,
  updateVacation,
} from "../repository/vacation.repository";
import { VacationType } from "@prisma/client";

const TYPE_MAP: Record<string, VacationType> = {
  days: VacationType.DAYS,
  money: VacationType.MONEY,
};

const REVERSE_TYPE_MAP: Record<VacationType, string> = {
  [VacationType.DAYS]: "days",
  [VacationType.MONEY]: "money",
};

export const getVacations = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const dbVacations = await getVacationsByEmployeeId(employeeId);
    const vacations = dbVacations.map((vac) => ({
      id: vac.id,
      employeeId: vac.employeeId,
      type: REVERSE_TYPE_MAP[vac.type] || "days",
      amount: vac.amount ? Number(vac.amount) : null,
      startDate: vac.startDate.toISOString().split("T")[0],
      endDate: vac.endDate ? vac.endDate.toISOString().split("T")[0] : null,
      days: Number(vac.days),
      status: vac.status,
      notes: vac.notes || "",
      registeredBy: vac.registeredBy || "",
      createdAt: vac.createdAt,
      updatedAt: vac.updatedAt,
    }));

    return res.json(vacations);
  } catch (error) {
    console.error("Error getting employee vacations:", error);
    return res.status(500).json({
      message: "No se pudieron obtener las vacaciones del empleado",
    });
  }
};

export const createVacationController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { type, amount, startDate, endDate, days, notes, registeredBy } = req.body;
    const parsedDays = Number(days);

    if (isNaN(parsedDays) || parsedDays <= 0 || !startDate) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar la vacación",
      });
    }

    const startDateTime = new Date(startDate + "T00:00:00");
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        message: "La fecha de inicio no es válida",
      });
    }

    let endDateTime: Date | null = null;
    if (type !== "money" && endDate) {
      endDateTime = new Date(endDate + "T00:00:00");
      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({
          message: "La fecha de fin no es válida",
        });
      }
    }

    const vacType = type && TYPE_MAP[type] ? TYPE_MAP[type] : VacationType.DAYS;
    const parsedAmount = amount !== undefined && amount !== null && amount !== "" ? Number(amount) : null;

    const newVacation = await createVacation(employeeId, {
      type: vacType,
      amount: parsedAmount,
      startDate: startDateTime,
      endDate: endDateTime,
      days: parsedDays,
      notes: notes ? String(notes).trim() : null,
      registeredBy: registeredBy ? String(registeredBy).trim() : null,
    });

    return res.status(201).json({
      message: "Vacación registrada correctamente",
      data: {
        id: newVacation.id,
        employeeId: newVacation.employeeId,
        type: REVERSE_TYPE_MAP[newVacation.type],
        amount: newVacation.amount ? Number(newVacation.amount) : null,
        startDate: newVacation.startDate.toISOString().split("T")[0],
        endDate: newVacation.endDate ? newVacation.endDate.toISOString().split("T")[0] : null,
        days: Number(newVacation.days),
        status: newVacation.status,
        notes: newVacation.notes || "",
        registeredBy: newVacation.registeredBy || "",
        createdAt: newVacation.createdAt,
        updatedAt: newVacation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating employee vacation:", error);
    return res.status(500).json({
      message: "No se pudo registrar la vacación",
    });
  }
};

export const updateVacationController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la vacación no es válido",
      });
    }

    const { type, amount, startDate, endDate, days, notes, registeredBy } = req.body;
    const updateData: any = {};

    if (type !== undefined) {
      updateData.type = TYPE_MAP[type] || VacationType.DAYS;
    }

    if (days !== undefined) {
      const parsedDays = Number(days);
      if (isNaN(parsedDays) || parsedDays <= 0) {
        return res.status(400).json({
          message: "La cantidad de días no es válida",
        });
      }
      updateData.days = parsedDays;
    }

    if (amount !== undefined) {
      updateData.amount = amount !== null && amount !== "" ? Number(amount) : null;
    }

    if (startDate !== undefined) {
      const startDateTime = new Date(startDate + "T00:00:00");
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({
          message: "La fecha de inicio no es válida",
        });
      }
      updateData.startDate = startDateTime;
    }

    if (endDate !== undefined) {
      if (endDate) {
        const endDateTime = new Date(endDate + "T00:00:00");
        if (isNaN(endDateTime.getTime())) {
          return res.status(400).json({
            message: "La fecha de fin no es válida",
          });
        }
        updateData.endDate = endDateTime;
      } else {
        updateData.endDate = null;
      }
    }

    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : null;
    if (registeredBy !== undefined) updateData.registeredBy = registeredBy ? String(registeredBy).trim() : null;

    const updated = await updateVacation(id, updateData);

    return res.json({
      message: "Vacación actualizada correctamente",
      data: {
        id: updated.id,
        employeeId: updated.employeeId,
        type: REVERSE_TYPE_MAP[updated.type],
        amount: updated.amount ? Number(updated.amount) : null,
        startDate: updated.startDate.toISOString().split("T")[0],
        endDate: updated.endDate ? updated.endDate.toISOString().split("T")[0] : null,
        days: Number(updated.days),
        status: updated.status,
        notes: updated.notes || "",
        registeredBy: updated.registeredBy || "",
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating employee vacation:", error);
    return res.status(500).json({
      message: "No se pudo actualizar la vacación",
    });
  }
};

export const deleteVacationController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de la vacación no es válido",
      });
    }

    await deleteVacation(id);

    return res.json({
      message: "Vacación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error deleting employee vacation:", error);
    return res.status(500).json({
      message: "No se pudo eliminar la vacación",
    });
  }
};

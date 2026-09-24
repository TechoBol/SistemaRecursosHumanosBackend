import { Request, Response } from "express";
import {
  createIncident,
  deleteIncident,
  getIncidentsByEmployeeId,
  updateIncident,
} from "../repository/attendanceIncident.repository";
import { AttendanceIncidentType, AttendanceDurationType } from "@prisma/client";

// Mapeos de tipos entre frontend y backend
const TYPE_MAP: Record<string, AttendanceIncidentType> = {
  permission: AttendanceIncidentType.PERMISSION,
  absence: AttendanceIncidentType.ABSENCE,
  lateness: AttendanceIncidentType.LATENESS,
};

const REVERSE_TYPE_MAP: Record<AttendanceIncidentType, string> = {
  [AttendanceIncidentType.PERMISSION]: "permission",
  [AttendanceIncidentType.ABSENCE]: "absence",
  [AttendanceIncidentType.LATENESS]: "lateness",
};

const DURATION_MAP: Record<string, AttendanceDurationType> = {
  halfDay: AttendanceDurationType.HALF_DAY,
  fullDay: AttendanceDurationType.FULL_DAY,
};

const REVERSE_DURATION_MAP: Record<AttendanceDurationType, string> = {
  [AttendanceDurationType.HALF_DAY]: "halfDay",
  [AttendanceDurationType.FULL_DAY]: "fullDay",
  [AttendanceDurationType.HOURS]: "hours",
};

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const dbIncidents = await getIncidentsByEmployeeId(employeeId);
    const incidents = dbIncidents.map((incident) => ({
      id: incident.id,
      employeeId: incident.employeeId,
      type: REVERSE_TYPE_MAP[incident.type],
      duration: REVERSE_DURATION_MAP[incident.durationType] || "fullDay",
      date: incident.incidentDate.toISOString().split("T")[0],
      reason: incident.reason || "",
      description: incident.description || "",
      discount: Number(incident.discount),
      registeredBy: incident.registeredBy,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    }));

    return res.json(incidents);
  } catch (error) {
    console.error("Error getting attendance incidents:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los registros de asistencia",
    });
  }
};

export const createIncidentController = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { type, duration, date, reason, description, discount, registeredBy } = req.body;
    
    if (!type || !date || !reason || !registeredBy) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar la asistencia",
      });
    }

    const dbType = TYPE_MAP[type];
    if (!dbType) {
      return res.status(400).json({
        message: "El tipo de asistencia no es válido",
      });
    }

    // Respetar la duración enviada (halfDay o fullDay) tanto para permiso como para falta
    const durationKey = duration || "fullDay";
    const dbDuration = DURATION_MAP[durationKey];
    if (!dbDuration) {
      return res.status(400).json({
        message: "La duración de la asistencia no es válida",
      });
    }

    const incidentDate = new Date(date + "T00:00:00");
    if (isNaN(incidentDate.getTime())) {
      return res.status(400).json({
        message: "La fecha proporcionada no es válida",
      });
    }

    const newIncident = await createIncident(employeeId, {
      type: dbType,
      durationType: dbDuration,
      incidentDate,
      reason: String(reason).trim(),
      description: description ? String(description).trim() : null,
      discount: Number(discount) || 0,
      registeredBy: String(registeredBy).trim(),
    });

    return res.status(201).json({
      message: "Registro de asistencia creado correctamente",
      data: {
        ...newIncident,
        type: REVERSE_TYPE_MAP[newIncident.type],
        duration: REVERSE_DURATION_MAP[newIncident.durationType] || "fullDay",
        date: newIncident.incidentDate.toISOString().split("T")[0],
        discount: Number(newIncident.discount),
      },
    });
  } catch (error) {
    console.error("Error creating attendance incident:", error);
    return res.status(500).json({
      message: "No se pudo crear el registro de asistencia",
    });
  }
};

export const updateIncidentController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador de registro de asistencia no es válido",
      });
    }

    const { type, duration, date, reason, description, discount, registeredBy } = req.body;
    const updateData: any = {};

    if (type !== undefined) {
      const dbType = TYPE_MAP[type];
      if (!dbType) {
        return res.status(400).json({
          message: "El tipo de asistencia no es válido",
        });
      }
      updateData.type = dbType;
    }

    if (duration !== undefined) {
      const durationKey = duration || "fullDay";
      const dbDuration = DURATION_MAP[durationKey];
      if (!dbDuration) {
        return res.status(400).json({
          message: "La duración de la asistencia no es válida",
        });
      }
      updateData.durationType = dbDuration;
    }

    if (date !== undefined) {
      const incidentDate = new Date(date + "T00:00:00");
      if (isNaN(incidentDate.getTime())) {
        return res.status(400).json({
          message: "La fecha proporcionada no es válida",
        });
      }
      updateData.incidentDate = incidentDate;
    }

    if (reason !== undefined) updateData.reason = String(reason).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (discount !== undefined) updateData.discount = Number(discount) || 0;
    if (registeredBy !== undefined) updateData.registeredBy = String(registeredBy).trim();

    const updated = await updateIncident(id, updateData);

    return res.json({
      message: "Registro de asistencia actualizado correctamente",
      data: {
        ...updated,
        type: REVERSE_TYPE_MAP[updated.type],
        duration: REVERSE_DURATION_MAP[updated.durationType] || "fullDay",
        date: updated.incidentDate.toISOString().split("T")[0],
        discount: Number(updated.discount),
      },
    });
  } catch (error) {
    console.error("Error updating attendance incident:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el registro de asistencia",
    });
  }
};

export const deleteIncidentController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del registro de asistencia no es válido",
      });
    }

    await deleteIncident(id);

    return res.json({
      message: "Registro de asistencia eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting attendance incident:", error);
    return res.status(500).json({
      message: "No se pudo eliminar el registro de asistencia",
    });
  }
};

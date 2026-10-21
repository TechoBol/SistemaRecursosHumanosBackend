import prisma from "../config/db";
import { AttendanceIncidentType, AttendanceDurationType } from "@prisma/client";

export const getIncidentsByEmployeeId = async (employeeId: number) => {
  return prisma.attendanceIncident.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      incidentDate: "desc",
    },
  });
};

export const getAllIncidents = async (year?: number, month?: number) => {
  let where: any = {};
  if (year && month) {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    where = {
      incidentDate: {
        gte: new Date(`${startStr}T00:00:00.000Z`),
        lte: new Date(`${endStr}T23:59:59.999Z`),
      },
    };
  }

  return prisma.attendanceIncident.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstNames: true,
          lastNames: true,
          documentNumber: true,
          status: true,
        },
      },
    },
    orderBy: {
      incidentDate: "desc",
    },
  });
};

export const createIncident = async (
  employeeId: number,
  data: {
    type: AttendanceIncidentType;
    durationType: AttendanceDurationType;
    incidentDate: Date;
    reason?: string | null;
    description?: string | null;
    discount: number;
    registeredBy: string;
  }
) => {
  return prisma.attendanceIncident.create({
    data: {
      employeeId,
      type: data.type,
      durationType: data.durationType,
      incidentDate: data.incidentDate,
      reason: data.reason,
      description: data.description,
      discount: data.discount,
      registeredBy: data.registeredBy,
    },
  });
};

export const updateIncident = async (
  id: number,
  data: {
    type?: AttendanceIncidentType;
    durationType?: AttendanceDurationType;
    incidentDate?: Date;
    reason?: string | null;
    description?: string | null;
    discount?: number;
    registeredBy?: string;
  }
) => {
  return prisma.attendanceIncident.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteIncident = async (id: number) => {
  return prisma.attendanceIncident.delete({
    where: {
      id,
    },
  });
};

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

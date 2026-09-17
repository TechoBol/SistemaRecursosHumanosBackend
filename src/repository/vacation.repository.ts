import prisma from "../config/db";
import { VacationType } from "@prisma/client";

export const getVacationsByEmployeeId = async (employeeId: number) => {
  return prisma.vacation.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      startDate: "desc",
    },
  });
};

export const createVacation = async (
  employeeId: number,
  data: {
    type?: VacationType;
    amount?: number | null;
    startDate: Date;
    endDate?: Date | null;
    days: number;
    status?: string;
    notes?: string | null;
    registeredBy?: string | null;
  }
) => {
  return prisma.vacation.create({
    data: {
      employeeId,
      type: data.type || VacationType.DAYS,
      amount: data.amount !== undefined && data.amount !== null ? data.amount : null,
      startDate: data.startDate,
      endDate: data.endDate || null,
      days: data.days,
      status: data.status || "APPROVED",
      notes: data.notes || null,
      registeredBy: data.registeredBy || null,
    },
  });
};

export const updateVacation = async (
  id: number,
  data: {
    type?: VacationType;
    amount?: number | null;
    startDate?: Date;
    endDate?: Date | null;
    days?: number;
    status?: string;
    notes?: string | null;
    registeredBy?: string | null;
  }
) => {
  return prisma.vacation.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteVacation = async (id: number) => {
  return prisma.vacation.delete({
    where: {
      id,
    },
  });
};

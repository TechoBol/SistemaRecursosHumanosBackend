import prisma from "../config/db";
import { AdvanceType } from "@prisma/client";

export const getAdvancesByEmployeeId = async (employeeId: number) => {
  return prisma.employeeAdvance.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      advanceDate: "desc",
    },
  });
};

export const createAdvance = async (
  employeeId: number,
  data: {
    type?: AdvanceType;
    amount: number;
    advanceDate: Date;
    notes?: string | null;
    registeredBy: string;
  }
) => {
  return prisma.employeeAdvance.create({
    data: {
      employeeId,
      type: data.type || AdvanceType.SALARY,
      amount: data.amount,
      advanceDate: data.advanceDate,
      notes: data.notes,
      registeredBy: data.registeredBy,
    },
  });
};

export const updateAdvance = async (
  id: number,
  data: {
    type?: AdvanceType;
    amount?: number;
    advanceDate?: Date;
    notes?: string | null;
    registeredBy?: string;
  }
) => {
  return prisma.employeeAdvance.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteAdvance = async (id: number) => {
  return prisma.employeeAdvance.delete({
    where: {
      id,
    },
  });
};

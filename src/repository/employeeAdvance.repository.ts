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

export const getAllAdvances = async (year?: number, month?: number) => {
  let where: any = {};
  if (year && month) {
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    where = {
      advanceDate: {
        gte: new Date(`${startStr}T00:00:00.000Z`),
        lte: new Date(`${endStr}T23:59:59.999Z`),
      },
    };
  }

  return prisma.employeeAdvance.findMany({
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

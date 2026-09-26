import prisma from "../config/db";

export const getBonusesByEmployeeId = async (employeeId: number) => {
  return prisma.employeeBonus.findMany({
    where: {
      employeeId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createBonus = async (
  employeeId: number,
  data: {
    name: string;
    amount: number;
  }
) => {
  return prisma.employeeBonus.create({
    data: {
      employeeId,
      name: data.name,
      amount: data.amount,
      isActive: true,
    },
  });
};

export const updateBonus = async (
  id: number,
  data: {
    name?: string;
    amount?: number;
    isActive?: boolean;
  }
) => {
  return prisma.employeeBonus.update({
    where: { id },
    data,
  });
};

export const deleteBonus = async (id: number) => {
  return prisma.employeeBonus.delete({
    where: { id },
  });
};

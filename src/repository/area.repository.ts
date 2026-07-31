import prisma from "../config/db";

export const getAllAreasRepository = async () => {
  return prisma.area.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getAreaByIdRepository = async (id: number) => {
  return prisma.area.findUnique({
    where: {
      id,
    },
  });
};

export const getAreaByNameRepository = async (name: string) => {
  return prisma.area.findUnique({
    where: {
      name,
    },
  });
};

export const createAreaRepository = async (data: {
  name: string;
  description?: string;
}) => {
  return prisma.area.create({
    data,
  });
};

export const updateAreaRepository = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }
) => {
  return prisma.area.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteAreaRepository = async (id: number) => {
  return prisma.area.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

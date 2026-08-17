import prisma from "../config/db";

export const getAllCitiesRepository = async () => {
  return prisma.city.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getCityByIdRepository = async (id: number) => {
  return prisma.city.findUnique({
    where: {
      id,
    },
  });
};

export const getCityByNameRepository = async (name: string) => {
  return prisma.city.findUnique({
    where: {
      name,
    },
  });
};

export const createCityRepository = async (data: { name: string }) => {
  return prisma.city.create({
    data,
  });
};

export const updateCityRepository = async (
  id: number,
  data: {
    name?: string;
    isActive?: boolean;
  }
) => {
  return prisma.city.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCityRepository = async (id: number) => {
  return prisma.city.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

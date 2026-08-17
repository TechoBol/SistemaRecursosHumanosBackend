import prisma from "../config/db";

export const getAllCompaniesRepository = async () => {
  return prisma.company.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getCompanyByIdRepository = async (id: number) => {
  return prisma.company.findUnique({
    where: {
      id,
    },
  });
};

export const getCompanyByNameRepository = async (name: string) => {
  return prisma.company.findUnique({
    where: {
      name,
    },
  });
};

export const createCompanyRepository = async (data: {
  name: string;
  legalName?: string;
  taxId?: string;
}) => {
  return prisma.company.create({
    data,
  });
};

export const updateCompanyRepository = async (
  id: number,
  data: {
    name?: string;
    legalName?: string;
    taxId?: string;
    isActive?: boolean;
  }
) => {
  return prisma.company.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCompanyRepository = async (id: number) => {
  return prisma.company.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

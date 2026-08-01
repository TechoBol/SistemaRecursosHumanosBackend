import prisma from "../config/db";

export const getAllBranchesRepository = async () => {
  return prisma.branch.findMany({
    where: {
      isActive: true,
    },
    include: {
      city: true,
      companies: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getBranchByIdRepository = async (id: number) => {
  return prisma.branch.findUnique({
    where: {
      id,
    },
    include: {
      city: true,
      companies: {
        include: {
          company: true,
        },
      },
    },
  });
};

export const getBranchByNameInCityRepository = async (name: string, cityId: number) => {
  return prisma.branch.findFirst({
    where: {
      name,
      cityId,
    },
  });
};

export const createBranchRepository = async (data: {
  name: string;
  description?: string;
  address?: string;
  cityId: number;
  companyIds?: number[];
}) => {
  return prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        cityId: data.cityId,
      },
    });

    if (data.companyIds && data.companyIds.length > 0) {
      await tx.companyBranch.createMany({
        data: data.companyIds.map((companyId) => ({
          branchId: branch.id,
          companyId,
        })),
      });
    }

    return tx.branch.findUnique({
      where: { id: branch.id },
      include: {
        city: true,
        companies: {
          include: {
            company: true,
          },
        },
      },
    });
  });
};

export const updateBranchRepository = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    address?: string;
    cityId?: number;
    isActive?: boolean;
    companyIds?: number[];
  }
) => {
  return prisma.$transaction(async (tx) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.cityId !== undefined) updateData.cityId = data.cityId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await tx.branch.update({
      where: { id },
      data: updateData,
    });

    if (data.companyIds !== undefined) {
      // Borrar vinculaciones previas
      await tx.companyBranch.deleteMany({
        where: { branchId: id },
      });

      // Insertar nuevas vinculaciones
      if (data.companyIds.length > 0) {
        await tx.companyBranch.createMany({
          data: data.companyIds.map((companyId) => ({
            branchId: id,
            companyId,
          })),
        });
      }
    }

    return tx.branch.findUnique({
      where: { id },
      include: {
        city: true,
        companies: {
          include: {
            company: true,
          },
        },
      },
    });
  });
};

export const deleteBranchRepository = async (id: number) => {
  return prisma.branch.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

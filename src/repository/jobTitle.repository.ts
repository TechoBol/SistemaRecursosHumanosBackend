import prisma from "../config/db";

export const getAllJobTitlesRepository = async () => {
  return prisma.jobTitle.findMany({
    where: {
      isActive: true,
    },
    include: {
      areas: {
        include: {
          area: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getJobTitleByIdRepository = async (id: number) => {
  return prisma.jobTitle.findUnique({
    where: {
      id,
    },
    include: {
      areas: {
        include: {
          area: true,
        },
      },
    },
  });
};

export const getJobTitleByNameRepository = async (name: string) => {
  return prisma.jobTitle.findUnique({
    where: {
      name,
    },
  });
};

export const createJobTitleRepository = async (data: {
  name: string;
  description?: string;
  areaIds?: number[];
}) => {
  return prisma.$transaction(async (tx) => {
    const jobTitle = await tx.jobTitle.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    if (data.areaIds && data.areaIds.length > 0) {
      await tx.areaJobTitle.createMany({
        data: data.areaIds.map((areaId) => ({
          jobTitleId: jobTitle.id,
          areaId,
        })),
      });
    }

    return tx.jobTitle.findUnique({
      where: { id: jobTitle.id },
      include: {
        areas: {
          include: {
            area: true,
          },
        },
      },
    });
  });
};

export const updateJobTitleRepository = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    areaIds?: number[];
  }
) => {
  return prisma.$transaction(async (tx) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await tx.jobTitle.update({
      where: { id },
      data: updateData,
    });

    if (data.areaIds !== undefined) {
      // Borrar vinculaciones previas
      await tx.areaJobTitle.deleteMany({
        where: { jobTitleId: id },
      });

      // Insertar nuevas vinculaciones
      if (data.areaIds.length > 0) {
        await tx.areaJobTitle.createMany({
          data: data.areaIds.map((areaId) => ({
            jobTitleId: id,
            areaId,
          })),
        });
      }
    }

    return tx.jobTitle.findUnique({
      where: { id },
      include: {
        areas: {
          include: {
            area: true,
          },
        },
      },
    });
  });
};

export const deleteJobTitleRepository = async (id: number) => {
  return prisma.jobTitle.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

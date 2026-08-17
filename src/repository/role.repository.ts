import prisma from '../config/db'

export const getAllRolesRepository = async () => {
  return prisma.role.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getRoleByIdRepository = async (id: number) => {
  return prisma.role.findUnique({
    where: {
      id,
    },
  })
}
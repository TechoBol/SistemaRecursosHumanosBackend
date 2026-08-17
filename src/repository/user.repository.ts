import prisma from "../config/db";

export const getOneUserToValidateToken = async (id: number) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getAllUsersRepository = async () => {
  return prisma.user.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      lastAccessAt: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' }
    ],
  })
}

export const getUserByIdRepository = async (id: number) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roleId: true,
      isActive: true,
      lastAccessAt: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export const getUserByEmailRepository = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export const createUserRepository = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  roleId: number
}) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export const updateUserRepository = async (
  id: number,
  data: {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    roleId?: number
    isActive?: boolean
  },
) => {
  return prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      lastAccessAt: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export const deleteUserRepository = async (id: number) => {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
    },
  })
}
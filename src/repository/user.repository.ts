import prisma from "../config/db";

export const getOneUserToValidateToken = async (id: number) => {
  return prisma.user.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};
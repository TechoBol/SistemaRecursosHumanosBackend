import prisma from "../config/db";

export const getEmergencyContactsByEmployeeId = async (employeeId: number) => {
  return prisma.emergencyContact.findMany({
    where: {
      employeeId,
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const createEmergencyContact = async (
  employeeId: number,
  data: {
    fullName: string;
    relationship: string;
    phone: string;
    address?: string | null;
  }
) => {
  return prisma.emergencyContact.create({
    data: {
      employeeId,
      fullName: data.fullName,
      relationship: data.relationship,
      phone: data.phone,
      address: data.address,
      isActive: true,
    },
  });
};

export const updateEmergencyContact = async (
  id: number,
  data: {
    fullName?: string;
    relationship?: string;
    phone?: string;
    address?: string | null;
  }
) => {
  return prisma.emergencyContact.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteEmergencyContact = async (id: number) => {
  return prisma.emergencyContact.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

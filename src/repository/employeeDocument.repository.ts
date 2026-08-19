import prisma from "../config/db";
import { EmployeeDocumentType } from "@prisma/client";

export const getDocumentsByEmployeeId = async (employeeId: number) => {
  return prisma.employeeDocument.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const createEmployeeDocument = async (
  employeeId: number,
  data: {
    documentType: EmployeeDocumentType;
    name: string;
    fileUrl: string;
  }
) => {
  return prisma.employeeDocument.create({
    data: {
      employeeId,
      documentType: data.documentType,
      name: data.name,
      fileUrl: data.fileUrl,
    },
  });
};

export const deleteEmployeeDocument = async (id: number) => {
  return prisma.employeeDocument.delete({
    where: {
      id,
    },
  });
};

import prisma from "../config/db";

export const getAllEmployeesRepository = async () => {
  return prisma.employee.findMany({
    include: {
      contracts: {
        where: {
          isActive: true,
        },
        include: {
          branch: true,
          area: true,
          jobTitle: true,
          contractCompany: true,
          consolidatedCompany: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
};

export const getEmployeeByIdRepository = async (id: number) => {
  return prisma.employee.findUnique({
    where: {
      id,
    },
    include: {
      contracts: {
        include: {
          branch: true,
          area: true,
          jobTitle: true,
          contractCompany: true,
          consolidatedCompany: true,
        },
      },
      emergencyContacts: true,
    },
  });
};

export const getEmployeeByDocumentRepository = async (documentNumber: string) => {
  return prisma.employee.findUnique({
    where: {
      documentNumber,
    },
  });
};

export const createEmployeeRepository = async (
  employeeData: {
    firstNames: string;
    lastNames: string;
    documentNumber: string;
    birthDate?: Date | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  },
  contractData: {
    contractCompanyId: number;
    consolidatedCompanyId: number;
    branchId: number;
    areaId: number;
    jobTitleId: number;
    contractType: "INDEFINITE" | "CONSULTING";
    hireDate: Date;
    endDate?: Date | null;
    baseSalary: number;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: employeeData,
    });

    await tx.employeeContract.create({
      data: {
        employeeId: employee.id,
        contractCompanyId: contractData.contractCompanyId,
        consolidatedCompanyId: contractData.consolidatedCompanyId,
        branchId: contractData.branchId,
        areaId: contractData.areaId,
        jobTitleId: contractData.jobTitleId,
        contractType: contractData.contractType,
        hireDate: contractData.hireDate,
        endDate: contractData.endDate,
        baseSalary: contractData.baseSalary,
        isActive: true,
        status: "ACTIVE",
      },
    });

    return tx.employee.findUnique({
      where: { id: employee.id },
      include: {
        contracts: {
          where: { isActive: true },
          include: {
            branch: true,
            area: true,
            jobTitle: true,
            contractCompany: true,
            consolidatedCompany: true,
          },
        },
      },
    });
  });
};

export const updateEmployeeRepository = async (
  id: number,
  employeeData: {
    firstNames?: string;
    lastNames?: string;
    documentNumber?: string;
    birthDate?: Date | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  },
  contractData?: {
    contractCompanyId?: number;
    consolidatedCompanyId?: number;
    branchId?: number;
    areaId?: number;
    jobTitleId?: number;
    contractType?: "INDEFINITE" | "CONSULTING";
    hireDate?: Date;
    endDate?: Date | null;
    baseSalary?: number;
    status?: "ACTIVE" | "ENDED" | "CANCELLED";
  }
) => {
  return prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id },
      data: employeeData,
    });

    if (contractData) {
      const activeContract = await tx.employeeContract.findFirst({
        where: {
          employeeId: id,
          isActive: true,
        },
      });

      if (activeContract) {
        await tx.employeeContract.update({
          where: { id: activeContract.id },
          data: contractData,
        });
      } else {
        await tx.employeeContract.create({
          data: {
            employeeId: id,
            contractCompanyId: contractData.contractCompanyId || 1,
            consolidatedCompanyId: contractData.consolidatedCompanyId || 1,
            branchId: contractData.branchId || 1,
            areaId: contractData.areaId || 1,
            jobTitleId: contractData.jobTitleId || 1,
            contractType: contractData.contractType || "INDEFINITE",
            hireDate: contractData.hireDate || new Date(),
            endDate: contractData.endDate,
            baseSalary: contractData.baseSalary || 0,
            isActive: true,
            status: "ACTIVE",
          },
        });
      }
    }

    return tx.employee.findUnique({
      where: { id },
      include: {
        contracts: {
          where: { isActive: true },
          include: {
            branch: true,
            area: true,
            jobTitle: true,
            contractCompany: true,
            consolidatedCompany: true,
          },
        },
      },
    });
  });
};

export const deleteEmployeeRepository = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id },
      data: {
        status: "INACTIVE",
      },
    });

    await tx.employeeContract.updateMany({
      where: {
        employeeId: id,
        isActive: true,
      },
      data: {
        isActive: false,
        status: "ENDED",
      },
    });

    return true;
  });
};

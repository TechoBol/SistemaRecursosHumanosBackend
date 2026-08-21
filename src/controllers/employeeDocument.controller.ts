import { Request, Response } from "express";
import {
  createEmployeeDocument,
  deleteEmployeeDocument,
  getDocumentsByEmployeeId,
} from "../repository/employeeDocument.repository";
import { EmployeeDocumentType } from "@prisma/client";

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const docs = await getDocumentsByEmployeeId(employeeId);
    return res.json(docs);
  } catch (error) {
    console.error("Error getting employee documents:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los documentos del empleado",
    });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { documentType, name, fileUrl } = req.body;
    if (!documentType || !name || !fileUrl) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar el documento",
      });
    }

    // Validar tipo de documento
    const allowedTypes = Object.values(EmployeeDocumentType);
    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({
        message: "El tipo de documento suministrado no es válido",
      });
    }

    const newDoc = await createEmployeeDocument(employeeId, {
      documentType: documentType as EmployeeDocumentType,
      name: String(name).trim(),
      fileUrl: String(fileUrl).trim(),
    });

    return res.status(201).json({
      message: "Documento registrado correctamente",
      data: newDoc,
    });
  } catch (error) {
    console.error("Error creating employee document:", error);
    return res.status(500).json({
      message: "No se pudo registrar el documento",
    });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del documento no es válido",
      });
    }

    await deleteEmployeeDocument(id);

    return res.json({
      message: "Documento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting employee document:", error);
    return res.status(500).json({
      message: "No se pudo eliminar el documento",
    });
  }
};

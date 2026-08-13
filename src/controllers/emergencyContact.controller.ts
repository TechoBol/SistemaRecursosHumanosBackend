import { Request, Response } from "express";
import {
  createEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContactsByEmployeeId,
  updateEmergencyContact,
} from "../repository/emergencyContact.repository";

export const getContacts = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const contacts = await getEmergencyContactsByEmployeeId(employeeId);
    return res.json(contacts);
  } catch (error) {
    console.error("Error getting emergency contacts:", error);
    return res.status(500).json({
      message: "No se pudieron obtener los contactos de emergencia",
    });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: "El identificador del empleado no es válido",
      });
    }

    const { fullName, relationship, phone, address } = req.body;
    if (!fullName || !relationship || !phone) {
      return res.status(400).json({
        message: "Faltan campos obligatorios para registrar el contacto",
      });
    }

    const newContact = await createEmergencyContact(employeeId, {
      fullName: String(fullName).trim(),
      relationship: String(relationship).trim(),
      phone: String(phone).trim(),
      address: address ? String(address).trim() : null,
    });

    return res.status(201).json({
      message: "Contacto de emergencia registrado correctamente",
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    return res.status(500).json({
      message: "No se pudo crear el contacto de emergencia",
    });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del contacto no es válido",
      });
    }

    const { fullName, relationship, phone, address } = req.body;
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = String(fullName).trim();
    if (relationship !== undefined) updateData.relationship = String(relationship).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (address !== undefined) updateData.address = address ? String(address).trim() : null;

    const updated = await updateEmergencyContact(id, updateData);

    return res.json({
      message: "Contacto de emergencia actualizado correctamente",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    return res.status(500).json({
      message: "No se pudo actualizar el contacto de emergencia",
    });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "El identificador del contacto no es válido",
      });
    }

    await deleteEmergencyContact(id);

    return res.json({
      message: "Contacto de emergencia eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    return res.status(500).json({
      message: "No se pudo eliminar el contacto de emergencia",
    });
  }
};

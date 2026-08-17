import { Router } from "express";
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
} from "../controllers/emergencyContact.controller";

const router = Router();

router.get("/get-contacts/:employeeId", getContacts);
router.post("/create-contact/:employeeId", createContact);
router.put("/update-contact/:id", updateContact);
router.delete("/delete-contact/:id", deleteContact);

export default router;

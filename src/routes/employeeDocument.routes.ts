import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocuments,
} from "../controllers/employeeDocument.controller";

const router = Router();

router.get("/get-documents/:employeeId", getDocuments);
router.post("/create-document/:employeeId", createDocument);
router.delete("/delete-document/:id", deleteDocument);

export default router;

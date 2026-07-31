import { Router } from "express";
import {
  createCompany,
  deleteCompany,
  getCompanyById,
  getCompanies,
  updateCompany,
} from "../controllers/company.controller";

const router = Router();

router.get("/get-companies", getCompanies);
router.get("/get-company/:id", getCompanyById);
router.post("/create-company", createCompany);
router.put("/update-company/:id", updateCompany);
router.delete("/delete-company/:id", deleteCompany);

export default router;

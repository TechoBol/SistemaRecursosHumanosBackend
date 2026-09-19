import { Router } from "express";
import {
  generatePayrollsController,
  getPayrolls,
  updatePayrollController,
} from "../controllers/payroll.controller";

const router = Router();

router.get("/", getPayrolls);
router.put("/:id", updatePayrollController);
router.post("/generate", generatePayrollsController);

export default router;

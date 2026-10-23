import { Router } from "express";
import {
  generatePayrollsController,
  getPayrolls,
  updatePayrollController,
  finalizePayrollController,
  getEmployeeSalarySummaryController,
} from "../controllers/payroll.controller";

const router = Router();

router.get("/", getPayrolls);
router.get("/employee/:employeeId/summary", getEmployeeSalarySummaryController);
router.put("/:id", updatePayrollController);
router.post("/generate", generatePayrollsController);
router.post("/finalize", finalizePayrollController);

export default router;

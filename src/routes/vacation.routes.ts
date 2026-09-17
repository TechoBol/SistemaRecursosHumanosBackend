import { Router } from "express";
import {
  createVacationController,
  deleteVacationController,
  getVacations,
  updateVacationController,
} from "../controllers/vacation.controller";

const router = Router();

router.get("/employee/:employeeId", getVacations);
router.post("/employee/:employeeId", createVacationController);
router.put("/:id", updateVacationController);
router.delete("/:id", deleteVacationController);

export default router;

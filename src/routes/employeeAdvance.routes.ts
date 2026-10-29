import { Router } from "express";
import {
  createAdvanceController,
  deleteAdvanceController,
  getAllAdvancesController,
  getAdvances,
  updateAdvanceController,
} from "../controllers/employeeAdvance.controller";

const router = Router();

router.get("/all-advances", getAllAdvancesController);
router.get("/get-advances/:employeeId", getAdvances);
router.post("/create-advance/:employeeId", createAdvanceController);
router.put("/update-advance/:id", updateAdvanceController);
router.delete("/delete-advance/:id", deleteAdvanceController);

export default router;

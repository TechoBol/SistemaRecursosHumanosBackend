import { Router } from "express";
import {
  createBonusController,
  deleteBonusController,
  getBonuses,
  updateBonusController,
} from "../controllers/employeeBonus.controller";

const router = Router();

router.get("/get-bonuses/:employeeId", getBonuses);
router.post("/create-bonus/:employeeId", createBonusController);
router.put("/update-bonus/:id", updateBonusController);
router.delete("/delete-bonus/:id", deleteBonusController);

export default router;

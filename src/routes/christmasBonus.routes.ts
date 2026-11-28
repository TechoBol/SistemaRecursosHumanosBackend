import { Router } from "express";
import {
  getChristmasBonusesController,
  finalizeChristmasBonusesController,
} from "../controllers/christmasBonus.controller";

const router = Router();

router.get("/", getChristmasBonusesController);
router.post("/finalize", finalizeChristmasBonusesController);

export default router;

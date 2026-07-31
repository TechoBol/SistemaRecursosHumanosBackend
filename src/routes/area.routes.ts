import { Router } from "express";
import {
  createArea,
  deleteArea,
  getAreaById,
  getAreas,
  updateArea,
} from "../controllers/area.controller";

const router = Router();

router.get("/get-areas", getAreas);
router.get("/get-area/:id", getAreaById);
router.post("/create-area", createArea);
router.put("/update-area/:id", updateArea);
router.delete("/delete-area/:id", deleteArea);

export default router;

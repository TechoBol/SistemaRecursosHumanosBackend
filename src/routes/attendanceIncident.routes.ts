import { Router } from "express";
import {
  createIncidentController,
  deleteIncidentController,
  getIncidents,
  updateIncidentController,
} from "../controllers/attendanceIncident.controller";

const router = Router();

router.get("/get-incidents/:employeeId", getIncidents);
router.post("/create-incident/:employeeId", createIncidentController);
router.put("/update-incident/:id", updateIncidentController);
router.delete("/delete-incident/:id", deleteIncidentController);

export default router;

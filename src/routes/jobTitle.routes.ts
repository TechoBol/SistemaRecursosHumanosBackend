import { Router } from "express";
import {
  createJobTitle,
  deleteJobTitle,
  getJobTitleById,
  getJobTitles,
  updateJobTitle,
} from "../controllers/jobTitle.controller";

const router = Router();

router.get("/get-job-titles", getJobTitles);
router.get("/get-job-title/:id", getJobTitleById);
router.post("/create-job-title", createJobTitle);
router.put("/update-job-title/:id", updateJobTitle);
router.delete("/delete-job-title/:id", deleteJobTitle);

export default router;

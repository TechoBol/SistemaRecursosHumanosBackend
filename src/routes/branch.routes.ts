import { Router } from "express";
import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranches,
  updateBranch,
} from "../controllers/branch.controller";

const router = Router();

router.get("/get-branches", getBranches);
router.get("/get-branch/:id", getBranchById);
router.post("/create-branch", createBranch);
router.put("/update-branch/:id", updateBranch);
router.delete("/delete-branch/:id", deleteBranch);

export default router;

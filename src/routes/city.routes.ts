import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCityById,
  getCities,
  updateCity,
} from "../controllers/city.controller";

const router = Router();

router.get("/get-cities", getCities);
router.get("/get-city/:id", getCityById);
router.post("/create-city", createCity);
router.put("/update-city/:id", updateCity);
router.delete("/delete-city/:id", deleteCity);

export default router;

import { Router } from "express";
import { signIn, validateToken } from "../controllers/authentication.controller";

const route = Router();

route.post("/signIn", signIn);
route.post("/validateToken", validateToken);

export default route;
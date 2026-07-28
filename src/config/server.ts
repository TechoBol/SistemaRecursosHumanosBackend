import express, { urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import authenticationRoute from "../routes/authentication.routes";
import { verifyToken } from "../middleware/auth.middleware";
import roleRoute from "../routes/role.routes";
import userRoute from "../routes/user.routes";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// Ruta publica
app.use("/api/authentication", authenticationRoute);

// Rutas protegidas
app.use("/api/role", verifyToken, roleRoute);
app.use("/api/user", verifyToken, userRoute);

export default app;
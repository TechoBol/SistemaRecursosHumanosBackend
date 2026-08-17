import express, { urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import authenticationRoute from "../routes/authentication.routes";
import { verifyToken } from "../middleware/auth.middleware";
import roleRoute from "../routes/role.routes";
import userRoute from "../routes/user.routes";
import companyRoute from "../routes/company.routes";
import areaRoute from "../routes/area.routes";
import cityRoute from "../routes/city.routes";
import branchRoute from "../routes/branch.routes";
import jobTitleRoute from "../routes/jobTitle.routes";
import employeeRoute from "../routes/employee.routes";
import emergencyContactRoute from "../routes/emergencyContact.routes";

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
app.use("/api/company", verifyToken, companyRoute);
app.use("/api/area", verifyToken, areaRoute);
app.use("/api/city", verifyToken, cityRoute);
app.use("/api/branch", verifyToken, branchRoute);
app.use("/api/job-title", verifyToken, jobTitleRoute);
app.use("/api/employee", verifyToken, employeeRoute);
app.use("/api/emergency-contact", verifyToken, emergencyContactRoute);

export default app;
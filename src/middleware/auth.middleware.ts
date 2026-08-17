import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getOneUserToValidateToken } from "../repository/user.repository";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roleId: number;
    role: string;
  };
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message: "Token de acceso requerido",
      });
    }

    const [tokenType, token] = authorizationHeader.split(" ");

    if (tokenType !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Formato de token inválido",
      });
    }

    const jwtSecret = process.env.JWTSECRET;

    if (!jwtSecret) {
      throw new Error("JWTSECRET no está configurado");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const userId = Number(decoded.id);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    const user = await getOneUserToValidateToken(userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Usuario no autorizado",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      roleId: user.role.id,
      role: user.role.name,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: "El token ha expirado",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    console.error("Error verifying token:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
import { Request, Response } from "express";
import { config } from "dotenv";
import prisma from "../config/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getOneUserToValidateToken } from "../repository/user.repository";
config();

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "El correo y la contraseña son obligatorios",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
    }

    const passwordValid = await bcrypt.compare(
      String(password),
      user.password,
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
    }

    const jwtSecret = process.env.JWTSECRET;

    if (!jwtSecret) {
      throw new Error("JWTSECRET no está configurado");
    }

    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.role.id,
      role: user.role.name,
    };

    const token = jwt.sign(payload, jwtSecret, {
      // expiresIn: "8h",
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastAccessAt: new Date(),
      },
    });

    return res.status(200).json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      token,
    });
  } catch (error) {
    console.error("Error signing in:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "El token es obligatorio",
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

    const userFound = await getOneUserToValidateToken(userId);

    if (!userFound || !userFound.isActive) {
      return res.status(401).json({
        message: "Token inválido",
      });
    }

    return res.status(200).json({
      message: "Token válido",
      user: {
        id: userFound.id,
        name: `${userFound.firstName} ${userFound.lastName}`.trim(),
        email: userFound.email,
        role: userFound.role,
      },
    });
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({
        message: "Token inválido o expirado",
      });
    }

    console.error("Error validating token:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
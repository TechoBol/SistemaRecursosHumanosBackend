import { Response, Request } from "express";
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
        message: "email and password required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password as string,
    );

    if (!passwordValid) {
      return res.status(400).json({
        message: "incorrect password",
      });
    }

    // 🔥 PAYLOAD
    const payload = {
      id: user.id,
      email: user.email,
      roleId: user.role?.id,
      role: user.role?.name,
    };

    // 🔥 TOKEN
    const token = jwt.sign(payload, process.env.JWTSECRET as string, {
      expiresIn: "1d",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastAccessAt: new Date() },
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      token,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "internal error",
    });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  try {
    const response = jwt.verify(
      req.body.token,
      process.env.JWTSECRET as string,
    ) as JwtPayload;

    const id = response.id;

    const userFound = await getOneUserToValidateToken(id);

    if (!userFound) {
      return res.status(400).json({ message: "token is invalid" });
    }

    return res.status(200).json({ message: "token is valid" });
  } catch {
    return res.status(500).json({ message: "internal server error" });
  }
};
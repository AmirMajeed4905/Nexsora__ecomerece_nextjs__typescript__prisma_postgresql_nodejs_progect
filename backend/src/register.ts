import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { registerSchema, loginSchema } from "../validations/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/jwt.utils";
import { sendSuccess, sendError } from "../utils/response.utils";

// ── Register ───────────────────────────────────────────────────
// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  // 1. Validate request body with Zod
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.errors[0].message);
    return;
  }

  const { name, email, password } = result.data;

  // 2. Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    sendError(res, 409, "Email already registered");
    return;
  }

  // 3. Hash password — 12 salt rounds
  const hashedPassword = await bcrypt.hash(password, 12);

  // 4. Create user in DB
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // 5. Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  // 6. Save refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // 7. Set refresh token in HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // 8. Return access token + user info
  sendSuccess(res, 201, "Account created successfully", { user, accessToken });
};
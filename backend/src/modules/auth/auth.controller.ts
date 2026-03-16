import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { registerSchema, loginSchema } from "../../validations/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../../utils/jwt.utils";
import { sendSuccess, sendError } from "../../utils/response.utils";
import {
  uploadImage,
  updateImage,
  extractPublicId,
  CLOUDINARY_FOLDERS,
} from "../../utils/cloudinary.utils";

// ── Register ───────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { name, email, password } = result.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    sendError(res, 409, "Email already registered");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // ── Upload Avatar if provided ──────────────────────────────
  let avatarUrl: string | undefined;
  const file = req.file as Express.Multer.File;
  if (file) {
    const uploaded = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.AVATARS, {
      width: 200,
      height: 200,
      quality: 90,
    });
    avatarUrl = uploaded.url;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(avatarUrl && { avatar: avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  setRefreshTokenCookie(res, refreshToken);

  sendSuccess(res, 201, "Account created successfully", { user, accessToken });
};

// ── Login ──────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    sendError(res, 401, "Invalid email or password");
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    sendError(res, 401, "Invalid email or password");
    return;
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  setRefreshTokenCookie(res, refreshToken);

  const { password: _p, refreshToken: _r, ...safeUser } = user;

  sendSuccess(res, 200, "Login successful", { user: safeUser, accessToken });
};

// ── Logout ─────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { refreshToken: null },
  });

  clearRefreshTokenCookie(res);

  sendSuccess(res, 200, "Logged out successfully");
};

// ── Refresh Token ──────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    sendError(res, 401, "Refresh token not found");
    return;
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    sendError(res, 401, "Invalid or expired refresh token");
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== token) {
    sendError(res, 401, "Refresh token mismatch");
    return;
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });

  sendSuccess(res, 200, "Token refreshed", { accessToken });
};

// ── Get Me ─────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  sendSuccess(res, 200, "User fetched", { user });
};

// ── Update Avatar ──────────────────────────────────────────────
// PUT /api/auth/avatar  (protected)
export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  const file = req.file as Express.Multer.File;
  if (!file) {
    sendError(res, 400, "Image file is required");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  let avatarUrl: string;

  if (user.avatar) {
    // Delete old + upload new
    const oldPublicId = extractPublicId(user.avatar);
    const uploaded = await updateImage(oldPublicId, file.buffer, CLOUDINARY_FOLDERS.AVATARS);
    avatarUrl = uploaded.url;
  } else {
    // No old avatar — just upload
    const uploaded = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.AVATARS, {
      width: 200,
      height: 200,
      quality: 90,
    });
    avatarUrl = uploaded.url;
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  sendSuccess(res, 200, "Avatar updated", { user: updatedUser });
};
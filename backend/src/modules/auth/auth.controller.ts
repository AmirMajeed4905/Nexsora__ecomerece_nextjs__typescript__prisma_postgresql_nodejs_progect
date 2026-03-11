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

// ── Register ───────────────────────────────────────────────────
// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
    // 1. Validate request body
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        sendError(res, 400, result.error.issues[0].message);
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

    // 4. Create user
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
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

    sendSuccess(res, 201, "Account created successfully", { user, accessToken });
};

// ── Login ──────────────────────────────────────────────────────
// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
    // 1. Validate
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        sendError(res, 400, result.error.issues[0].message);
        return;
    }

    const { email, password } = result.data;

    // 2. Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Check user exists and has password (not Google-only account)
    if (!user || !user.password) {
        sendError(res, 401, "Invalid email or password");
        return;
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        sendError(res, 401, "Invalid email or password");
        return;
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    // 6. Save refresh token in DB
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
    });

    // 7. Set cookie
    setRefreshTokenCookie(res, refreshToken);

    // 8. Return safe user — no password, no refreshToken
    const { password: _p, refreshToken: _r, ...safeUser } = user;

    sendSuccess(res, 200, "Login successful", { user: safeUser, accessToken });
};

// ── Logout ─────────────────────────────────────────────────────
// POST /api/auth/logout  (protected)
export const logout = async (req: Request, res: Response): Promise<void> => {
    // 1. Clear refresh token from DB
    await prisma.user.update({
        where: { id: req.user!.userId },
        data: { refreshToken: null },
    });

    // 2. Clear cookie
    clearRefreshTokenCookie(res);

    sendSuccess(res, 200, "Logged out successfully");
};

// ── Refresh Token ──────────────────────────────────────────────
// POST /api/auth/refresh  (public — uses HttpOnly cookie)
export const refresh = async (req: Request, res: Response): Promise<void> => {
    // 1. Get refresh token from cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
        sendError(res, 401, "Refresh token not found");
        return;
    }

    // 2. Verify token signature
    let payload;
    try {
        payload = verifyRefreshToken(token);
    } catch {
        sendError(res, 401, "Invalid or expired refresh token");
        return;
    }

    // 3. Match with DB — prevents reuse after logout
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== token) {
        sendError(res, 401, "Refresh token mismatch");
        return;
    }

    // 4. Generate new access token
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });

    sendSuccess(res, 200, "Token refreshed", { accessToken });
};

// ── Get Me ─────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
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
import { Response } from "express";

// ── Success Response ───────────────────────────────────────────
// Usage: sendSuccess(res, 200, "Login successful", { user, accessToken })

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: object
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
};

// ── Error Response ─────────────────────────────────────────────
// Usage: sendError(res, 400, "Invalid credentials")

export const sendError = (
  res: Response,
  statusCode: number,
  message: string
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
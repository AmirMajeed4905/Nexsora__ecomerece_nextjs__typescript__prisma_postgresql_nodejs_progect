import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// ── Generic Rate Limit Response ────────────────────────────────
const rateLimitHandler = (_req: Request, res: Response): void => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
    data: null,
  });
};

// ── General API Limiter ────────────────────────────────────────
// 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ── Auth Limiter ───────────────────────────────────────────────
// 10 attempts per 15 minutes — prevents brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
      data: null,
    });
  },
});

// ── Upload Limiter ─────────────────────────────────────────────
// 20 uploads per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ── Review Limiter ─────────────────────────────────────────────
// 5 reviews per hour
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
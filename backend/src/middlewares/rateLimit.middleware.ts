import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

const handler = (msg: string) => (_req: Request, res: Response): void => {
  res.status(429).json({ success: false, message: msg, data: null });
};


export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests. Please try again later."),
});

// 20 attempts / 15 min — login/register only
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many attempts. Please try again in 15 minutes."),
});


export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
  handler: handler("Too many uploads. Please try again later."),
});

export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
  handler: handler("Too many reviews. Please try again later."),
});
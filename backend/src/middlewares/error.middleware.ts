import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env";

// ── Error Types ────────────────────────────────────────────────
interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// ── Global Error Handler ───────────────────────────────────────
// Must have 4 params for Express to recognize it as error middleware
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Log error in development
  if (ENV.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Default values
  let statusCode = err.statusCode ?? 500;
  let message    = err.message || "Internal server error";

  // ── Prisma Errors ──────────────────────────────────────────
  if (err.code === "P2002") {
    statusCode = 409;
    message    = "A record with this value already exists";
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message    = "Record not found";
  }

  if (err.code === "P2003") {
    statusCode = 400;
    message    = "Related record not found";
  }

  // ── JWT Errors ─────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Token expired";
  }

  // ── Multer Errors ──────────────────────────────────────────
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files. Maximum is 5 images";
    } else {
      message = "File upload error";
    }
  }

  // ── Validation Errors ──────────────────────────────────────
  if (err.name === "SyntaxError" && err.message.includes("JSON")) {
    statusCode = 400;
    message    = "Invalid JSON in request body";
  }

  // Hide internal errors in production
  if (statusCode === 500 && ENV.NODE_ENV === "production") {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
};
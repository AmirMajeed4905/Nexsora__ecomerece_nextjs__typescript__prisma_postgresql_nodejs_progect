import dotenv from "dotenv";

dotenv.config();

/**
 * Only use this for CRITICAL variables (DB, JWT secrets)
 */
const requireEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

/**
 * Optional env helper (no crash)
 */
const optionalEnv = (key: string, fallback = ""): string => {
  return process.env[key] ?? fallback;
};

export const ENV = {
  // ─────────────────────────────
  // CORE (required - app will crash if missing)
  // ─────────────────────────────
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: requireEnv("DATABASE_URL"),

  ACCESS_TOKEN_SECRET: requireEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("REFRESH_TOKEN_SECRET"),

  ACCESS_TOKEN_EXPIRES_IN: optionalEnv("ACCESS_TOKEN_EXPIRES_IN", "15m"),
  REFRESH_TOKEN_EXPIRES_IN: optionalEnv("REFRESH_TOKEN_EXPIRES_IN", "7d"),

  CLIENT_URL: optionalEnv("CLIENT_URL", "http://localhost:3000"),

  // ─────────────────────────────
  // GOOGLE AUTH (optional now)
  // ─────────────────────────────
  GOOGLE_CLIENT_ID: optionalEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: optionalEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: optionalEnv("GOOGLE_CALLBACK_URL"),

  // ─────────────────────────────
  // CLOUDINARY (optional if not using uploads)
  // ─────────────────────────────
  CLOUDINARY_CLOUD_NAME: optionalEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: optionalEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: optionalEnv("CLOUDINARY_API_SECRET"),

  // ─────────────────────────────
  // STRIPE (optional if payments not active)
  // ─────────────────────────────
  STRIPE_SECRET_KEY: optionalEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: optionalEnv("STRIPE_WEBHOOK_SECRET"),

  // ─────────────────────────────
  // EMAIL (optional)
  // ─────────────────────────────
  RESEND_API_KEY: optionalEnv("RESEND_API_KEY"),
};

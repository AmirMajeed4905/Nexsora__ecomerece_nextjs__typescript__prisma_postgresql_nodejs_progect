import jwt from "jsonwebtoken";
import { Response } from "express";
import { ENV } from "../config/env";

// ── Token Payload Type ─────────────────────────────────────────
export interface TokenPayload {
  userId: string;
  role: string;
}

// ── Generate Access Token ──────────────────────────────────────
// Short-lived: 15 minutes — stored in an HttpOnly cookie (see below),
// never in localStorage/JS-readable storage.
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

// ── Generate Refresh Token ─────────────────────────────────────
// Long-lived: 7 days — stored in an HttpOnly cookie
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

// ── Verify Access Token ────────────────────────────────────────
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as TokenPayload;
};

// ── Verify Refresh Token ───────────────────────────────────────
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as TokenPayload;
};

// ── Cookie Settings ─────────────────────────────────────────────
// HttpOnly: JS cannot read these — immune to XSS token theft (the whole
// reason both tokens live in cookies instead of localStorage/Zustand).
// Secure: HTTPS-only, automatic in production.
//
// In production, frontend (Vercel) and backend (Render) live on different
// domains, so the browser treats this as a cross-site request. Cross-site
// cookies require sameSite: "none" + secure: true (HTTPS), otherwise the
// browser silently drops the cookie and the user looks "logged out" right
// after logging in. Locally, frontend/backend are different ports on the
// same host — "lax" works fine there and avoids requiring HTTPS in dev.
const isProd = ENV.NODE_ENV === "production";
const cookieSameSite = isProd ? "none" : "lax";

// ── Access Token Cookie ──────────────────────────────────────────
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: cookieSameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes — matches ACCESS_TOKEN_EXPIRES_IN default
  });
};

export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: cookieSameSite,
  });
};

// ── Refresh Token Cookie ─────────────────────────────────────────
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: cookieSameSite,
  });
};

import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

// ── Token Payload Type ─────────────────────────────────────────
export interface TokenPayload {
  userId: string;
  role: string;
}

// ── Generate Access Token ──────────────────────────────────────
// Short-lived: 15 minutes — stored in memory (Zustand)
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]  });
};

// ── Generate Refresh Token ─────────────────────────────────────
// Long-lived: 7 days — stored in HttpOnly cookie
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

// ── Set Refresh Token Cookie ───────────────────────────────────
// HttpOnly: JS cannot read it — XSS safe
// Secure: only sent over HTTPS in production
import { Response } from "express";

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

// ── Clear Refresh Token Cookie ─────────────────────────────────
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "none",
  });
};

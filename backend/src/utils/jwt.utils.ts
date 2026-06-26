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
//
// In production, frontend (Vercel) and backend (Render) live on different
// domains, so the browser treats this as a cross-site request. Cross-site
// cookies require sameSite: "none" + secure: true, otherwise the browser
// SILENTLY DROPS the cookie entirely (no console error — it just never
// gets stored). This was the actual root cause of "refresh token not
// found" in production: sameSite was correctly "none" but secure wasn't
// reliably tied to it.
//
// isProd/cookieSameSite are computed fresh on every call (not cached at
// module-load time) so they always reflect the current ENV.NODE_ENV,
// and secure is derived directly from sameSite rather than as a separate
// flag — sameSite:"none" requires secure:true by spec, so keeping them
// as two independently-set booleans was a latent bug waiting to
// desync if either one was computed at the wrong time.
function getCookieOptions() {
  const isProd = ENV.NODE_ENV === "production";
  const sameSite = isProd ? ("none" as const) : ("lax" as const);
  return {
    httpOnly: true,
    secure: sameSite === "none" ? true : isProd, // none ALWAYS implies secure
    sameSite,
  };
}

// ── Access Token Cookie ──────────────────────────────────────────
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    ...getCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 minutes — matches ACCESS_TOKEN_EXPIRES_IN default
  });
};

export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie("accessToken", getCookieOptions());
};

// ── Refresh Token Cookie ─────────────────────────────────────────
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    ...getCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", getCookieOptions());
};

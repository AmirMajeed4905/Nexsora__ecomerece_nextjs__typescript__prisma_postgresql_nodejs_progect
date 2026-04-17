import { Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

// Generate Access Token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

// Verify Access Token
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET) as TokenPayload;
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as TokenPayload;
};

// ✅ FIXED COOKIE SET
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,

    // REQUIRED for Vercel + Render
    secure: true,

    // CRITICAL FIX (THIS IS THE MAIN BUG)
    sameSite: "none",

    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ✅ FIXED COOKIE CLEAR
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};

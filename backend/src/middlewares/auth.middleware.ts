import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";

// ── Extend Express Request ─────────────────────────────────────
// Adds req.user so controllers can access logged-in user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

// ── Auth Middleware ────────────────────────────────────────────
// Protects routes — requires a valid access token.
// Token comes from the httpOnly "accessToken" cookie, not an Authorization
// header — the frontend never holds the raw token in JS-readable storage,
// so it can't be stolen via XSS the way a localStorage token could be.
// Usage: router.get("/me", authMiddleware, asyncHandler(getMe))

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.accessToken;

  if (!token) {
    sendError(res, 401, "Access token required");
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    sendError(res, 401, "Invalid or expired access token");
  }
};

export default authMiddleware;
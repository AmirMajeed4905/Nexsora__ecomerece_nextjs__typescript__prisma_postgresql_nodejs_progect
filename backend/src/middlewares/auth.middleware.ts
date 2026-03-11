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
// Protects routes — requires valid access token in Authorization header
// Usage: router.get("/me", authMiddleware, asyncHandler(getMe))

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Get token from header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, 401, "Access token required");
    return;
  }

  const token = authHeader.split(" ")[1];

  // 2. Verify token
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    sendError(res, 401, "Invalid or expired access token");
  }
};

export default authMiddleware;
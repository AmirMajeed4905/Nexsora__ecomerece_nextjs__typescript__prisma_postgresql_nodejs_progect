import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";

// ── Role Middleware ────────────────────────────────────────────
// Must be used AFTER authMiddleware — requires req.user to exist
// Usage: router.get("/admin/users", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(getUsers))

const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 403, "Forbidden: insufficient permissions");
      return;
    }

    next();
  };
};

export default roleMiddleware;
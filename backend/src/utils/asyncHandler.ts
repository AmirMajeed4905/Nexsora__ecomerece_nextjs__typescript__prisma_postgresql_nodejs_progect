import { Request, Response, NextFunction } from "express";

// Wraps async controller functions — no need for try/catch in every controller
// Usage: router.post("/register", asyncHandler(authController.register))

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
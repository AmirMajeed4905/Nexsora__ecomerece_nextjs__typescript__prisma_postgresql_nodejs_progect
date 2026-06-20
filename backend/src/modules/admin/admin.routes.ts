import { Router } from "express";
import * as adminController from "./admin.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/stats", asyncHandler(adminController.getStats));

export default router;
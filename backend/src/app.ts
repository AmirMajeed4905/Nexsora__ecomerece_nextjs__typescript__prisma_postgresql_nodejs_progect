import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { ENV } from "./config/env";

import authRoutes from "./modules/auth/auth.routes";

const app = express();

// ── Security Middlewares ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true, // cookies allow karta hai
}));

// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//api documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Nexora API is running 🚀" });
});

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});



export default app;
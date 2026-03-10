import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env";

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

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Nexora API is running 🚀" });
});

export default app;
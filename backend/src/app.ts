import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import { generalLimiter, authLimiter, uploadLimiter, reviewLimiter } from "./middlewares/rateLimit.middleware";
import { ENV } from "./config/env";

import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/product/product.routes";
import categoryRoutes from "./modules/category/category.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import reviewRoutes from "./modules/review/review.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import adminRoutes from "./modules/admin/admin.routes";
import paymentRoutes from "./modules/payment/payment.routes";

const app = express();
const allowedOrigins = [
  ENV.CLIENT_URL?.replace(/\/$/, ""), // remove trailing slash safely
  "http://localhost:3000",
  "https://nexsora-amirmajeed4905s-projects.vercel.app",
  "https://nexsora-ecomerece-nextjs-typescript.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  })
);// ── Rate Limiting ─────────────────────────────────────────
app.use(generalLimiter);

app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ── Swagger ────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ 
    success: true,
    message: "Nexora API is running ✅",
    timestamp: new Date().toISOString()
  });
});

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth",       authLimiter,   authRoutes);
app.use("/api/products",   uploadLimiter, productRoutes);
app.use("/api/categories", uploadLimiter, categoryRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/reviews",    reviewLimiter, reviewRoutes);
app.use("/api/wishlist",   wishlistRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/payments",   paymentRoutes);   // ← Webhook ke liye important

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Endpoint not found" 
  });
});

// ── Global Error Handler (Must be last) ───────────────────────
app.use(errorHandler);

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import { generalLimiter, authLimiter, uploadLimiter, reviewLimiter } from "./middlewares/rateLimit.middleware";

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

// ── Security & CORS ───────────────────────────────────────
// ── Security & CORS ───────────────────────────────────────
app.use(helmet());

// Best CORS Setup for your case
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Production URL yahan add karo jab frontend deploy ho jaye
      // process.env.FRONTEND_URL || 'https://your-frontend.com'
    ];

    // Allow requests with no origin (like Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'stripe-signature'],
  exposedHeaders: ['Authorization']
}));
// ── Rate Limiting ─────────────────────────────────────────
app.use(generalLimiter);

// ── Body Parsers ───────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    return next();   // Skip json parser for webhook
  }
  express.json()(req, res, next);
});          // ← Added limit
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

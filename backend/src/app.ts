import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import { generalLimiter, authLimiter, uploadLimiter, reviewLimiter } from "./middlewares/rateLimit.middleware";

import authRoutes     from "./modules/auth/auth.routes";
import productRoutes  from "./modules/product/product.routes";
import categoryRoutes from "./modules/category/category.routes";
import cartRoutes     from "./modules/cart/cart.routes";
import orderRoutes    from "./modules/order/order.routes";
import reviewRoutes   from "./modules/review/review.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import adminRoutes from "./modules/admin/admin.routes";
// import paymentRoutes from "./modules/payment/payment.routes";

const app = express();

// ── Security Middlewares ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

// ── General Rate Limit ─────────────────────────────────────────
app.use(generalLimiter);

// ── Body Parsers ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Swagger Docs ───────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Nexora API is running" });
});

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth",       authLimiter,   authRoutes);
app.use("/api/products",   uploadLimiter, productRoutes);
app.use("/api/categories", uploadLimiter, categoryRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/reviews",    reviewLimiter, reviewRoutes);
app.use("/api/wishlist",   wishlistRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/payments", paymentRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found", data: null });
});

// ── Global Error Handler — Must be LAST ───────────────────────
app.use(errorHandler);

export default app;
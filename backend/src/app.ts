import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  reviewLimiter,
} from "./middlewares/rateLimit.middleware";

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

/* ───────────────────────────────
   SECURITY
─────────────────────────────── */
app.use(helmet());

/* ───────────────────────────────
   CORS (FIXED)
─────────────────────────────── */



// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);

//       // allow localhost
//       if (origin.includes("localhost:3000")) {
//         return callback(null, true);
//       }

//       // allow all vercel preview deployments
//       if (origin.endsWith(".vercel.app")) {
//         return callback(null, true);
//       }

//       return callback(null, false);
//     },
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: true,   // 🔥 allow ALL origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  })
);
/* ───────────────────────────────
   RATE LIMITING
─────────────────────────────── */
app.use(generalLimiter);

/* ───────────────────────────────
   BODY PARSERS
─────────────────────────────── */
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    return next();
  }
  return express.json({ limit: "10mb" })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* ───────────────────────────────
   SWAGGER
─────────────────────────────── */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ───────────────────────────────
   HEALTH CHECK
─────────────────────────────── */
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Nexora API is running ✅",
    timestamp: new Date().toISOString(),
  });
});

/* ───────────────────────────────
   ROUTES
─────────────────────────────── */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", uploadLimiter, productRoutes);
app.use("/api/categories", uploadLimiter, categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewLimiter, reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

/* ───────────────────────────────
   404 HANDLER
─────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

/* ───────────────────────────────
   GLOBAL ERROR HANDLER
─────────────────────────────── */
app.use(errorHandler);

export default app;

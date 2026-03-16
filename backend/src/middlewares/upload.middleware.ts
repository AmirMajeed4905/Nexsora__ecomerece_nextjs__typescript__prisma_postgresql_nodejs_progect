import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// ── Allowed MIME types ─────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// ── Memory Storage ─────────────────────────────────────────────
// File buffer RAM mein store hoga — seedha Cloudinary ko bhejein ge
const storage = multer.memoryStorage();

// ── File Filter ────────────────────────────────────────────────
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

// ── Single Image Upload ────────────────────────────────────────
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("image");

// ── Multiple Images Upload (max 5) ─────────────────────────────
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).array("images", 5);
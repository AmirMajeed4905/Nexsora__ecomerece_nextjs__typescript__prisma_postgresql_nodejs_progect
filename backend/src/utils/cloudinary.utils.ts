import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

// ── Types ──────────────────────────────────────────────────────
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

// ── Folders ───────────────────────────────────────────────────
// Organized folder structure in Cloudinary
export const CLOUDINARY_FOLDERS = {
  PRODUCTS: "nexora/products",
  CATEGORIES: "nexora/categories",
  AVATARS: "nexora/avatars",
} as const;

// ── Upload Single Image ────────────────────────────────────────
// Buffer (multer memory storage) se seedha Cloudinary pe upload
export const uploadImage = (
  buffer: Buffer,
  folder: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            width: options?.width || 800,
            height: options?.height,
            crop: "limit",
            quality: options?.quality || "auto",
            fetch_format: "auto", // Auto WebP/AVIF for modern browsers
          },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

// ── Upload Multiple Images ─────────────────────────────────────
export const uploadMultipleImages = async (
  buffers: Buffer[],
  folder: string
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = buffers.map((buffer) => uploadImage(buffer, folder));
  return Promise.all(uploadPromises);
};

// ── Delete Image ───────────────────────────────────────────────
// publicId se image delete karo (e.g. "nexora/products/abc123")
export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

// ── Delete Multiple Images ─────────────────────────────────────
export const deleteMultipleImages = async (publicIds: string[]): Promise<void> => {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds);
};

// ── Update Image ───────────────────────────────────────────────
// Purani image delete karo, nayi upload karo
export const updateImage = async (
  oldPublicId: string,
  newBuffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> => {
  // Delete old image (ignore error if not found)
  try {
    await deleteImage(oldPublicId);
  } catch {
    // Old image nahi mili — koi baat nahi, continue karo
  }

  // Upload new image
  return uploadImage(newBuffer, folder);
};

// ── Extract Public ID from URL ─────────────────────────────────
// Cloudinary URL se publicId nikalo
// e.g. "https://res.cloudinary.com/xxx/image/upload/v123/nexora/products/abc.webp"
// returns "nexora/products/abc"
export const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return "";

  // Version skip karo (v1234567890)
  const afterUpload = parts.slice(uploadIndex + 1);
  if (afterUpload[0]?.startsWith("v")) {
    afterUpload.shift();
  }

  // Extension hatao
  const lastPart = afterUpload[afterUpload.length - 1];
  afterUpload[afterUpload.length - 1] = lastPart.split(".")[0];

  return afterUpload.join("/");
};
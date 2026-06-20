import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Shared API error message extractor ───────────────────────────
// Axios errors carry the backend's message at error.response.data.message.
// This was previously duplicated ~11 times across pages/stores with
// inconsistent typing (some used `any`, some a verbose inline cast).
// Centralizing it here keeps every catch block consistent and type-safe.
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  return fallback;
}

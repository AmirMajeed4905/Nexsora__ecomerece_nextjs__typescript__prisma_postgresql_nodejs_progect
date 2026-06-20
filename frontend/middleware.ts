import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const pathname = request.nextUrl.pathname;

  const adminRoutes = ["/admin"];
  const protectedRoutes = ["/wishlist", "/checkout", "/orders", "/account", "/cart"];
  const authRoutes = ["/login", "/register"];

  const isAuthenticated = Boolean(refreshToken);
  const isAdmin = userRole?.toLowerCase() === "admin";

  // ── ADMIN PROTECTION ──────────────────────────────────
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── PROTECTED USER ROUTES ─────────────────────────────
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── AUTH PAGES (login/register) ───────────────────────
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// ── Routes this middleware runs on ─────────────────────
export const config = {
  matcher: [
    "/admin/:path*",
    "/wishlist",
    "/checkout",
    "/cart",
    "/orders/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};

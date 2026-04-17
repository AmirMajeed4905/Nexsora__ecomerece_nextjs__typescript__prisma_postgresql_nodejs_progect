import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/cart", "/wishlist", "/checkout", "/orders", "/account"];
  const adminRoutes = ["/admin"];
  const authRoutes = ["/login", "/register"];

  // Protected route + no token → login pe bhejo
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route + no token → login pe bhejo
  if (adminRoutes.some((route) => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth route + token hai → home pe bhejo
  // Lekin sirf tab jab token genuinely valid ho
  if (authRoutes.some((route) => pathname === route) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart", "/wishlist", "/checkout", "/orders/:path*", "/admin/:path*", "/account/:path*", "/login", "/register"],
};
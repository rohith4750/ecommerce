import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const url = request.nextUrl.clone();
  const isAuthRoute = url.pathname.startsWith("/login") || url.pathname.startsWith("/register");
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isProtectedRoute =
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/orders") ||
    url.pathname.startsWith("/wishlist") ||
    url.pathname.startsWith("/checkout");

  if (!accessToken && !refreshToken) {
    if (isProtectedRoute || isAdminRoute) {
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  } else {
    // If the user has a session and is trying to access auth pages, redirect to home page
    if (isAuthRoute) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute) {
      try {
        const token = accessToken || refreshToken || "";
        const parts = token.split(".");
        if (parts.length === 3) {
          // Edge-safe base64 decoding
          const payloadPart = parts[1];
          const decodedPayload = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
          const payload = JSON.parse(decodedPayload);
          
          if (payload.role !== "ADMIN") {
            url.pathname = "/";
            return NextResponse.redirect(url);
          }
        } else {
          url.pathname = "/login";
          return NextResponse.redirect(url);
        }
      } catch (err) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

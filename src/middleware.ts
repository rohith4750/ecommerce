import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const url = request.nextUrl.clone();
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isProtectedRoute =
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/orders") ||
    url.pathname.startsWith("/wishlist") ||
    url.pathname.startsWith("/checkout");

  // Check if the token is actually valid (not expired)
  let isValidSession = false;
  const token = accessToken || refreshToken || "";

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const decodedPayload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(decodedPayload);
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          isValidSession = true;
        }
      }
    } catch (err) {
      // Token is malformed
    }
  }

  if (!isValidSession) {
    const response = isProtectedRoute || isAdminRoute
      ? (() => {
          url.pathname = "/login";
          url.searchParams.set("redirect", request.nextUrl.pathname);
          return NextResponse.redirect(url);
        })()
      : NextResponse.next();

    if (token) {
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
    }
    return response;
  }

  // Valid session — check admin role for admin routes
  if (isAdminRoute) {
    try {
      const parts = token.split(".");
      const decodedPayload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(decodedPayload);

      if (payload.role !== "ADMIN") {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } catch (err) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
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
  ],
};

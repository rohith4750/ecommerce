import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    let payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      // Access token expired/missing, check refresh token
      const refreshToken = cookieStore.get("refreshToken")?.value;
      const refreshPayload = refreshToken ? verifyRefreshToken(refreshToken) : null;

      if (!refreshPayload) {
        return NextResponse.json(
          { error: "Unauthorized: Session expired or invalid" },
          { status: 401 }
        );
      }

      // Check if user still exists
      const user = await db.user.findUnique({
        where: { id: refreshPayload.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User account not found" },
          { status: 401 }
        );
      }

      // Rotate access token
      payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = signAccessToken(payload);
      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 mins
        path: "/",
      });
    }

    // Fetch fresh user record
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Get Me Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

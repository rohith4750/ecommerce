import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    let payload = accessToken ? verifyAccessToken(accessToken) : null;

    if (!payload) {
      const refreshToken = cookieStore.get("refreshToken")?.value;
      const refreshPayload = refreshToken ? verifyRefreshToken(refreshToken) : null;

      if (!refreshPayload) return null;

      const user = await db.user.findUnique({
        where: { id: refreshPayload.userId },
      });

      if (!user) return null;

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
        maxAge: 15 * 60,
        path: "/",
      });
    }

    return payload;
  } catch (error) {
    console.error("Auth helper error", error);
    return null;
  }
}

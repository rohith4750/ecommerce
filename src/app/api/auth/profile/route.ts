import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

export async function PATCH(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is a required field" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const updatedUser = await db.user.update({
      where: { id: payload.userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[Profile Update Error]", error);
    return NextResponse.json(
      { error: "Internal server error updating profile information" },
      { status: 500 }
    );
  }
}

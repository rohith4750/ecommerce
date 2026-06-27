import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required fields" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Check if user is already verified/activated
    if (!user.otpCode) {
      return NextResponse.json(
        { error: "Account is already verified and active" },
        { status: 400 }
      );
    }

    // Check if code matches
    if (user.otpCode !== code) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Check expiration
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Activate user
    const activatedUser = await db.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Generate session tokens
    const payload = {
      userId: activatedUser.id,
      email: activatedUser.email,
      role: activatedUser.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store in httpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      message: "Account verified successfully",
      user: {
        id: activatedUser.id,
        name: activatedUser.name,
        email: activatedUser.email,
        role: activatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("[Verify OTP Error]", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { sendEmail, getWelcomeTemplate } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate a random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user in inactive/verification state
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        otpCode,
        otpExpiresAt,
        role: "USER",
      },
    });

    // Send simulated email
    await sendEmail({
      to: email,
      subject: "Verify your OmniStore account",
      html: getWelcomeTemplate(name, otpCode),
    });

    return NextResponse.json({
      message: "Registration successful. Verification OTP sent to email.",
      email: user.email,
    });
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

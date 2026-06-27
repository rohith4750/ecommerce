import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { Role, DiscountType } from "@prisma/client";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const discounts = await db.discount.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ discounts });
  } catch (error: any) {
    console.error("[Get Discounts Error]", error);
    return NextResponse.json(
      { error: "Internal server error fetching discounts logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, value, minCartValue, startDate, endDate, category } = body;

    if (!code || !type || value === undefined || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required discount fields" }, { status: 400 });
    }

    const discount = await db.discount.create({
      data: {
        code: code.toUpperCase(),
        type: type as DiscountType,
        value: parseFloat(value),
        minCartValue: parseFloat(minCartValue || "0"),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category: category || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Discount coupon created successfully",
      discount,
    });
  } catch (error: any) {
    console.error("[Create Discount Error]", error);
    return NextResponse.json(
      { error: "Internal server error registering discount coupon" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { discountId, isActive } = await req.json();

    if (!discountId || isActive === undefined) {
      return NextResponse.json({ error: "Discount ID and active toggle status required" }, { status: 400 });
    }

    const discount = await db.discount.update({
      where: { id: discountId },
      data: { isActive },
    });

    return NextResponse.json({
      message: "Discount coupon status updated successfully",
      discount,
    });
  } catch (error: any) {
    console.error("[Toggle Discount Error]", error);
    return NextResponse.json(
      { error: "Internal server error modifying discount coupon status" },
      { status: 500 }
    );
  }
}

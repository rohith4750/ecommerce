import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code, cartSubtotal, cartItems } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const discount = await db.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
    }

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (cartSubtotal < discount.minCartValue) {
      return NextResponse.json(
        {
          error: `Minimum order value of ₹${discount.minCartValue.toLocaleString(
            "en-IN"
          )} required for this coupon`,
        },
        { status: 400 }
      );
    }

    // Check for category restriction (if set)
    if (discount.category && Array.isArray(cartItems)) {
      const hasRestrictedCategory = cartItems.some(
        (item: any) => item.category?.toLowerCase() === discount.category?.toLowerCase()
      );
      // Wait, let's also allow product lookup from db if item category is missing
      if (!hasRestrictedCategory) {
        return NextResponse.json(
          { error: `This coupon is only applicable on ${discount.category} products.` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      message: "Coupon applied successfully!",
      coupon: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        minCartValue: discount.minCartValue,
      },
    });
  } catch (error: any) {
    console.error("[Apply Coupon Error]", error);
    return NextResponse.json(
      { error: "Internal server error applying coupon" },
      { status: 500 }
    );
  }
}

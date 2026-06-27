import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { PaymentStatus, OrderStatus, Channel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingAddress, couponCode, totalAmount, discountAmount } = await req.json();

    if (!cartItems || cartItems.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Cart items and shipping address are required" }, { status: 400 });
    }

    // Get current user if logged in
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;
    const userId = payload ? payload.userId : null;

    // Check stocks for all cart items before proceeding
    for (const item of cartItems) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || product.stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.name}". Only ${product?.stock ?? 0} items remaining.` },
          { status: 400 }
        );
      }
    }

    // Generate Unique formatted order ID: SR-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `SR-${dateStr}-${randSuffix}`;

    // Simulated Razorpay Order ID
    const rzpOrderId = `rzp_order_${Math.random().toString(36).substring(2, 14)}`;

    // Create order in DB with PENDING payment
    const order = await db.order.create({
      data: {
        orderId,
        userId,
        items: cartItems,
        shippingAddress,
        paymentMethod: "razorpay",
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId: rzpOrderId,
        orderStatus: OrderStatus.PLACED,
        channel: Channel.WEBSITE,
        totalAmount,
        discount: discountAmount || 0,
        couponCode: couponCode || null,
      },
    });

    return NextResponse.json({
      orderId: order.orderId,
      razorpayOrderId: rzpOrderId,
      amount: Math.round(totalAmount * 100), // Razorpay expects paise
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid123",
    });
  } catch (error: any) {
    console.error("[Create Razorpay Order Error]", error);
    return NextResponse.json(
      { error: "Internal server error creating purchase order" },
      { status: 500 }
    );
  }
}

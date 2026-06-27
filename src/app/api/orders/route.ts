import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { PaymentStatus, OrderStatus, Channel } from "@prisma/client";
import { sendEmail, getOrderPlacedTemplate, getLowStockAlertTemplate } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Access token missing" }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized: Session invalid or expired" }, { status: 401 });
    }

    let orders;
    if (payload.role === "ADMIN") {
      orders = await db.order.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      orders = await db.order.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[Get Orders Error]", error);
    return NextResponse.json(
      { error: "Internal server error fetching orders history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { cartItems, shippingAddress, couponCode, totalAmount, discountAmount, paymentMethod } = await req.json();

    if (!cartItems || cartItems.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Cart items and shipping address are required" }, { status: 400 });
    }

    if (paymentMethod !== "cod") {
      return NextResponse.json({ error: "Invalid payment method for this endpoint" }, { status: 400 });
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

    // Generate Unique formatted order ID: OS-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `OS-${dateStr}-${randSuffix}`;

    // Create order in DB with PENDING payment (COD is paid on delivery)
    const order = await db.order.create({
      data: {
        orderId,
        userId,
        items: cartItems,
        shippingAddress,
        paymentMethod: "cod",
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PLACED,
        channel: Channel.WEBSITE,
        totalAmount,
        discount: discountAmount || 0,
        couponCode: couponCode || null,
      },
    });

    // Deduct stock levels for items purchased immediately
    for (const item of cartItems) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newStock = Math.max(0, product.stock - item.qty);
        
        await db.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });

        // Trigger admin email alert if stock falls below the warning limit (< 5 units)
        if (newStock < 5) {
          const adminAlertHtml = getLowStockAlertTemplate(product.name, product.sku, newStock);
          await sendEmail({
            to: process.env.EMAIL_FROM || "admin@omnistore.com", // Fallback email
            subject: `⚠️ Low Stock Warning: ${product.name}`,
            html: adminAlertHtml,
          });
        }
      }
    }

    // Increment coupon usage statistics (if coupon was checked out)
    if (couponCode) {
      try {
        await db.discount.update({
          where: { code: couponCode },
          data: {
            usageCount: { increment: 1 },
          },
        });
      } catch (couponError) {
        console.warn("Failed to update coupon usage counters", couponError);
      }
    }

    // Send customer receipt confirmation email
    let userEmail = "customer@omnistore.com";
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) userEmail = user.email;
    }

    const orderEmailHtml = getOrderPlacedTemplate(order.orderId, cartItems, order.totalAmount);
    await sendEmail({
      to: userEmail,
      subject: `Order Placed Successfully: ${order.orderId} 🛍`,
      html: orderEmailHtml,
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error("[Create COD Order Error]", error);
    return NextResponse.json(
      { error: "Internal server error creating COD order" },
      { status: 500 }
    );
  }
}

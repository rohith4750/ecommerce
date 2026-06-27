import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";
import { sendEmail, getOrderPlacedTemplate, getLowStockAlertTemplate } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "OrderId and PaymentId are required for validation" }, { status: 400 });
    }

    // Locate the pending order in the database
    const order = await db.order.findFirst({
      where: { razorpayOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Associated order record not found" }, { status: 404 });
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ message: "Order payment verified already", orderId: order.orderId });
    }

    // Update order status & link captured payment transaction details
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        razorpayPaymentId,
      },
    });

    // Deduct stock levels for items purchased
    const items = order.items as any[];
    for (const item of items) {
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
            to: "admin@silkroute.in",
            subject: `⚠️ Low Stock Warning: ${product.name}`,
            html: adminAlertHtml,
          });
        }
      }
    }

    // Increment coupon usage statistics (if coupon was checked out)
    if (order.couponCode) {
      try {
        await db.discount.update({
          where: { code: order.couponCode },
          data: {
            usageCount: { increment: 1 },
          },
        });
      } catch (couponError) {
        console.warn("Failed to update coupon usage counters", couponError);
      }
    }

    // Send customer receipt confirmation email
    let userEmail = "customer@silkroute.in";
    if (order.userId) {
      const user = await db.user.findUnique({ where: { id: order.userId } });
      if (user) userEmail = user.email;
    }

    const orderEmailHtml = getOrderPlacedTemplate(order.orderId, items, order.totalAmount);
    await sendEmail({
      to: userEmail,
      subject: `Order Confirmed: ${order.orderId} 🛍️`,
      html: orderEmailHtml,
    });

    return NextResponse.json({
      message: "Payment successfully verified and order confirmed",
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error("[Verify Payment Error]", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}

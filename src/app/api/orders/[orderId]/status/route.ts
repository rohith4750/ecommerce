import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { OrderStatus, Role } from "@prisma/client";
import { sendEmail, getOrderStatusUpdateTemplate } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required parameters" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Locate the target order record by UUID (which maps to the path variable orderId)
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order record not found" }, { status: 404 });
    }

    // If status is SHIPPED, check if tracking number is missing, and generate one
    const updateData: any = { orderStatus: status as OrderStatus };
    if (status === "SHIPPED" && !order.trackingNumber) {
      updateData.trackingNumber = `DEL${Math.floor(100000 + Math.random() * 900000)}IN`;
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Determine user email
    let userEmail = "customer@silkroute.in";
    if (order.userId) {
      const user = await db.user.findUnique({ where: { id: order.userId } });
      if (user) userEmail = user.email;
    }

    // Send order update confirmation email
    const emailHtml = getOrderStatusUpdateTemplate(
      order.orderId,
      status,
      updatedOrder.trackingNumber || undefined
    );
    
    await sendEmail({
      to: userEmail,
      subject: `Order status updated: ${order.orderId}`,
      html: emailHtml,
    });

    return NextResponse.json({
      message: "Order status modified successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("[Update Order Status Error]", error);
    return NextResponse.json(
      { error: "Internal server error modifying order status" },
      { status: 500 }
    );
  }
}

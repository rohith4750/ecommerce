import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order reference is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order record not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("[Get Order Detail Error]", error);
    return NextResponse.json(
      { error: "Internal server error fetching order record" },
      { status: 500 }
    );
  }
}

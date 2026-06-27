import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

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
      // Admins see all orders
      orders = await db.order.findMany({
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Customers only see their own orders
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

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    // 1. Total Revenue Aggregate
    const revenueSum = await db.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueSum._sum.totalAmount || 0;

    // 2. Orders Count (Total, Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, ordersToday, lowStockCount] = await db.$transaction([
      db.order.count({ where: { paymentStatus: "PAID" } }),
      db.order.count({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: today },
        },
      }),
      db.product.count({
        where: { stock: { lt: 5 } },
      }),
    ]);

    // 3. Low Stock Alerts
    const lowStockAlerts = await db.product.findMany({
      where: { stock: { lt: 5 } },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
      },
      take: 5,
    });

    // 4. Channel Breakdown
    const channels = ["WEBSITE", "AMAZON", "FLIPKART"];
    const channelData = await Promise.all(
      channels.map(async (c) => {
        const count = await db.order.count({
          where: { channel: c as any, paymentStatus: "PAID" },
        });
        return { name: c, value: count };
      })
    );

    // 5. Orders by Status Breakdown
    const statuses = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    const statusData = await Promise.all(
      statuses.map(async (s) => {
        const count = await db.order.count({
          where: { orderStatus: s as any },
        });
        return { name: s, value: count };
      })
    );

    // 6. Revenue Over Time (Past 7 days)
    const past7Days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const revenueChartData = await Promise.all(
      past7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const sumData = await db.order.aggregate({
          where: {
            paymentStatus: "PAID",
            createdAt: { gte: date, lt: nextDay },
          },
          _sum: { totalAmount: true },
        });

        const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
        return {
          day: dayName,
          revenue: sumData._sum.totalAmount || 0,
        };
      })
    );

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        ordersToday,
        lowStockCount,
      },
      lowStockAlerts,
      channelBreakdown: channelData,
      ordersByStatus: statusData,
      revenueOverTime: revenueChartData,
    });
  } catch (error: any) {
    console.error("[Get Admin Dashboard Stats Error]", error);
    return NextResponse.json(
      { error: "Internal server error reading dashboard summary" },
      { status: 500 }
    );
  }
}

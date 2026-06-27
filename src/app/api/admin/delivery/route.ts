import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Failed to fetch delivery zones", error);
    return NextResponse.json({ error: "Failed to fetch delivery zones" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prefix, transitDays, codAvailable, isServiceable } = body;

    if (!prefix) {
      return NextResponse.json({ error: "Pincode prefix is required" }, { status: 400 });
    }

    const existingZone = await db.deliveryZone.findUnique({
      where: { prefix }
    });

    if (existingZone) {
      return NextResponse.json({ error: "A delivery zone with this prefix already exists." }, { status: 400 });
    }

    const zone = await db.deliveryZone.create({
      data: {
        prefix,
        transitDays: parseInt(transitDays),
        codAvailable,
        isServiceable,
      }
    });

    return NextResponse.json({ zone, message: "Delivery zone created successfully" });
  } catch (error) {
    console.error("Failed to create delivery zone", error);
    return NextResponse.json({ error: "Failed to create delivery zone" }, { status: 500 });
  }
}

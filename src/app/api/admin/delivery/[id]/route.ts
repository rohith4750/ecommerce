import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { prefix, transitDays, codAvailable, isServiceable } = body;

    const zone = await db.deliveryZone.update({
      where: { id },
      data: {
        prefix,
        transitDays: parseInt(transitDays),
        codAvailable,
        isServiceable,
      }
    });

    return NextResponse.json({ zone, message: "Delivery zone updated" });
  } catch (error) {
    console.error("Failed to update delivery zone", error);
    return NextResponse.json({ error: "Failed to update delivery zone" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.deliveryZone.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Delivery zone deleted" });
  } catch (error) {
    console.error("Failed to delete delivery zone", error);
    return NextResponse.json({ error: "Failed to delete delivery zone" }, { status: 500 });
  }
}

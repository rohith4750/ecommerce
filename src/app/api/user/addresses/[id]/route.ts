import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    // Verify address ownership
    const existing = await db.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Handle isDefault update
    if (isDefault && !existing.isDefault) {
      await db.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        phone: phone !== undefined ? phone : existing.phone,
        street: street !== undefined ? street : existing.street,
        city: city !== undefined ? city : existing.city,
        state: state !== undefined ? state : existing.state,
        pincode: pincode !== undefined ? pincode : existing.pincode,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
      },
    });

    return NextResponse.json({ address: updated });
  } catch (error) {
    console.error("[PUT Address Error]", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify address ownership
    const existing = await db.address.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.address.delete({
      where: { id },
    });

    // If we deleted the default address, make the most recent address the default
    if (existing.isDefault) {
      const nextAddress = await db.address.findFirst({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await db.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE Address Error]", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

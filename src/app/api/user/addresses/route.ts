import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.address.findMany({
      where: { userId: user.userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("[GET Addresses Error]", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, street, city, state, pincode, isDefault } = body;

    if (!name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if this is the first address, make it default if so
    const addressCount = await db.address.count({
      where: { userId: user.userId },
    });
    
    const makeDefault = addressCount === 0 ? true : !!isDefault;

    // If making this one default, update other user addresses to not be default
    if (makeDefault) {
      await db.address.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: user.userId,
        name,
        phone,
        street,
        city,
        state,
        pincode,
        isDefault: makeDefault,
      },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("[POST Address Error]", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

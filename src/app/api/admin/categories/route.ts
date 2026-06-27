import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[Categories GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, group } = body;

    if (!name || !group) {
      return NextResponse.json({ error: "Name and group are required" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        group,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("[Categories POST Error]", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

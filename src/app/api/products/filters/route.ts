import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany({
      select: { category: true, type: true },
    });

    const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).sort();
    const uniqueTypes = Array.from(new Set(products.map((p) => p.type))).sort();

    return NextResponse.json({
      categories: uniqueCategories,
      types: uniqueTypes,
    });
  } catch (error) {
    console.error("[Filters Error]", error);
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 });
  }
}

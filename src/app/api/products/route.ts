import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse filters
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const color = searchParams.get("color") || "";
    const size = searchParams.get("size") || "";
    const gender = searchParams.get("gender") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
    const sortBy = searchParams.get("sort") || "newest";
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build query conditions
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (type) {
      where.type = { equals: type, mode: "insensitive" };
    }
    if (gender) {
      where.gender = { equals: gender, mode: "insensitive" };
    }

    if (color) {
      // Product colors are stored as an array of strings in PostgreSQL
      // Check if the color array has intersection or contains it
      where.color = { hasSome: color.split(",") };
    }

    if (size) {
      where.size = { hasSome: size.split(",") };
    }

    // Handle prices (salePrice is checked first, then original price)
    where.AND = [
      {
        OR: [
          {
            AND: [
              { salePrice: { not: null } },
              { salePrice: { gte: minPrice, lte: maxPrice } }
            ]
          },
          {
            AND: [
              { salePrice: null },
              { price: { gte: minPrice, lte: maxPrice } }
            ]
          }
        ]
      }
    ];

    if (searchQuery) {
      where.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { description: { contains: searchQuery, mode: "insensitive" } },
          { category: { contains: searchQuery, mode: "insensitive" } },
          { type: { contains: searchQuery, mode: "insensitive" } },
          { tags: { has: searchQuery.toLowerCase() } }
        ]
      });
    }

    // Build sorting parameters
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "popular") {
      orderBy = { ratingAverage: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    // Fetch counts and products in parallel
    const [totalProducts, products] = await db.$transaction([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error: any) {
    console.error("[Get Products Error]", error);
    return NextResponse.json(
      { error: "Internal server error fetching products" },
      { status: 500 }
    );
  }
}

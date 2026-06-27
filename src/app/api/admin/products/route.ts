import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, category, type, price, salePrice, stock, color, size, description, amazonASIN, flipkartFSN } = body;

    if (!name || !category || !type || !price || stock === undefined || !color || !size) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const randNum = Math.floor(100 + Math.random() * 900).toString();
    const slug = `${type.toLowerCase().replace(/\s+/g, "-")}-${category.toLowerCase().replace(/\s+/g, "-")}-${color[0].toLowerCase().replace(/\s+/g, "-")}-${randNum}`;
    const sku = `OS-${category.substring(0, 3).toUpperCase()}-${type.substring(0, 3).toUpperCase()}-${randNum}`;

    // Sample default Unsplash picture if none provided
    const sampleImg = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80";

    const product = await db.product.create({
      data: {
        name,
        slug,
        sku,
        description: description || `Premium ${name}. Exquisite styling, premium breathable fabric, and fine stitched detailing.`,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        discountPercent: salePrice ? Math.round(((price - salePrice) / price) * 100) : null,
        images: [sampleImg],
        category,
        type,
        color: Array.isArray(color) ? color : [color],
        size: Array.isArray(size) ? size : [size],
        stock: parseInt(stock),
        amazonASIN: amazonASIN || null,
        flipkartFSN: flipkartFSN || null,
        isFeatured: false,
      },
    });

    return NextResponse.json({
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("[Create Product Error]", error);
    return NextResponse.json(
      { error: "Internal server error creating product" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { productId, stock, price, salePrice } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (price !== undefined) updateData.price = parseFloat(price);
    
    if (salePrice !== undefined) {
      updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
      if (price !== undefined) {
        updateData.discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : null;
      }
    }

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    console.error("[Update Product Error]", error);
    return NextResponse.json(
      { error: "Internal server error updating product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload || payload.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const deleteAll = searchParams.get("deleteAll");

    if (deleteAll === "true") {
      await db.product.deleteMany({});
      return NextResponse.json({
        message: "All products deleted successfully",
      });
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete Product Error]", error);
    return NextResponse.json(
      { error: "Internal server error deleting product" },
      { status: 500 }
    );
  }
}

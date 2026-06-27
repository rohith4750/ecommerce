import { PrismaClient, Role, DiscountType } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing data...");
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");
  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "SilkRoute Admin",
      email: "admin@silkroute.in",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Rohith Palagummi",
      email: "customer@silkroute.in",
      passwordHash: customerPasswordHash,
      role: Role.USER,
    },
  });

  console.log(`Created admin: ${admin.email}`);
  console.log(`Created customer: ${customer.email}`);

  console.log("Creating discounts/coupons...");
  const discounts = [
    {
      code: "FESTIVE20",
      type: DiscountType.PERCENTAGE,
      value: 20,
      minCartValue: 2000,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      category: "Silk",
    },
    {
      code: "GOLDEN1000",
      type: DiscountType.FIXED,
      value: 1000,
      minCartValue: 5000,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    },
    {
      code: "WELCOME300",
      type: DiscountType.FIXED,
      value: 300,
      minCartValue: 1500,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    }
  ];

  for (const d of discounts) {
    await prisma.discount.create({ data: d });
  }

  console.log("Creating 50 sample saree products...");

  const sareeImages = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610030470204-7117e33e5c9b?w=800&auto=format&fit=crop&q=80"
  ];

  const categories = ["Silk", "Cotton", "Georgette", "Chiffon", "Organza", "Crepe"];
  const types = ["Banarasi", "Kanjeevaram", "Chanderi", "Bandhani", "Patola", "Mysore Silk", "Sambalpuri"];
  const colors = ["Royal Red", "Silk Purple", "Golden Yellow", "Emerald Green", "Peacock Blue", "Magenta Pink", "Classic Black", "Ivory Cream"];
  const sizes = ["Free Size (5.5m + 0.8m Blouse)", "6.3m (With Blouse Piece)", "5.5m (No Blouse)"];
  
  const tags = ["handwoven", "festive", "wedding", "luxury", "artisanal", "traditional", "partywear"];

  for (let i = 1; i <= 50; i++) {
    const category = categories[i % categories.length];
    const type = types[i % types.length];
    const colorVal = colors[i % colors.length];
    const isFeatured = i <= 6; // First 6 featured on carousel
    
    const price = Math.round(3500 + Math.random() * 15000);
    const hasDiscount = Math.random() > 0.4;
    const salePrice = hasDiscount ? Math.round(price * 0.8) : null;
    const discountPercent = salePrice ? 20 : null;

    const slug = `${type.toLowerCase().replace(/\s+/g, "-")}-${category.toLowerCase().replace(/\s+/g, "-")}-${colorVal.toLowerCase().replace(/\s+/g, "-")}-${i}`;
    const sku = `SR-${category.substring(0, 3).toUpperCase()}-${type.substring(0, 3).toUpperCase()}-${i.toString().padStart(3, "0")}`;

    // Select primary and secondary image
    const primaryImg = sareeImages[(i - 1) % sareeImages.length];
    const secondaryImg = sareeImages[i % sareeImages.length];

    await prisma.product.create({
      data: {
        name: `Premium ${colorVal} ${type} ${category} Saree`,
        slug,
        sku,
        description: `Experience the grandeur of traditional Indian heritage with this exquisite ${colorVal} ${type} ${category} Saree. Handcrafted by master weavers, it features delicate zari work, intricate border detailing, and a luxurious drape perfect for weddings, festivals, and milestones. Comes with a matching blouse piece.`,
        price,
        salePrice,
        discountPercent,
        images: [primaryImg, secondaryImg],
        category,
        type,
        color: [colorVal],
        size: [sizes[i % sizes.length]],
        gender: "Women",
        stock: Math.round(2 + Math.random() * 18),
        amazonASIN: i % 3 === 0 ? `B07X${i.toString().padStart(4, "9")}SR` : null,
        flipkartFSN: i % 4 === 0 ? `SRE${i.toString().padStart(9, "8")}XYZ` : null,
        isFeatured,
        ratingAverage: Math.round((4.0 + Math.random() * 1.0) * 10) / 10,
        ratingCount: Math.round(5 + Math.random() * 95),
        tags: [category.toLowerCase(), type.toLowerCase(), tags[i % tags.length], tags[(i + 1) % tags.length]],
      },
    });
  }

  console.log("Database seeded successfully with 50 products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting deletion of all products...");
  try {
    const deletedCartItems = await prisma.cartItem.deleteMany({});
    console.log(`Deleted ${deletedCartItems.count} cart items.`);
    
    const deletedWishlistItems = await prisma.wishlistItem.deleteMany({});
    console.log(`Deleted ${deletedWishlistItems.count} wishlist items.`);

    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`Successfully deleted ${deletedProducts.count} products.`);
    
    const usersCount = await prisma.user.count();
    console.log(`Kept ${usersCount} users intact.`);
  } catch (e) {
    console.error("Error during deletion:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

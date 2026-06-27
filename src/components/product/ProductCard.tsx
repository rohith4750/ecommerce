"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import QuickViewModal from "./QuickViewModal";

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  discountPercent: number | null;
  images: string[];
  category: string;
  type: string;
  color: string[];
  size: string[];
  stock: number;
  ratingAverage: number;
  ratingCount: number;
  description: string;
  amazonASIN?: string | null;
  flipkartFSN?: string | null;
}

interface ProductCardProps {
  product: StoreProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart, showToast } = useStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const displayPrice = product.salePrice ?? product.price;
  const originalPrice = product.price;
  const isDiscounted = !!product.salePrice;

  // Toggle local database sync for wishlist or store state
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(product.id);
    if (!isWishlisted) {
      showToast(`Added "${product.name}" to wishlist`, "success");
    } else {
      showToast(`Removed "${product.name}" from wishlist`, "info");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      showToast("Sorry, this item is out of stock!", "error");
      return;
    }

    addToCart(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: product.images[0],
        maxStock: product.stock,
      },
      1
    );
    showToast(`Added "${product.name}" to bag`, "success");
  };

  return (
    <>
      <div
        className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-brand-primary/5 transition-all hover:-translate-y-1 hover:shadow-md"
        onMouseEnter={() => setHoveredImage(true)}
        onMouseLeave={() => setHoveredImage(false)}
      >
        {/* Product Image Wrapper */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <Link href={`/products/${product.slug}`}>
            <img
              src={
                hoveredImage && product.images[1]
                  ? product.images[1]
                  : product.images[0]
              }
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-700 ease-in-out group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isDiscounted && (
              <span className="rounded bg-danger px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm">
                -{product.discountPercent}% OFF
              </span>
            )}
            {product.stock > 0 && product.stock <= 4 && (
              <span className="rounded bg-brand-secondary px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm animate-pulse">
                ONLY {product.stock} LEFT
              </span>
            )}
            {product.stock <= 0 && (
              <span className="rounded bg-gray-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Quick Action Heart */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:bg-white hover:scale-110 border border-brand-primary/5 text-gray-500 hover:text-rose-600"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? "fill-rose-600 text-rose-600" : ""
              }`}
            />
          </button>

          {/* Hover Actions Bar */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-md hover:scale-110"
              title="Quick View"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddToCart}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-md hover:scale-110"
              title="Add to Bag"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Details Content */}
        <div className="flex flex-1 flex-col p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
            {product.type} • {product.category}
          </span>
          <h3 className="mt-1 font-serif text-sm font-semibold tracking-wide text-brand-dark line-clamp-1">
            <Link href={`/products/${product.slug}`} className="hover:text-brand-primary transition-colors">
              {product.name}
            </Link>
          </h3>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex text-amber-400">
              {"★".repeat(Math.floor(product.ratingAverage))}
              {"☆".repeat(5 - Math.floor(product.ratingAverage))}
            </div>
            <span className="text-[10px] text-gray-400">({product.ratingCount})</span>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-brand-primary">
              ₹{displayPrice.toLocaleString("en-IN")}
            </span>
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Dialog Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import ProductCard, { StoreProduct } from "@/components/product/ProductCard";
import { Heart, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistItems() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Query products from database
        const res = await fetch("/api/products?limit=100");
        if (res.ok) {
          const data = await res.json();
          // Filter products matching our local wishlist IDs
          const filtered = (data.products as StoreProduct[]).filter((p) =>
            wishlist.includes(p.id)
          );
          setProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load wishlist items", err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistItems();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
        <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
        My Wishlist
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm max-w-lg mx-auto">
          <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold text-brand-dark">Your Wishlist is Empty</h2>
          <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Save your favorite items to your wishlist to check out later or share with family.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-primary/95 transition-all shadow-sm"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

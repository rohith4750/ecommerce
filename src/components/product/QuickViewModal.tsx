"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { StoreProduct } from "./ProductCard";

interface QuickViewModalProps {
  product: StoreProduct;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, showToast } = useStore();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const displayPrice = product.salePrice ?? product.price;
  const isDiscounted = !!product.salePrice;

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast("This item is out of stock", "error");
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      {/* Click-outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl z-10 animate-gold-glow flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-white/80 rounded-full p-1.5 border border-gray-100 shadow-sm z-20 transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Column 1: Images Showcase */}
        <div className="w-full md:w-1/2 p-6 bg-brand-surface/10 flex flex-col items-center justify-center">
          <div className="aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-lg border border-brand-primary/10 shadow-sm bg-white">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          
          {/* Thumbnail list */}
          <div className="mt-4 flex gap-2.5">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`h-14 w-11 rounded border overflow-hidden transition-all ${
                  selectedImage === img
                    ? "border-brand-primary ring-2 ring-brand-primary/20 scale-105"
                    : "border-gray-200"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover object-center" />
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Specs & Details */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
              {product.type} • {product.category}
            </span>
            <h2 className="mt-1 font-serif text-xl font-semibold text-brand-dark leading-tight">
              {product.name}
            </h2>

            {/* Ratings */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex text-amber-400 text-sm">
                {"★".repeat(Math.floor(product.ratingAverage))}
                {"☆".repeat(5 - Math.floor(product.ratingAverage))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {product.ratingAverage} ({product.ratingCount} reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="mt-4 flex items-baseline gap-2 border-b border-gray-100 pb-4">
              <span className="text-2xl font-bold text-brand-primary">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {isDiscounted && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Short Specs */}
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed font-sans line-clamp-4">
                {product.description}
              </p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-gray-500">
                <div>
                  <strong>Size:</strong> {product.size[0]}
                </div>
                <div>
                  <strong>SKU:</strong> {product.sku}
                </div>
                <div>
                  <strong>Stock Status:</strong>{" "}
                  {product.stock > 0 ? (
                    <span className="text-success font-semibold">In Stock ({product.stock})</span>
                  ) : (
                    <span className="text-danger font-semibold">Out of Stock</span>
                  )}
                </div>
                <div>
                  <strong>Category:</strong> {product.category}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/95 transition-all active:scale-[0.98]"
              disabled={product.stock <= 0}
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Shopping Bag
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-surface/20 px-6 py-3 text-sm font-semibold text-brand-primary transition-all"
            >
              View Full Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

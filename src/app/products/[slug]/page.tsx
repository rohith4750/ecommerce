"use client";

import { use, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { StoreProduct } from "@/components/product/ProductCard";
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  AlertCircle,
  Truck,
  RotateCcw,
  BadgeAlert,
  Loader2,
  Shirt,
  MapPin,
  CheckCircle2,
  XCircle,
  Navigation,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params); // Await dynamic route params in Next.js 15/16
  const { cart, wishlist, toggleWishlist, addToCart, showToast } = useStore();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  // Delivery State
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address && data.address.postcode) {
            setPincode(data.address.postcode);
            showToast("Pincode detected!", "success");
          } else {
            showToast("Could not detect pincode for your location.", "error");
          }
        } catch (error) {
          showToast("Failed to fetch location details.", "error");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        showToast("Location access denied.", "error");
      }
    );
  };

  const checkDelivery = async () => {
    if (pincode.length !== 6) {
      showToast("Please enter a valid 6-digit pincode.", "error");
      return;
    }
    setIsCheckingDelivery(true);
    setDeliveryInfo(null);
    try {
      const res = await fetch(`/api/delivery/check?pincode=${pincode}`);
      const data = await res.json();
      if (res.ok) {
        setDeliveryInfo(data);
      } else {
        showToast(data.error || "Failed to check delivery", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  // Load product details
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setSelectedImage(data.product.images[0]);
          
          // Track recently viewed products in localStorage
          const recentList = JSON.parse(localStorage.getItem("recently_viewed") || "[]") as any[];
          const filtered = recentList.filter((p) => p.id !== data.product.id);
          const updated = [
            {
              id: data.product.id,
              name: data.product.name,
              slug: data.product.slug,
              price: data.product.salePrice ?? data.product.price,
              image: data.product.images[0],
            },
            ...filtered,
          ].slice(0, 10); // Keep last 10
          localStorage.setItem("recently_viewed", JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Failed to load product detail", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
        <h3 className="font-serif text-lg font-semibold text-brand-dark">Product Not Found</h3>
        <p className="text-xs text-gray-400 mt-1">The item you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="mt-4 inline-block text-xs font-bold text-brand-primary hover:underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const displayPrice = product.salePrice ?? product.price;
  const isDiscounted = !!product.salePrice;

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    if (!isWishlisted) {
      showToast(`Added "${product.name}" to wishlist`, "success");
    } else {
      showToast(`Removed "${product.name}" from wishlist`, "info");
    }
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast("Sorry, this item is out of stock", "error");
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
      quantity
    );
    showToast(`Added ${quantity} "${product.name}" to bag`, "success");
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this gorgeous ${product.name} at OmniStore: ${window.location.origin}/products/${product.slug}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="bg-white rounded-xl border border-brand-primary/5 p-4 sm:p-6 md:p-10 shadow-sm animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Images Columns */}
        <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-4">
          {/* Vertical thumbnails */}
          <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`h-16 w-12 rounded border overflow-hidden shrink-0 transition-all ${
                  selectedImage === img
                    ? "border-brand-primary ring-2 ring-brand-primary/20 scale-105"
                    : "border-gray-200"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover object-center" />
              </button>
            ))}
          </div>

          {/* Main Showcase Image */}
          <div className="flex-1 order-1 md:order-2 aspect-[3/4] rounded-lg overflow-hidden border border-brand-primary/10 bg-gray-50 relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-500 hover:scale-110"
            />
            {isDiscounted && (
              <span className="absolute top-4 left-4 rounded bg-danger px-2.5 py-1 text-[10px] font-bold text-white shadow-sm z-10">
                SAVE {product.discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Category Breadcrumbs */}
            <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary">
              {product.type} • {product.category}
            </span>
            <h1 className="mt-2 font-serif text-2xl md:text-3xl font-bold tracking-wide text-brand-dark leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-amber-400">
                {"★".repeat(Math.floor(product.ratingAverage))}
                {"☆".repeat(5 - Math.floor(product.ratingAverage))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.ratingAverage}</span>
              <span className="text-xs text-gray-400">({product.ratingCount} Customer Reviews)</span>
            </div>

            {/* Price Detail */}
            <div className="mt-6 flex items-baseline gap-3 border-b border-gray-100 pb-6">
              <span className="text-3xl font-bold text-brand-primary">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-success bg-emerald-50 px-2 py-0.5 rounded">
                    Discount Applied
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 text-sm text-gray-600 font-sans leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Size Selector Guide */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-gray-400">Size Options</span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs font-semibold text-brand-primary hover:underline"
                >
                  Size & Product Guide
                </button>
              </div>
              <span className="inline-block rounded-lg border border-brand-primary/10 bg-brand-surface/20 px-3.5 py-2 text-xs font-medium text-brand-primary">
                {product.size[0]}
              </span>
            </div>

            {/* Stock Alert Status */}
            <div className="mt-6 flex items-center gap-2">
              {product.stock > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-success inline-block animate-ping" />
                  <span>In Stock (Ready to dispatch)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger inline-block" />
                  <span>Sold Out / Out of Stock</span>
                </div>
              )}
            </div>
          </div>

            {/* Marketplace Links */}
            {(product.amazonASIN || product.flipkartFSN) && (
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-full">Also Available On</span>
                {product.amazonASIN && (
                  <a
                    href={`https://www.amazon.in/dp/${product.amazonASIN}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#FF9900]/30 bg-[#FF9900]/5 px-4 py-2 text-xs font-bold text-brand-dark hover:bg-[#FF9900]/10 transition-colors"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-4" />
                  </a>
                )}
                {product.flipkartFSN && (
                  <a
                    href={`https://www.flipkart.com/search?q=${product.flipkartFSN}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border-[#2874F0]/30 bg-[#2874F0]/5 border px-4 py-2 text-xs font-bold text-[#2874F0] hover:bg-[#2874F0]/10 transition-colors"
                  >
                    <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png" alt="Flipkart" className="h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Delivery & Services Check */}
            <div className="mt-6 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <h4 className="text-sm font-bold text-brand-dark mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-primary" /> Delivery Options</span>
                <button 
                  onClick={handleAutoLocate} 
                  disabled={isLocating}
                  className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  Auto Locate
                </button>
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 text-sm border-gray-200 rounded-md focus:border-brand-primary focus:ring-brand-primary h-10 px-3"
                />
                <button
                  onClick={checkDelivery}
                  disabled={isCheckingDelivery || pincode.length !== 6}
                  className="bg-brand-primary text-white px-4 rounded-md text-xs font-bold disabled:opacity-50 transition-colors hover:bg-brand-primary/90 h-10 flex items-center justify-center min-w-[80px]"
                >
                  {isCheckingDelivery ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                </button>
              </div>

              {deliveryInfo && (
                <div className="mt-4 text-sm bg-white p-3 border border-gray-100 rounded-md shadow-sm">
                  {deliveryInfo.serviceable ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-success">
                        <CheckCircle2 className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="font-semibold text-brand-dark">Get it by {new Date(deliveryInfo.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-gray-500">Standard Delivery ({deliveryInfo.transitDays} Days)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        {deliveryInfo.codAvailable ? (
                          <><CheckCircle2 className="w-3 h-3 text-success" /> Cash on Delivery available</>
                        ) : (
                          <><XCircle className="w-3 h-3 text-danger" /> Cash on Delivery not available</>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-danger">
                      <XCircle className="w-4 h-4 mt-0.5" />
                      <p className="text-xs">{deliveryInfo.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity Select */}
              {product.stock > 0 && (
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-12 w-full sm:w-auto overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 hover:bg-gray-100 h-full font-bold transition-all text-gray-600"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-brand-dark min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 hover:bg-gray-100 h-full font-bold transition-all text-gray-600"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/95 transition-all active:scale-[0.98] h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                Add to Shopping Bag
              </button>

              <div className="flex gap-4 w-full sm:w-auto">
                {/* Wishlist */}
                <button
                  onClick={handleWishlistToggle}
                  className="flex-1 sm:flex-none flex items-center justify-center border border-brand-primary/20 hover:border-rose-600 hover:bg-rose-50/50 rounded-lg p-3 text-gray-600 hover:text-rose-600 transition-all h-12 w-auto"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
                </button>

                {/* WhatsApp Share */}
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 sm:flex-none flex items-center justify-center border border-brand-primary/20 hover:bg-brand-surface/20 rounded-lg p-3 text-brand-primary transition-all h-12 w-auto"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Product specifications grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-20 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h3 className="font-serif text-lg font-semibold text-brand-dark mb-4">Product Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <strong className="block text-gray-400 font-medium uppercase mb-1">Style</strong>
            <span className="font-semibold text-brand-dark">{product.type} Craft</span>
          </div>
          <div>
            <strong className="block text-gray-400 font-medium uppercase mb-1">Category</strong>
            <span className="font-semibold text-brand-dark">{product.category}</span>
          </div>
          <div>
            <strong className="block text-gray-400 font-medium uppercase mb-1">Size</strong>
            <span className="font-semibold text-brand-dark">{product.size[0]}</span>
          </div>
          <div>
            <strong className="block text-gray-400 font-medium uppercase mb-1">Unique SKU</strong>
            <span className="font-semibold text-brand-dark font-mono">{product.sku}</span>
          </div>
        </div>
      </div>

      {/* Drape Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowSizeGuide(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-10 border border-brand-primary/10">
            <div className="border border-brand-primary/10 rounded-xl p-6 bg-brand-primary/5">
              <h4 className="font-serif text-brand-dark font-semibold mb-3 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-brand-primary" />
                Product Guide
              </h4>
              <ul className="text-xs text-gray-600 space-y-3 leading-relaxed">
                <li>
                  <strong>Sizing & Fit:</strong> Please refer to the size chart for exact measurements.
                </li>
                <li>
                  <strong>Fabric Care:</strong> Handwash or dry clean only to maintain the premium quality of the material.
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full text-center py-2.5 bg-brand-primary text-white rounded-lg text-xs font-semibold"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

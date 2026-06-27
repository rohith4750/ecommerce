"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Trash2, ShoppingCart, Percent, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, appliedCoupon, applyCoupon, showToast } = useStore();
  const [couponCodeInput, setCouponCodeInput] = useState(appliedCoupon?.code || "");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Calculate discount amount
  let discountVal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountVal = Math.round(cartSubtotal * (appliedCoupon.value / 100));
    } else {
      discountVal = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - discountVal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/discounts/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput,
          cartSubtotal,
          cartItems: cart,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        applyCoupon(data.coupon);
        showToast(`Coupon "${data.coupon.code}" applied successfully!`, "success");
      } else {
        showToast(data.error || "Failed to validate coupon", "error");
      }
    } catch (err) {
      showToast("Server error applying coupon code", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponCodeInput("");
    showToast("Coupon removed", "info");
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm max-w-lg mx-auto mt-10">
        <ShoppingCart className="w-12 h-12 text-brand-primary/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-semibold text-brand-dark">Your Bag is Empty</h2>
        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          It looks like you haven't added any luxury sarees to your shopping bag yet. Explore our handwoven collections.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-primary/95 transition-all shadow-sm"
        >
          Explore Collection
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold text-brand-dark">Shopping Bag</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cart items list */}
        <div className="flex-1 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-brand-primary/5 shadow-sm"
            >
              <div className="w-20 h-24 rounded overflow-hidden border border-gray-100 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-brand-dark truncate">{item.name}</h3>
                <p className="text-xs font-bold text-brand-primary mt-1">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-9 overflow-hidden">
                <button
                  onClick={() => updateCartQty(item.productId, Math.max(1, item.qty - 1))}
                  className="px-2.5 hover:bg-gray-100 h-full font-bold text-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="px-2.5 text-xs font-bold text-brand-dark min-w-[24px] text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateCartQty(item.productId, Math.min(item.maxStock, item.qty + 1))}
                  className="px-2.5 hover:bg-gray-100 h-full font-bold text-gray-600 transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-brand-dark">
                  ₹{(item.price * item.qty).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => {
                    removeFromCart(item.productId);
                    showToast(`Removed "${item.name}" from bag`, "info");
                  }}
                  className="text-xs text-gray-400 hover:text-rose-600 transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon box */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-semibold text-brand-dark border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            {/* Coupons Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Have a coupon?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  disabled={!!appliedCoupon || validatingCoupon}
                  className="flex-1 rounded-lg border border-brand-primary/20 px-3 py-1.5 text-xs uppercase focus:border-brand-primary focus:outline-none"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded-lg bg-gray-100 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 px-3 text-xs font-semibold text-gray-600 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCodeInput.trim()}
                    className="rounded-lg bg-brand-primary text-white border border-brand-primary px-3 text-xs font-semibold hover:bg-brand-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-1 text-[10px] text-success font-semibold mt-1.5">
                  <Percent className="w-3 h-3" />
                  <span>Coupon code {appliedCoupon.code} applied.</span>
                </div>
              )}
            </form>

            {/* Pricing Details */}
            <div className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-dark">₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountVal.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-success font-semibold">FREE Delivery</span>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-bold text-brand-primary">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/95 transition-all active:scale-[0.98]"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

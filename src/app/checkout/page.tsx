"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { CreditCard, Landmark, QrCode, Wallet, ShieldCheck, HelpCircle } from "lucide-react";

export default function CheckoutPage() {
  const { cart, appliedCoupon, clearCart, showToast } = useStore();
  const router = useRouter();

  // Address form fields
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRzpSimulator, setShowRzpSimulator] = useState(false);
  const [rzpPayload, setRzpPayload] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Discount calculation
  let discountVal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountVal = Math.round(cartSubtotal * (appliedCoupon.value / 100));
    } else {
      discountVal = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - discountVal);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Form validation
    if (
      !address.name ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      showToast("Please fill in all shipping details", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/create-razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart,
          shippingAddress: address,
          couponCode: appliedCoupon?.code || null,
          totalAmount: grandTotal,
          discountAmount: discountVal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRzpPayload(data);
        setShowRzpSimulator(true);
      } else {
        showToast(data.error || "Order creation failed", "error");
      }
    } catch (err) {
      showToast("Server error preparing order checkout", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!rzpPayload) return;

    try {
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 14)}`;
      const mockSignature = `sig_${Math.random().toString(36).substring(2, 18)}`;

      const res = await fetch("/api/orders/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: rzpPayload.razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        showToast("Payment captured successfully!", "success");
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        showToast(data.error || "Signature verification failed", "error");
      }
    } catch (err) {
      showToast("Error executing payment verification", "error");
    } finally {
      setShowRzpSimulator(false);
    }
  };

  const handleSimulatePaymentFailure = () => {
    showToast("Simulated Razorpay transaction declined", "error");
    setShowRzpSimulator(false);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm max-w-sm mx-auto mt-10">
        <p className="text-sm text-gray-500">Your shopping bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl font-bold text-brand-dark">Secure Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Address Fields Forms */}
        <div className="md:col-span-2 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-brand-dark mb-4 pb-2 border-b border-gray-100">
            Shipping Address
          </h3>
          <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={address.name}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={address.phone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Postal Code (Pincode)
              </label>
              <input
                type="text"
                name="pincode"
                required
                value={address.pincode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                required
                value={address.address}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={address.city}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                required
                value={address.state}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white py-3 font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Place Order & Pay Now"}
              </button>
            </div>
          </form>
        </div>

        {/* Pricing Summary list */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm h-fit">
          <h3 className="font-serif text-base font-semibold text-brand-dark border-b border-gray-100 pb-3 mb-4">
            Items Curation
          </h3>
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-3 py-3 text-xs">
                <img src={item.image} alt="" className="w-10 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-dark truncate">{item.name}</p>
                  <p className="text-gray-400 mt-0.5">Qty: {item.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-primary">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-brand-dark">₹{cartSubtotal.toLocaleString("en-IN")}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-success">
                <span>Coupon Applied</span>
                <span>-₹{discountVal.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-brand-primary border-t border-gray-100 pt-2 text-sm">
              <span>Final Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Gateway Simulator Modal Dialog */}
      {showRzpSimulator && rzpPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl bg-[#091524] text-white shadow-2xl overflow-hidden border border-blue-900/30 flex flex-col font-sans">
            
            {/* RZP Header */}
            <div className="p-5 border-b border-blue-900/30 bg-[#0F2238] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center font-bold text-sm text-white">R</div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide">Razorpay Checkout</h4>
                  <p className="text-[9px] text-blue-400">Simulating Sandbox Mode</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-400">₹{(rzpPayload.amount / 100).toLocaleString("en-IN")}</span>
                <p className="text-[9px] text-gray-400">{rzpPayload.orderId}</p>
              </div>
            </div>

            {/* Methods lists */}
            <div className="p-6 flex-1 flex gap-4 text-xs">
              <div className="w-1/3 flex flex-col gap-2 border-r border-blue-900/20 pr-4">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("upi")}
                  className={`flex items-center gap-2 p-2 rounded transition-all text-left ${
                    selectedMethod === "upi" ? "bg-blue-600/10 text-blue-400" : "text-gray-400"
                  }`}
                >
                  <QrCode className="w-4 h-4" /> UPI
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`flex items-center gap-2 p-2 rounded transition-all text-left ${
                    selectedMethod === "card" ? "bg-blue-600/10 text-blue-400" : "text-gray-400"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("net")}
                  className={`flex items-center gap-2 p-2 rounded transition-all text-left ${
                    selectedMethod === "net" ? "bg-blue-600/10 text-blue-400" : "text-gray-400"
                  }`}
                >
                  <Landmark className="w-4 h-4" /> NetBanking
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center text-center p-4 bg-[#0F2238]/30 rounded border border-blue-900/10">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-200">Sandbox Payment</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Select payment response to test checkout integrations.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-blue-900/20 bg-[#07111D] flex gap-3">
              <button
                onClick={handleSimulatePaymentFailure}
                className="flex-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 py-2.5 text-xs font-semibold border border-rose-900/30 transition-colors cursor-pointer"
              >
                Simulate Failure
              </button>
              <button
                onClick={handleSimulatePaymentSuccess}
                className="flex-1 rounded bg-blue-600 hover:bg-blue-500 text-white py-2.5 text-xs font-semibold shadow transition-colors cursor-pointer"
              >
                Simulate Success
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

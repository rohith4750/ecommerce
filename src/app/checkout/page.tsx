"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { CreditCard, ShieldCheck, MapPin, Plus, Trash2, CheckCircle, ArrowLeft, Loader2, Truck } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { cart, appliedCoupon, clearCart, showToast } = useStore();
  const router = useRouter();

  // Navigation Steps
  const [step, setStep] = useState<"ADDRESS" | "PAYMENT">("ADDRESS");

  // Address States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRzpSimulator, setShowRzpSimulator] = useState(false);
  const [rzpPayload, setRzpPayload] = useState<any>(null);

  // Delivery Estimate State
  const [deliveryEstimate, setDeliveryEstimate] = useState<any>(null);

  useEffect(() => {
    if (selectedAddress?.pincode) {
      checkDeliveryForAddress(selectedAddress.pincode);
    } else {
      setDeliveryEstimate(null);
    }
  }, [selectedAddress]);

  const checkDeliveryForAddress = async (pincode: string) => {
    try {
      const res = await fetch(`/api/delivery/check?pincode=${pincode}`);
      if (res.ok) {
        const data = await res.json();
        setDeliveryEstimate(data);
      } else {
        setDeliveryEstimate(null);
      }
    } catch (error) {
      console.error("Delivery check failed", error);
    }
  };

  // Cart Totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  let discountVal = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountVal = Math.round(cartSubtotal * (appliedCoupon.value / 100));
    } else {
      discountVal = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }
  const grandTotal = Math.max(0, cartSubtotal - discountVal);

  useEffect(() => {
    if (cart.length > 0) {
      fetchAddresses();
    }
  }, [cart]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (data.addresses?.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Address added successfully!", "success");
        setNewAddress({
          name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
        });
        setShowAddForm(false);
        fetchAddresses();
      } else {
        showToast(data.error || "Failed to add address", "error");
      }
    } catch (error) {
      showToast("Network error saving address", "error");
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Address deleted", "info");
        if (selectedAddress?.id === id) {
          setSelectedAddress(null);
        }
        fetchAddresses();
      }
    } catch (error) {
      showToast("Failed to delete address", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast("Please select a shipping address first", "error");
      return;
    }

    setIsSubmitting(true);
    
    // Map selectedAddress to the API expected shippingAddress JSON structure
    const shippingAddressJson = {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      address: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      expectedDelivery: deliveryEstimate?.expectedDelivery || null,
    };

    if (paymentMethod === "cod") {
      // CASH ON DELIVERY checkout flow
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems: cart,
            shippingAddress: shippingAddressJson,
            couponCode: appliedCoupon?.code || null,
            totalAmount: grandTotal,
            discountAmount: discountVal,
            paymentMethod: "cod",
          }),
        });

        const data = await res.json();
        if (res.ok) {
          clearCart();
          showToast("Order placed successfully via COD!", "success");
          router.push(`/order-success?orderId=${data.orderId}`);
        } else {
          showToast(data.error || "Failed to place COD order", "error");
        }
      } catch (err) {
        showToast("Server error placing COD order", "error");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // RAZORPAY card payment flow
      try {
        const res = await fetch("/api/orders/create-razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems: cart,
            shippingAddress: shippingAddressJson,
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
          showToast(data.error || "Razorpay initialization failed", "error");
        }
      } catch (err) {
        showToast("Server error preparing payment", "error");
      } finally {
        setIsSubmitting(false);
      }
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

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-100 p-6 shadow-sm max-w-sm mx-auto mt-10">
        <p className="text-sm text-gray-500">Your shopping bag is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* OmniStore Checkout Breadcrumbs Progress */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-400 border-b border-gray-200 pb-4">
        <span className="text-brand-dark">BAG</span>
        <span>➔</span>
        <span className={step === "ADDRESS" ? "text-brand-primary font-bold border-b-2 border-brand-primary pb-1" : "text-brand-dark"}>ADDRESS</span>
        <span>➔</span>
        <span className={step === "PAYMENT" ? "text-brand-primary font-bold border-b-2 border-brand-primary pb-1" : "text-gray-400"}>PAYMENT</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          {/* STEP 1: ADDRESS SELECTION */}
          {step === "ADDRESS" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  Select Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs text-brand-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {/* Add Address Drawer/Form */}
              {showAddForm && (
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">Receiver Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Postal Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full rounded border px-3 py-1.5 focus:outline-brand-primary"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="default-chk"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    />
                    <label htmlFor="default-chk" className="cursor-pointer font-semibold">Make default address</label>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-1.5 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-brand-primary text-white rounded font-semibold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-xs text-gray-500">
                  No saved addresses found. Please add a shipping address.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id
                          ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {selectedAddress?.id === addr.id && (
                        <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-brand-primary" />
                      )}
                      <div className="text-xs space-y-1.5 pr-6">
                        <p className="font-bold text-brand-dark flex items-center gap-1.5">
                          {addr.name}
                          {addr.isDefault && (
                            <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>
                          )}
                        </p>
                        <p className="text-gray-600 font-semibold">{addr.street}</p>
                        <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-400 font-medium mt-1">Phone: {addr.phone}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteAddress(addr.id, e)}
                        className="absolute bottom-3 right-3 text-gray-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedAddress && (
                <div className="pt-4 border-t flex justify-end">
                  <button
                    onClick={() => setStep("PAYMENT")}
                    className="w-full sm:w-auto bg-brand-primary text-white font-semibold text-xs rounded-lg px-8 py-3 shadow-md active:scale-[0.98] transition-all hover:bg-brand-primary/95"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === "PAYMENT" && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep("ADDRESS")} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-brand-dark transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  Select Payment Option
                </h2>
              </div>

              {/* Selected Address Summary Card */}
              {selectedAddress && (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-brand-dark">Delivering to:</p>
                  <p className="text-gray-600 font-semibold">{selectedAddress.name} — {selectedAddress.phone}</p>
                  <p className="text-gray-500">{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                </div>
              )}

              {/* Payment Methods Grid */}
              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod" ? "border-brand-primary bg-brand-primary/5" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="text-brand-primary focus:ring-brand-primary" />
                    <div className="text-xs">
                      <p className="font-bold text-brand-dark">Cash on Delivery (COD)</p>
                      <p className="text-gray-400 mt-0.5">Pay via Cash / UPI at the time of delivery.</p>
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "razorpay" ? "border-brand-primary bg-brand-primary/5" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="text-brand-primary focus:ring-brand-primary" />
                    <div className="text-xs">
                      <p className="font-bold text-brand-dark">Online Instant Payment (Razorpay)</p>
                      <p className="text-gray-400 mt-0.5">Pay securely using Cards, UPI, Netbanking, or Wallets.</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3.5 rounded-lg font-bold text-xs shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : paymentMethod === "cod" ? "CONFIRM ORDER (CASH ON DELIVERY)" : "PLACE ORDER & PAY NOW"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Pricing checkout Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-fit space-y-6">
          <div>
            <h3 className="font-serif text-sm font-bold text-brand-dark border-b border-gray-100 pb-3 mb-4">
              Bag Details ({cart.reduce((s, i) => s + i.qty, 0)} Items)
            </h3>
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 py-3 text-xs">
                  <img src={item.image} alt="" className="w-8 h-10 rounded object-cover border" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark truncate">{item.name}</p>
                    <p className="text-gray-400 mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-primary">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t text-xs font-semibold">
            <div className="flex justify-between text-gray-500">
              <span>Bag Subtotal</span>
              <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
            </div>
            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Promotional Discount</span>
                <span>- ₹{discountVal.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping Charges</span>
              <span className="text-emerald-500 uppercase font-bold text-[10px]">Free Delivery</span>
            </div>
            {deliveryEstimate && deliveryEstimate.serviceable && (
              <div className="flex justify-between text-brand-dark pt-2">
                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-brand-primary" /> Expected Delivery</span>
                <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">
                  By {new Date(deliveryEstimate.expectedDelivery).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-brand-dark font-black text-sm pt-3 border-t">
              <span>Total Payable</span>
              <span className="text-brand-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% Encrypted Transactions
          </div>
        </div>
      </div>

      {/* RAZORPAY TRANSACTION SIMULATION PANEL */}
      {showRzpSimulator && rzpPayload && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scale-up">
            <div className="text-center">
              <h3 className="font-serif text-lg font-bold text-brand-dark">Razorpay Payment Gateway</h3>
              <p className="text-xs text-gray-400 mt-1">Transaction Mocking Sandbox</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs space-y-2 font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="text-brand-dark">{rzpPayload.razorpayOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Payable:</span>
                <span className="text-brand-primary text-sm font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSimulatePaymentSuccess}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                SIMULATE TRANSACTION SUCCESS
              </button>
              <button
                onClick={() => {
                  showToast("Simulated transaction canceled", "error");
                  setShowRzpSimulator(false);
                }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                SIMULATE TRANSACTION DECLINED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

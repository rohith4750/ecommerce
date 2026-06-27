"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { jsPDF } from "jspdf";
import { FileText, ArrowRight, History, Calendar, CreditCard, Loader2 } from "lucide-react";
import Link from "next/navigation";

export default function UserOrdersPage() {
  const { user, showToast } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to load user orders", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleDownloadInvoice = (order: any) => {
    const doc = new jsPDF();
    
    // Header Logo
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.setTextColor(94, 13, 130);
    doc.text("SilkRoute", 20, 20);
    
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text("Premium Saree E-Commerce Store", 20, 26);
    doc.text("support@silkroute.in | www.silkroute.in", 20, 31);
    
    // Invoice details
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.setFont("sans-serif", "bold");
    doc.text("INVOICE RECEIPT", 140, 20);
    doc.setFont("sans-serif", "normal");
    doc.text(`Order ID: ${order.orderId}`, 140, 26);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 31);
    
    // Horizontal divider
    doc.setDrawColor(243, 232, 255);
    doc.setLineWidth(1);
    doc.line(20, 38, 190, 38);
    
    // Shipping Address
    const address = order.shippingAddress;
    doc.setFont("sans-serif", "bold");
    doc.text("DELIVER TO:", 20, 48);
    doc.setFont("sans-serif", "normal");
    doc.text(address.name, 20, 54);
    doc.text(address.address, 20, 60);
    doc.text(`${address.city}, ${address.state} - ${address.pincode}`, 20, 66);
    doc.text(`Phone: ${address.phone}`, 20, 72);
    
    // Table Headers
    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(243, 232, 255);
    doc.rect(20, 82, 170, 8, "F");
    doc.setFont("sans-serif", "bold");
    doc.setTextColor(94, 13, 130);
    doc.text("Item Name", 22, 87);
    doc.text("Qty", 120, 87);
    doc.text("Unit Price", 140, 87);
    doc.text("Subtotal", 170, 87);
    
    // Items listing
    doc.setFont("sans-serif", "normal");
    doc.setTextColor(26, 26, 46);
    let yPos = 97;
    const items = order.items as any[];
    
    items.forEach((item) => {
      const name = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name;
      doc.text(name, 22, yPos);
      doc.text(item.qty.toString(), 122, yPos);
      doc.text(`Rs. ${item.price}`, 142, yPos);
      doc.text(`Rs. ${item.price * item.qty}`, 172, yPos);
      doc.line(20, yPos + 3, 190, yPos + 3);
      yPos += 10;
    });
    
    // Price breakdown
    const cartSubtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    doc.text("Cart Subtotal:", 130, yPos + 5);
    doc.text(`Rs. ${cartSubtotal}`, 170, yPos + 5);
    
    if (order.discount > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`Coupon Discount:`, 130, yPos + 11);
      doc.text(`- Rs. ${order.discount}`, 170, yPos + 11);
      doc.setTextColor(26, 26, 46);
    }
    
    doc.text("Delivery Fee:", 130, yPos + 17);
    doc.text("FREE", 170, yPos + 17);
    
    doc.setFont("sans-serif", "bold");
    doc.setTextColor(94, 13, 130);
    doc.text("Total Paid:", 130, yPos + 25);
    doc.text(`Rs. ${order.totalAmount}`, 170, yPos + 25);
    
    doc.setFont("sans-serif", "normal");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Thank you for supporting handloom saree weavers. This is a simulated GST e-invoice.", 20, yPos + 45);
    
    doc.save(`Invoice-${order.orderId}.pdf`);
    showToast("Invoice PDF downloaded", "success");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
        <History className="w-6 h-6 text-brand-primary" />
        Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
          <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const items = order.items as any[];
            const deliveryEst = new Date(order.createdAt);
            deliveryEst.setDate(deliveryEst.getDate() + 5);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-brand-primary/5 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-brand-surface/20 border-b border-brand-primary/5 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                    <div>
                      <p className="text-gray-400 font-medium">ORDER REF</p>
                      <p className="font-bold text-brand-dark">{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">DATE PLACED</p>
                      <p className="font-semibold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">TOTAL AMOUNT</p>
                      <p className="font-bold text-brand-primary">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">PAYMENT STATUS</p>
                      <span
                        className={`font-bold uppercase text-[10px] ${
                          order.paymentStatus === "PAID" ? "text-success" : "text-amber-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-secondary transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download Invoice
                  </button>
                </div>

                {/* Items and status */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Items */}
                  <div className="md:col-span-2 divide-y divide-gray-100 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-gray-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 text-xs">
                        <img src={item.image} alt="" className="w-12 h-16 rounded object-cover border" />
                        <div>
                          <h4 className="font-semibold text-brand-dark">{item.name}</h4>
                          <p className="text-gray-400 mt-1">Quantity: {item.qty}</p>
                          <p className="text-brand-primary font-bold mt-0.5">₹{item.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Tracking details */}
                  <div className="text-xs space-y-4">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-2">Package Status</p>
                      <div className="inline-flex items-center rounded-full bg-brand-surface border border-brand-primary/10 px-3 py-1 text-[10px] font-bold text-brand-primary">
                        {order.orderStatus}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Expected Delivery</p>
                      <p className="font-medium text-brand-dark flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-secondary" />
                        {deliveryEst.toLocaleDateString("en-IN", { dateStyle: "long" })}
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Simulated Tracking Number</p>
                        <p className="font-mono text-brand-primary font-semibold">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

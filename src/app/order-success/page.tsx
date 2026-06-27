"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { CheckCircle2, FileText, ArrowRight, Truck, PhoneCall, Calendar, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default function OrderSuccessPage({ searchParams }: PageProps) {
  const params = use(searchParams);
  const { showToast } = useStore();
  const orderId = params.orderId || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to load order details for success screen", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // Generate and Download PDF Invoice
  const handleDownloadInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();
    
    // Header Logo & Brand
    doc.setFont("serif", "bold");
    doc.setFontSize(22);
    doc.setTextColor(94, 13, 130); // Brand primary
    doc.text("SilkRoute", 20, 20);
    
    doc.setFont("sans-serif", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text("Premium Ethnic Wear E-Commerce Store", 20, 26);
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
    doc.setDrawColor(243, 232, 255); // Brand surface color
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
      // Shorten name to fit
      const name = item.name.length > 40 ? item.name.substring(0, 37) + "..." : item.name;
      doc.text(name, 22, yPos);
      doc.text(item.qty.toString(), 122, yPos);
      doc.text(`Rs. ${item.price}`, 142, yPos);
      doc.text(`Rs. ${item.price * item.qty}`, 172, yPos);
      
      // Divider
      doc.line(20, yPos + 3, 190, yPos + 3);
      yPos += 10;
    });
    
    // Price breakdown
    const cartSubtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    doc.text("Cart Subtotal:", 130, yPos + 5);
    doc.text(`Rs. ${cartSubtotal}`, 170, yPos + 5);
    
    if (order.discount > 0) {
      doc.setTextColor(22, 163, 74); // success green
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
    
    // Footer notes
    doc.setFont("sans-serif", "normal");
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Thank you for your purchase. This is a simulated GST e-invoice.", 20, yPos + 45);
    
    // Save invoice file
    doc.save(`Invoice-${order.orderId}.pdf`);
    showToast("Invoice downloaded successfully", "success");
  };

  const deliveryEst = new Date();
  deliveryEst.setDate(deliveryEst.getDate() + 5);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Capturing order confirmation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-6">
      
      {/* Visual Header */}
      <div className="bg-white rounded-xl border border-brand-primary/5 p-8 shadow-sm text-center">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Order Confirmed!</h1>
        <p className="text-xs text-gray-500 mt-2">
          Thank you for your purchase. We have received your payment and are preparing your items.
        </p>
        {orderId && (
          <div className="mt-4 inline-block bg-brand-surface/40 border border-brand-primary/10 rounded-full px-4 py-1.5 text-xs text-brand-primary font-bold">
            Ref Number: {orderId}
          </div>
        )}
      </div>

      {/* Shipment and Invoice Actions */}
      {order && (
        <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-secondary" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Estimated Delivery</p>
                <p className="text-xs font-semibold text-brand-dark">{deliveryEst.toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 rounded-lg border border-brand-primary/20 hover:bg-brand-surface/20 px-4 py-2 text-xs font-semibold text-brand-primary transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Download GST Invoice
            </button>
          </div>

          {/* Delivery Timeline Tracker */}
          <div>
            <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-primary" />
              Simulated Tracking status
            </h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-brand-primary/10">
              
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-primary" />
                <p className="text-xs font-semibold text-brand-primary">Order Confirmed</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Payment verification completed. Weaver stock allocated.</p>
              </div>

              <div className="relative opacity-60">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-gray-300" />
                <p className="text-xs font-semibold text-gray-600">Packing & Loom Check</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Quality inspection and packaging.</p>
              </div>

              <div className="relative opacity-50">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-gray-300" />
                <p className="text-xs font-semibold text-gray-600">Dispatched (Delhivery)</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Estimated tracking link generated once packed.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* support card */}
      <div className="bg-brand-surface/20 rounded-xl border border-brand-primary/10 p-6 flex items-center justify-between">
        <div className="text-xs">
          <p className="font-semibold text-brand-primary">Need assistance with draping or custom stitching?</p>
          <p className="text-gray-500 mt-0.5">Reach out to our customer care team anytime.</p>
        </div>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 flex items-center gap-1.5 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Support
        </a>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-primary/95 transition-all shadow-sm"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

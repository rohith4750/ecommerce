"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Receipt, Calendar, Truck, ClipboardList, HelpCircle, User } from "lucide-react";

export default function AdminOrdersPage() {
  const { showToast } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load administrative orders list", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated to "${newStatus}"`, "success");
        loadOrders();
      } else {
        showToast(data.error || "Update failed", "error");
      }
    } catch (err) {
      showToast("Server error during update", "error");
    }
  };

  const channelColors: any = {
    WEBSITE: "bg-purple-100 text-purple-700",
    AMAZON: "bg-amber-100 text-amber-700",
    FLIPKART: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6 py-2 animate-fade-in">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Order Fulfilment</h1>
        <p className="text-xs text-gray-400 mt-1">Review orders placed across all channels and update customer shipping statuses.</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-primary/5 shadow-sm overflow-hidden">
        <h3 className="font-serif text-sm font-semibold text-brand-dark px-6 py-4 border-b">
          All Orders Log
        </h3>

        {loading ? (
          <div className="p-10 text-center text-xs text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-400">No orders placed yet.</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/20 border-b border-brand-primary/5 text-brand-primary font-bold">
                  <th className="p-4">Ref Code</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Final Paid</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const items = order.items as any[];
                  const summary = items.map((i) => `${i.name} (x${i.qty})`).join(", ");

                  return (
                    <tr key={order.id} className="hover:bg-brand-surface/10">
                      <td className="p-4 font-mono font-bold text-gray-500">{order.orderId}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>
                      <td className="p-4 max-w-[200px] truncate" title={summary}>
                        {summary}
                      </td>
                      <td className="p-4 font-bold text-brand-primary">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${channelColors[order.channel]}`}>
                          {order.channel}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className={order.paymentStatus === "PAID" ? "text-success" : "text-amber-500"}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="rounded border border-brand-primary/10 bg-white px-2 py-1 text-xs focus:outline-none focus:border-brand-primary cursor-pointer text-gray-700 font-semibold"
                        >
                          <option value="PLACED">Placed</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

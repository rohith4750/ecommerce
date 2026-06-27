"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  Calendar,
  Activity,
  Layers,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    ordersToday: 0,
    lowStockCount: 0,
  };

  const channelColors = ["#5E0D82", "#E8A020", "#10B981"];

  return (
    <div className="space-y-8 animate-fade-in py-2">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 mt-1">Real-time statistics from website channels and marketplace sync modules.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-surface text-brand-primary rounded-lg flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Revenue</p>
            <h3 className="text-lg font-bold text-brand-dark">₹{metrics.totalRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        {/* Orders Count */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-surface text-brand-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Orders</p>
            <h3 className="text-lg font-bold text-brand-dark">{metrics.totalOrders} Purchases</h3>
          </div>
        </div>

        {/* Orders Today */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Orders Today</p>
            <h3 className="text-lg font-bold text-brand-dark">{metrics.ordersToday} Placed</h3>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`rounded-xl border p-5 shadow-sm flex items-center gap-4 ${
          metrics.lowStockCount > 0 ? "bg-rose-50 border-rose-200" : "bg-white border-brand-primary/5"
        }`}>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            metrics.lowStockCount > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-brand-surface text-brand-primary"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Low Stock Warning</p>
            <h3 className="text-lg font-bold text-brand-dark">{metrics.lowStockCount} Items</h3>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Line Chart: Revenue */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
          <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-primary" />
            Revenue Over Time (Past 7 Days)
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueOverTime || []}>
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => [value !== undefined && value !== null ? `₹${Number(value).toLocaleString("en-IN")}` : "₹0", "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#5E0D82" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Channel shares */}
        <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
          <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            Order Channels Breakdown
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.channelBreakdown || []}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip formatter={(value) => [value !== undefined && value !== null ? `${value} Orders` : "0 Orders", "Volume"]} />
                <Bar dataKey="value">
                  {(data?.channelBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={channelColors[index % channelColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Warning Logs and details */}
      {data?.lowStockAlerts && data.lowStockAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
          <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            Inventory Stock Alerts
          </h3>
          
          <div className="border border-rose-100 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50 text-rose-800 font-bold border-b border-rose-100">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Remaining Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-rose-900">
                {data.lowStockAlerts.map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-rose-50/20">
                    <td className="p-3 font-medium">{prod.name}</td>
                    <td className="p-3 font-mono">{prod.sku}</td>
                    <td className="p-3 font-bold text-rose-700">{prod.stock} units left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

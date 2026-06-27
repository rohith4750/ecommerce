"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, ToggleLeft, ToggleRight, Loader2, Tag, Ticket, Percent } from "lucide-react";

export default function AdminDiscountsPage() {
  const { showToast } = useStore();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minCartValue: "",
    startDate: "",
    endDate: "",
    category: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/admin/discounts");
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data.discounts);
      }
    } catch (err) {
      console.error("Failed to load discount campaigns", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCampaign(true);

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Discount coupon created successfully!", "success");
        setForm({
          code: "",
          type: "PERCENTAGE",
          value: "",
          minCartValue: "",
          startDate: "",
          endDate: "",
          category: "",
        });
        setShowAddForm(false);
        loadCampaigns();
      } else {
        showToast(data.error || "Failed to create campaign", "error");
      }
    } catch (err) {
      showToast("Error creating campaign", "error");
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleToggleActive = async (discountId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setDiscounts(
          discounts.map((d) => (d.id === discountId ? { ...d, isActive: !currentStatus } : d))
        );
        showToast(`Coupon status toggled successfully`, "success");
      }
    } catch (err) {
      showToast("Failed to toggle coupon status", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in py-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Campaigns & Coupons</h1>
          <p className="text-xs text-gray-400 mt-1">Configure active promotional coupons, percentage deductions, and seasonal catalog discounts.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold px-4 py-2 hover:bg-brand-primary/95 transition-all shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Code
        </button>
      </div>

      {/* Creation drawer form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-brand-primary/10 p-6 shadow-md">
          <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b">
            Setup Discount Code
          </h3>
          <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold mb-1">Coupon Code (Uppercase)</label>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. MONSOON30"
                value={form.code}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5 uppercase"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Coupon Type</label>
              <select name="type" value={form.type} onChange={handleFormChange} className="w-full rounded border px-3 py-1.5">
                <option value="PERCENTAGE">Percentage (%) Off</option>
                <option value="FIXED">Fixed Amount (₹) Off</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Value (Percent / Rupee)</label>
              <input
                type="number"
                name="value"
                required
                value={form.value}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Min Spend Threshold (₹)</label>
              <input
                type="number"
                name="minCartValue"
                value={form.minCartValue}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Start Validity Date</label>
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Expiry Date</label>
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Loom Fabric Restriction (Optional)</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Silk"
                value={form.category}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded border border-gray-200 px-4 py-2 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCampaign}
                className="rounded bg-brand-primary text-white px-5 py-2 font-semibold hover:bg-brand-primary/95 shadow cursor-pointer"
              >
                {savingCampaign ? "Creating..." : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons tables list */}
      <div className="bg-white rounded-xl border border-brand-primary/5 shadow-sm overflow-hidden">
        <h3 className="font-serif text-sm font-semibold text-brand-dark px-6 py-4 border-b">
          Active Campaigns
        </h3>

        {loading ? (
          <div className="p-10 text-center text-xs text-gray-400">Loading campaigns...</div>
        ) : discounts.length === 0 ? (
          <div className="p-10 text-center text-xs text-gray-400">No campaigns launched yet.</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/20 border-b border-brand-primary/5 text-brand-primary font-bold">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Deduction Value</th>
                  <th className="p-4">Min Basket Size</th>
                  <th className="p-4">Usage Volume</th>
                  <th className="p-4">Validity End</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {discounts.map((d) => {
                  const isExpired = new Date() > new Date(d.endDate);
                  const isPercentage = d.type === "PERCENTAGE";

                  return (
                    <tr key={d.id} className="hover:bg-brand-surface/10">
                      <td className="p-4 font-mono font-bold text-gray-600 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-brand-secondary" />
                        {d.code}
                      </td>
                      <td className="p-4 font-medium text-gray-500">{d.type}</td>
                      <td className="p-4 font-bold text-brand-primary">
                        {isPercentage ? `${d.value}% Off` : `₹${d.value} Off`}
                      </td>
                      <td className="p-4 text-gray-500">₹{d.minCartValue}</td>
                      <td className="p-4 font-semibold text-gray-700">{d.usageCount} Redeemed</td>
                      <td className="p-4 text-gray-500">
                        {new Date(d.endDate).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          {isExpired ? (
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[8px] font-bold">EXPIRED</span>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(d.id, d.isActive)}
                              className="focus:outline-none transition-transform hover:scale-105"
                              title="Toggle Coupon status"
                            >
                              {d.isActive ? (
                                <ToggleRight className="w-8 h-8 text-brand-primary" />
                              ) : (
                                <ToggleLeft className="w-8 h-8 text-gray-300" />
                              )}
                            </button>
                          )}
                        </div>
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

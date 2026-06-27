"use client";

import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";

interface DeliveryZone {
  id: string;
  prefix: string;
  transitDays: number;
  codAvailable: boolean;
  isServiceable: boolean;
  createdAt: string;
}

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useStore();

  const [formData, setFormData] = useState({
    id: "",
    prefix: "",
    transitDays: 5,
    codAvailable: true,
    isServiceable: true,
  });

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/delivery");
      if (res.ok) {
        const data = await res.json();
        setZones(data.zones || []);
      }
    } catch (err) {
      showToast("Failed to fetch zones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/admin/delivery/${formData.id}` : "/api/admin/delivery";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Zone ${isEditing ? 'updated' : 'added'} successfully`, "success");
        setShowModal(false);
        fetchZones();
      } else {
        showToast(data.error || "Failed to save zone", "error");
      }
    } catch (err) {
      showToast("Error saving zone", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;
    try {
      const res = await fetch(`/api/admin/delivery/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Zone deleted", "success");
        fetchZones();
      } else {
        showToast("Failed to delete zone", "error");
      }
    } catch (err) {
      showToast("Error deleting zone", "error");
    }
  };

  const openModal = (zone?: DeliveryZone) => {
    if (zone) {
      setFormData({
        id: zone.id,
        prefix: zone.prefix,
        transitDays: zone.transitDays,
        codAvailable: zone.codAvailable,
        isServiceable: zone.isServiceable,
      });
    } else {
      setFormData({
        id: "",
        prefix: "",
        transitDays: 5,
        codAvailable: true,
        isServiceable: true,
      });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Delivery Zones</h1>
          <p className="text-xs text-gray-500 mt-1">Configure transit times and availability by pincode prefix.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
        ) : zones.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No delivery zones configured yet.</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Pincode Prefix</th>
                <th className="px-6 py-4">Transit Days</th>
                <th className="px-6 py-4">COD</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-brand-dark">{zone.prefix}</td>
                  <td className="px-6 py-4">{zone.transitDays} Days</td>
                  <td className="px-6 py-4">
                    {zone.codAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  </td>
                  <td className="px-6 py-4">
                    {zone.isServiceable ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Serviceable</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Unserviceable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openModal(zone)} className="text-gray-400 hover:text-brand-primary p-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(zone.id)} className="text-gray-400 hover:text-rose-500 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">
              {formData.id ? "Edit Delivery Zone" : "New Delivery Zone"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode / Prefix</label>
                <input
                  type="text"
                  required
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  placeholder="e.g. 50 or 500001"
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary"
                />
                <p className="text-[10px] text-gray-400 mt-1">Enter first few digits to match a region, or a full 6-digit pincode.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Transit Time (Days)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.transitDays}
                  onChange={(e) => setFormData({ ...formData, transitDays: parseInt(e.target.value) || 0 })}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-brand-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cod"
                  checked={formData.codAvailable}
                  onChange={(e) => setFormData({ ...formData, codAvailable: e.target.checked })}
                  className="text-brand-primary rounded focus:ring-brand-primary"
                />
                <label htmlFor="cod" className="text-sm font-semibold text-gray-700 cursor-pointer">Cash on Delivery Available</label>
              </div>

              <div className="flex items-center gap-3 pb-2 border-b">
                <input
                  type="checkbox"
                  id="srv"
                  checked={formData.isServiceable}
                  onChange={(e) => setFormData({ ...formData, isServiceable: e.target.checked })}
                  className="text-brand-primary rounded focus:ring-brand-primary"
                />
                <label htmlFor="srv" className="text-sm font-semibold text-gray-700 cursor-pointer">Serviceable Zone</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-brand-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primary/95"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

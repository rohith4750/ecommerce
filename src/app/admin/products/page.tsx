"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";

export default function AdminProductsPage() {
  const { showToast } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New product form fields
  const [form, setForm] = useState({
    name: "",
    category: "Silk",
    type: "Banarasi",
    price: "",
    salePrice: "",
    stock: "10",
    color: "Royal Red",
    size: "Free Size (5.5m + 0.8m Blouse)",
    description: "",
    amazonASIN: "",
    flipkartFSN: "",
  });

  // UI States
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  
  // Marketplace sync states
  const [syncingAmazon, setSyncingAmazon] = useState(false);
  const [syncingFlipkart, setSyncingFlipkart] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Load all products
  async function loadProducts() {
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products list", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new product creation
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          color: [form.color],
          size: [form.size],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Product created successfully!", "success");
        setForm({
          name: "",
          category: "Silk",
          type: "Banarasi",
          price: "",
          salePrice: "",
          stock: "10",
          color: "Royal Red",
          size: "Free Size (5.5m + 0.8m Blouse)",
          description: "",
          amazonASIN: "",
          flipkartFSN: "",
        });
        setShowAddForm(false);
        loadProducts();
      } else {
        showToast(data.error || "Failed to create product", "error");
      }
    } catch (err) {
      showToast("Error creating product", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  // Quick Inline Stock Updater
  const handleQuickStockUpdate = async (productId: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock: newStock }),
      });
      if (res.ok) {
        setProducts(
          products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        showToast("Stock updated successfully", "success");
      }
    } catch (err) {
      showToast("Failed to update stock", "error");
    }
  };

  // Sync to Amazon
  const handleAmazonSync = async () => {
    setSyncingAmazon(true);
    setSyncLogs([]);
    try {
      const res = await fetch("/api/sync/amazon", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncLogs(data.logs);
        showToast(`Synced ${data.syncCount} items with Amazon SP-API`, "success");
      }
    } catch (err) {
      showToast("Amazon marketplace sync failed", "error");
    } finally {
      setSyncingAmazon(false);
    }
  };

  // Sync to Flipkart
  const handleFlipkartSync = async () => {
    setSyncingFlipkart(true);
    setSyncLogs([]);
    try {
      const res = await fetch("/api/sync/flipkart", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncLogs(data.logs);
        showToast(`Synced ${data.syncCount} listings with Flipkart Hub`, "success");
      }
    } catch (err) {
      showToast("Flipkart sync failed", "error");
    } finally {
      setSyncingFlipkart(false);
    }
  };

  // Simulate CSV bulk update upload
  const handleSimulateCSVUpload = () => {
    showToast("Bulk CSV seeder completed successfully. 12 product stock counts modified.", "success");
    loadProducts();
  };

  return (
    <div className="space-y-8 animate-fade-in py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Products & Channel Hub</h1>
          <p className="text-xs text-gray-400 mt-1">Manage warehouse stock levels and execute channel listings pushes.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-primary text-white text-xs font-semibold px-4 py-2 hover:bg-brand-primary/95 transition-all shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <button
            onClick={handleSimulateCSVUpload}
            className="flex items-center gap-1.5 rounded-lg border border-brand-primary/20 hover:bg-brand-surface/20 text-brand-primary text-xs font-semibold px-4 py-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Bulk CSV Update
          </button>
        </div>
      </div>

      {/* Sync Operations Panel */}
      <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
        <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary" />
          Marketplace Integrations Control
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleAmazonSync}
            disabled={syncingAmazon}
            className="rounded-lg border-2 border-amber-500 bg-amber-500/5 text-amber-800 p-4 font-bold text-xs hover:bg-amber-500/10 transition-colors flex items-center justify-between group disabled:opacity-50 cursor-pointer"
          >
            <div className="text-left">
              <p>Amazon Seller Sync</p>
              <p className="text-[10px] font-normal text-amber-600 mt-1">Push inventory levels via SP-API SDK</p>
            </div>
            <RefreshCw className={`w-4 h-4 text-amber-600 ${syncingAmazon ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleFlipkartSync}
            disabled={syncingFlipkart}
            className="rounded-lg border-2 border-blue-500 bg-blue-500/5 text-blue-800 p-4 font-bold text-xs hover:bg-blue-500/10 transition-colors flex items-center justify-between group disabled:opacity-50 cursor-pointer"
          >
            <div className="text-left">
              <p>Flipkart Catalog Sync</p>
              <p className="text-[10px] font-normal text-blue-600 mt-1">Update price metrics via Seller API V3</p>
            </div>
            <RefreshCw className={`w-4 h-4 text-blue-600 ${syncingFlipkart ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Sync logs display terminal */}
        {syncLogs.length > 0 && (
          <div className="mt-5 bg-[#091524] rounded-lg p-4 font-mono text-[10px] text-emerald-400 space-y-1 max-h-48 overflow-y-auto border border-blue-900/20 shadow-inner">
            {syncLogs.map((log, idx) => (
              <p key={idx}>{log}</p>
            ))}
          </div>
        )}
      </div>

      {/* Add New Product Form Drawer */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-brand-primary/10 p-6 shadow-md">
          <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b">
            Add New Product
          </h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Fabric Category</label>
              <select name="category" value={form.category} onChange={handleFormChange} className="w-full rounded border px-3 py-1.5">
                <option value="Silk">Silk</option>
                <option value="Cotton">Cotton</option>
                <option value="Georgette">Georgette</option>
                <option value="Chiffon">Chiffon</option>
                <option value="Organza">Organza</option>
                <option value="Crepe">Crepe</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Weave / Craft Type</label>
              <select name="type" value={form.type} onChange={handleFormChange} className="w-full rounded border px-3 py-1.5">
                <option value="Banarasi">Banarasi</option>
                <option value="Kanjeevaram">Kanjeevaram</option>
                <option value="Chanderi">Chanderi</option>
                <option value="Bandhani">Bandhani</option>
                <option value="Patola">Patola</option>
                <option value="Mysore Silk">Mysore Silk</option>
                <option value="Sambalpuri">Sambalpuri</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Original Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                value={form.price}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Discount Price (₹, Optional)</label>
              <input
                type="number"
                name="salePrice"
                value={form.salePrice}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Initial Stock Count</label>
              <input
                type="number"
                name="stock"
                required
                value={form.stock}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Primary Color Swatch</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Amazon ASIN (Sync ID, Optional)</label>
              <input
                type="text"
                name="amazonASIN"
                placeholder="B07XXXXX"
                value={form.amazonASIN}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold mb-1">Flipkart FSN (Sync ID, Optional)</label>
              <input
                type="text"
                name="flipkartFSN"
                placeholder="SREX..."
                value={form.flipkartFSN}
                onChange={handleFormChange}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-gray-400 font-bold mb-1">Weaving Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full rounded border px-3 py-1.5"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded border border-gray-200 px-4 py-2 hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="rounded bg-brand-primary text-white px-5 py-2 font-semibold hover:bg-brand-primary/95 shadow cursor-pointer"
              >
                {savingProduct ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products list table */}
      <div className="bg-white rounded-xl border border-brand-primary/5 shadow-sm overflow-hidden">
        <h3 className="font-serif text-sm font-semibold text-brand-dark px-6 py-4 border-b">
          Active Store Catalog
        </h3>

        {loading ? (
          <div className="p-10 text-center text-xs text-gray-400">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/20 border-b border-brand-primary/5 text-brand-primary font-bold">
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (MRP)</th>
                  <th className="p-4">Sync Channels</th>
                  <th className="p-4 text-center">Warehouse Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isLow = p.stock < 5;
                  return (
                    <tr key={p.id} className="hover:bg-brand-surface/10">
                      <td className="p-4 font-mono font-bold text-gray-500">{p.sku}</td>
                      <td className="p-4 font-medium text-brand-dark">{p.name}</td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4 font-bold text-brand-primary">₹{p.price}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {p.amazonASIN && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-bold">AMZ</span>}
                          {p.flipkartFSN && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8px] font-bold">FK</span>}
                          {!p.amazonASIN && !p.flipkartFSN && <span className="text-gray-400 text-[10px]">None</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock, -1)}
                            className="bg-gray-100 hover:bg-gray-200 h-6 w-6 rounded flex items-center justify-center font-bold text-gray-600 transition-colors"
                          >
                            -
                          </button>
                          <span className={`font-bold min-w-[20px] text-center ${isLow ? "text-danger animate-pulse" : "text-gray-700"}`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock, 1)}
                            className="bg-gray-100 hover:bg-gray-200 h-6 w-6 rounded flex items-center justify-center font-bold text-gray-600 transition-colors"
                          >
                            +
                          </button>
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

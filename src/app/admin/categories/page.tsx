"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, Trash2, Loader2, Layers } from "lucide-react";

interface Category {
  id: string;
  name: string;
  group: string;
  createdAt: string;
}

export default function CategoriesAdminPage() {
  const { showToast } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [group, setGroup] = useState("CATEGORY"); // "CATEGORY" or "TYPE"
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), group }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Category added successfully!", "success");
        setName("");
        fetchCategories(); // Refresh list
      } else {
        showToast(data.error || "Failed to add category", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Category deleted!", "success");
        fetchCategories();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (error) {
      showToast("Network error", "error");
    }
  };

  const fabricCategories = categories.filter((c) => c.group === "CATEGORY");
  const craftTypes = categories.filter((c) => c.group === "TYPE");

  return (
    <div className="space-y-8 pb-12 animate-fade-in-up">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
          <Layers className="w-6 h-6 text-brand-primary" />
          Categories Management
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage dynamic dynamic fabric categories and craft types.</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-primary/10 p-6 shadow-sm">
        <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b">
          Add New Taxonomy
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-end gap-4 text-xs">
          <div className="flex-1 w-full">
            <label className="block text-gray-400 font-bold mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Banarasi, Silk, Chiffon"
              className="w-full rounded border px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-gray-400 font-bold mb-1">Classification Group</label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="CATEGORY">Fabric Category</option>
              <option value="TYPE">Craft / Type</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-brand-primary text-white rounded px-6 py-2 font-semibold hover:bg-brand-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Taxonomy
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fabric Categories */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b">
              Fabric Categories ({fabricCategories.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {fabricCategories.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No fabric categories added yet.</p>
              ) : (
                fabricCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors">
                    <span className="text-xs font-semibold text-brand-dark">{cat.name}</span>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Craft Types */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b">
              Craft / Types ({craftTypes.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {craftTypes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No craft types added yet.</p>
              ) : (
                craftTypes.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-100 hover:border-brand-primary/20 transition-colors">
                    <span className="text-xs font-semibold text-brand-dark">{cat.name}</span>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-rose-500 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

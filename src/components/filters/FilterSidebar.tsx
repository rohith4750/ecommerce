"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { SlidersHorizontal, RotateCcw, Loader2 } from "lucide-react";

export default function FilterSidebar() {
  const { filters, setFilter, resetFilters } = useStore();

  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/products/filters");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setTypes(data.types || []);
        }
      } catch (err) {
        console.error("Failed to load filters", err);
      } finally {
        setLoadingFilters(false);
      }
    }
    fetchFilters();
  }, []);

  // Swatches mapping colors to background shades
  const colorsMap = [
    { name: "Royal Red", hex: "#DC2626" },
    { name: "Silk Purple", hex: "#5E0D82" },
    { name: "Golden Yellow", hex: "#E8A020" },
    { name: "Emerald Green", hex: "#16A34A" },
    { name: "Peacock Blue", hex: "#0369A1" },
    { name: "Magenta Pink", hex: "#BE185D" },
    { name: "Classic Black", hex: "#111827" },
    { name: "Ivory Cream", hex: "#FDF5E6" },
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setFilter("maxPrice", val);
  };

  const handleCategorySelect = (cat: string) => {
    setFilter("category", filters.category === cat ? "" : cat);
  };

  const handleTypeSelect = (type: string) => {
    setFilter("type", filters.type === type ? "" : type);
  };

  const handleColorSelect = (color: string) => {
    setFilter("color", filters.color === color ? "" : color);
  };

  const handleSizeSelect = (size: string) => {
    setFilter("size", filters.size === size ? "" : size);
  };

  return (
    <aside className="w-full bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-2 font-serif text-base font-semibold text-brand-dark">
          <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
          Filter Products
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Category Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</h4>
        {loadingFilters ? (
          <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                filters.category === cat
                  ? "bg-brand-primary border-brand-primary text-white shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-brand-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
          </div>
        )}
      </div>

      {/* Type Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Type</h4>
        {loadingFilters ? (
          <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="w-3 h-3 animate-spin"/> Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => handleTypeSelect(t)}
              className={`text-left text-xs py-2 px-3 rounded-lg border transition-all ${
                filters.type === t
                  ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-bold"
                  : "border-transparent text-gray-600 hover:bg-brand-surface/20"
              }`}
            >
              {t}
            </button>
          ))}
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
            <button
              key={sz}
              onClick={() => handleSizeSelect(sz)}
              className={`min-w-[40px] text-center rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                filters.size === sz
                  ? "bg-brand-primary border-brand-primary text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-brand-primary/30"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatch Section */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Color Swatches</h4>
        <div className="grid grid-cols-4 gap-3">
          {colorsMap.map((col) => {
            const isSelected = filters.color === col.name;
            return (
              <button
                key={col.name}
                onClick={() => handleColorSelect(col.name)}
                style={{ backgroundColor: col.hex }}
                className={`relative h-8 w-8 rounded-full border border-gray-200 shadow-sm transition-all hover:scale-115 flex items-center justify-center cursor-pointer ${
                  isSelected ? "ring-2 ring-brand-primary ring-offset-2 scale-110" : ""
                }`}
                title={col.name}
              >
                {/* Visual marker inside light colors */}
                {isSelected && (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      col.name === "Ivory Cream" ? "bg-black" : "bg-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Slider Section */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Max Price</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full accent-brand-primary bg-gray-200 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs font-bold text-brand-primary">
            <span>₹1,000</span>
            <span className="bg-brand-surface px-2 py-0.5 rounded text-[11px]">
              Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}

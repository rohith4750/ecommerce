"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ProductCard, { StoreProduct } from "@/components/product/ProductCard";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { filters, setFilter } = useStore();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Sync search query parameter from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "";
    if (search) setFilter("searchQuery", search);
    if (category) setFilter("category", category);
  }, [setFilter]);

  // Fetch products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filters.category) query.append("category", filters.category);
        if (filters.type) query.append("type", filters.type);
        if (filters.color) query.append("color", filters.color);
        if (filters.size) query.append("size", filters.size);
        if (filters.minPrice) query.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice) query.append("maxPrice", filters.maxPrice.toString());
        if (filters.searchQuery) query.append("search", filters.searchQuery);
        if (filters.sortBy) query.append("sort", filters.sortBy);
        
        query.append("page", filters.page.toString());
        query.append("limit", "12");

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter("sortBy", e.target.value);
    setFilter("page", 1);
  };

  const handlePageChange = (newPage: number) => {
    setFilter("page", newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <div className="w-full lg:w-1/4 shrink-0">
        <FilterSidebar />
      </div>

      {/* Products Column */}
      <div className="flex-1">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6 text-sm">
          <p className="text-gray-500">
            Showing <strong className="text-brand-dark">{products.length}</strong> of{" "}
            <strong className="text-brand-dark">{pagination.total}</strong> premium products
          </p>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="rounded-lg border border-brand-primary/10 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="newest">New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Best Sellers</option>
            </select>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col rounded-lg border border-gray-100 overflow-hidden shadow-sm animate-pulse bg-white">
                <div className="aspect-[3/4] w-full bg-gray-100 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-primary/25 animate-spin" />
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="h-3 w-1/4 bg-gray-100 rounded" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-5 w-1/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-brand-dark">No products found</h3>
            <p className="text-xs text-gray-400 mt-1">Try tweaking your search or clearing active filters.</p>
          </div>
        ) : (
          <div>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="rounded px-3 py-1.5 text-xs font-semibold bg-white border border-brand-primary/10 text-gray-600 hover:bg-brand-surface/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: pagination.pages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`rounded h-8 w-8 text-xs font-bold transition-all ${
                        pagination.page === pNum
                          ? "bg-brand-primary text-white shadow-sm"
                          : "bg-white border border-brand-primary/10 text-gray-600 hover:bg-brand-surface/20"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="rounded px-3 py-1.5 text-xs font-semibold bg-white border border-brand-primary/10 text-gray-600 hover:bg-brand-surface/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

export default function RecentlyViewed() {
  const [recent, setRecent] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("recently_viewed") || "[]") as RecentProduct[];
    setRecent(list);
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl font-semibold text-brand-dark">
          Recently Viewed
        </h3>
        <span className="text-xs text-gray-400">Your history</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {recent.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="flex-shrink-0 w-40 group block bg-white rounded-lg p-2 border border-brand-primary/5 shadow-sm hover:shadow transition-all"
          >
            <div className="aspect-[3/4] w-full rounded-md overflow-hidden bg-gray-55">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <div className="mt-2 text-center">
              <h4 className="text-[11px] font-medium text-brand-dark line-clamp-1 group-hover:text-brand-primary transition-colors">
                {item.name}
              </h4>
              <p className="text-[11px] font-bold text-brand-primary mt-0.5">
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

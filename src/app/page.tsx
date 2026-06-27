import { db } from "@/lib/db";
import HeroCarousel from "@/components/shared/HeroCarousel";
import ProductCard, { StoreProduct } from "@/components/product/ProductCard";
import RecentlyViewed from "@/components/shared/RecentlyViewed";
import Link from "next/link";
import { ArrowRight, Sparkles, Award, ShieldCheck, HeartHandshake } from "lucide-react";

export const revalidate = 60; // Revalidate page every 60 seconds (ISR)

const categoriesList = [
  {
    name: "Ethnic Couture",
    category: "Ethnic",
    desc: "Designer Lehengas, Anarkalis & Kurtis.",
    bg: "bg-[#F3E8FF] border-[#E0CBE9]",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Casual Wardrobe",
    category: "Casual",
    desc: "Lightweight cottons, denims & everyday wear.",
    bg: "bg-[#FFFbeb] border-[#fde68a]",
    image: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Western Trends",
    category: "Western",
    desc: "Contemporary dresses, tops & designer fits.",
    bg: "bg-[#ECFDF5] border-[#a7f3d0]",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Athleisure & Lounge",
    category: "Activewear",
    desc: "Comfortable activewear, sets & loungewear.",
    bg: "bg-[#EFF6FF] border-[#bfdbfe]",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80",
  },
];

export default async function HomePage() {
  // Direct Server Side fetch via Prisma
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await db.product.findMany({
      where: { isFeatured: true },
      take: 6,
    });
  } catch (error) {
    console.error("Failed to query featured products", error);
  }

  return (
    <div className="space-y-12">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Brand Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border border-brand-primary/5 rounded-2xl p-6 shadow-sm text-center">
        <div className="flex flex-col items-center">
          <Award className="w-8 h-8 text-brand-secondary mb-2" />
          <h4 className="font-serif text-sm font-semibold text-brand-dark">100% Quality Assurance</h4>
          <p className="text-[10px] text-gray-400 mt-1">Carefully curated high-grade fabrics.</p>
        </div>
        <div className="flex flex-col items-center border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:border-gray-100">
          <Sparkles className="w-8 h-8 text-brand-secondary mb-2" />
          <h4 className="font-serif text-sm font-semibold text-brand-dark">Global Trends</h4>
          <p className="text-[10px] text-gray-400 mt-1">Bringing you the latest seasonal designs.</p>
        </div>
        <div className="flex flex-col items-center border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:border-gray-100">
          <ShieldCheck className="w-8 h-8 text-brand-secondary mb-2" />
          <h4 className="font-serif text-sm font-semibold text-brand-dark">Secure Checkout</h4>
          <p className="text-[10px] text-gray-400 mt-1">Encrypted transactions & payments.</p>
        </div>
        <div className="flex flex-col items-center border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:border-gray-100">
          <HeartHandshake className="w-8 h-8 text-brand-secondary mb-2" />
          <h4 className="font-serif text-sm font-semibold text-brand-dark">Easy Swaps</h4>
          <p className="text-[10px] text-gray-400 mt-1">No-hassle 10-day returns and exchanges.</p>
        </div>
      </div>

      {/* Categories Showcase */}
      <div>
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-brand-dark">
            Shop by Style
          </h3>
          <p className="text-xs text-gray-400 mt-1.5">Shop curation of global designer collections</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${cat.category}`}
              className={`group flex flex-col justify-between p-5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] ${cat.bg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-brand-dark group-hover:text-brand-primary transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1">{cat.desc}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-primary group-hover:underline flex items-center gap-1">
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="w-14 h-14 rounded-full overflow-hidden border border-brand-secondary/20 shadow-sm bg-white shrink-0">
                  <img src={cat.image} alt="" className="w-full h-full object-cover object-center" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products section */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="font-serif text-xl font-semibold tracking-wide text-brand-dark">
              Trending Now
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Curated fashion essentials handpicked for you</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
          >
            View All Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
            <p className="text-xs text-gray-400">Loading catalog curation...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p as StoreProduct} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed history list */}
      <RecentlyViewed />
    </div>
  );
}

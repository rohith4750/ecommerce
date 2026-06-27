"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Ticket,
  LogOut,
  ShoppingBasket,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, showToast } = useStore();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        showToast("Admin session ended successfully", "info");
        router.push("/");
      }
    } catch (err) {
      showToast("Sign out failed", "error");
    }
  };

  const menuItems = [
    {
      name: "Overview",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Products Hub",
      href: "/admin/products",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      name: "Order Tracking",
      href: "/admin/orders",
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      name: "Campaign Toggles",
      href: "/admin/discounts",
      icon: <Ticket className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#1A1A2E] text-gray-300 rounded-xl border border-brand-primary/5 p-6 shrink-0 flex flex-col justify-between min-h-[300px] md:min-h-[500px]">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
            Management Panel
          </span>
          <h2 className="font-serif text-lg font-bold text-white mt-1">SilkRoute Office</h2>
        </div>

        {/* Links Navigation */}
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 ${
                  isActive
                    ? "bg-brand-primary text-white shadow-md font-bold scale-[1.02]"
                    : "text-gray-400 hover:bg-brand-surface/10 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:bg-brand-surface/10 hover:text-white transition-all"
        >
          <ShoppingBasket className="w-4 h-4 text-brand-secondary" />
          View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950 transition-all text-left border-t border-gray-800/40"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

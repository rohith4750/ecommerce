"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  History,
} from "lucide-react";

export default function Navbar() {
  const { user, cart, wishlist, setUser, showToast, filters, setFilter } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Fetch current user on mount to restore session if cookies exist
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session verification failed", err);
      }
    }
    fetchMe();
  }, [setUser]);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const wishCount = wishlist.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("searchQuery", searchVal);
    router.push(`/products?search=${encodeURIComponent(searchVal)}`);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        showToast("Logged out successfully", "success");
        router.push("/");
      }
    } catch (error) {
      showToast("Logout failed", "error");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-primary/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-wider text-brand-primary transition-colors hover:text-brand-secondary">
            OmniStore
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
          <Link
            href="/products"
            onClick={() => setFilter("category", "")}
            className={`transition-colors hover:text-brand-primary ${
              pathname === "/products" ? "text-brand-primary font-semibold" : "text-gray-600"
            }`}
          >
            All Collections
          </Link>
          <Link
            href="/products?category=Ethnic"
            onClick={() => setFilter("category", "Ethnic")}
            className="text-gray-600 transition-colors hover:text-brand-primary"
          >
            Ethnic Wear
          </Link>
          <Link
            href="/products?category=Casual"
            onClick={() => setFilter("category", "Casual")}
            className="text-gray-600 transition-colors hover:text-brand-primary"
          >
            Casual Wear
          </Link>
        </nav>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-full border border-brand-primary/20 px-4 py-2 pr-10 text-xs focus:border-brand-primary focus:outline-none bg-brand-surface/20"
          />
          <button type="submit" className="absolute right-3 text-brand-primary/60 hover:text-brand-primary">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Navigation Actions */}
        <div className="flex items-center space-x-6">
          {/* Wishlist */}
          <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-brand-primary transition-colors">
            <Heart className="w-6 h-6" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-secondary text-[10px] font-bold text-white shadow-sm">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-brand-primary transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Portal Dropdown */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1 cursor-pointer p-2 text-gray-600 hover:text-brand-primary transition-colors font-medium text-sm"
                >
                  <UserIcon className="w-5 h-5 text-brand-primary" />
                  <span className="max-w-[80px] truncate hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-md bg-white border border-brand-primary/10 shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-brand-surface/20 border-b border-brand-primary/5">
                      <p className="text-xs font-semibold text-gray-400">Account Role</p>
                      <p className="text-xs text-brand-primary font-bold">{user.role}</p>
                    </div>
                    
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-brand-surface/40 hover:text-brand-primary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-brand-surface/40 hover:text-brand-primary transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-brand-surface/40 hover:text-brand-primary transition-colors"
                    >
                      <History className="w-4 h-4" />
                      Order History
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-brand-primary/5"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-brand-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary/95 transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-brand-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-primary/5 bg-white px-4 py-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-full border border-brand-primary/20 px-4 py-2.5 pr-10 text-xs bg-brand-surface/20"
            />
            <button type="submit" className="absolute right-3 text-brand-primary/60">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <Link
            href="/products"
            onClick={() => {
              setFilter("category", "");
              setMobileMenuOpen(false);
            }}
            className="block text-sm font-medium text-gray-700 hover:text-brand-primary"
          >
            All Collections
          </Link>
          <Link
            href="/products?category=Ethnic"
            onClick={() => {
              setFilter("category", "Ethnic");
              setMobileMenuOpen(false);
            }}
            className="block text-sm font-medium text-gray-700 hover:text-brand-primary"
          >
            Ethnic Wear
          </Link>
          <Link
            href="/products?category=Casual"
            onClick={() => {
              setFilter("category", "Casual");
              setMobileMenuOpen(false);
            }}
            className="block text-sm font-medium text-gray-700 hover:text-brand-primary"
          >
            Casual Wear
          </Link>

          {!user && (
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-md border border-brand-primary/20 text-sm font-medium text-gray-700"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-md bg-brand-primary text-white text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useStore();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (user?.role === "ADMIN" && !isAdminRoute) {
      router.replace("/admin/dashboard");
    }
  }, [user, isAdminRoute, router]);

  if (isAdminRoute) {
    return (
      <main className="flex-1 w-full min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </>
  );
}

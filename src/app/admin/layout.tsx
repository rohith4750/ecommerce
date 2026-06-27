import AdminSidebar from "@/components/admin/AdminSidebar";
import { User, Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Full-Height Sidebar */}
      <div className="w-64 h-full shrink-0 flex flex-col">
        <AdminSidebar />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Toolbar */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-brand-dark">Dashboard Control</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

        {/* Small Admin Footer */}
        <footer className="h-12 shrink-0 border-t border-gray-200 bg-white flex items-center justify-center text-[11px] text-gray-400 font-medium">
          OmniStore Admin Console © 2026. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

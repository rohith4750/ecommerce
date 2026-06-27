import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Sidebar Panel */}
      <div className="w-full md:w-64 shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Administrative Action Panel */}
      <div className="flex-1 w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

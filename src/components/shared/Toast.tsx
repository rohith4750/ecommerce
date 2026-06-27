"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toast, hideToast } = useStore();

  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.type, hideToast]);

  if (!toast.type) return null;

  const bgColors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-purple-50 border-purple-200 text-purple-800",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-brand-primary" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg glass-panel max-w-sm animate-gold-glow fade-in-up md:max-w-md min-w-[280px]">
      <div className={`flex items-center gap-3 w-full rounded-md p-1 ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={hideToast}
          className="text-gray-400 hover:text-gray-700 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

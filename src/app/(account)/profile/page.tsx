"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { User, Mail, Calendar, Key, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser, showToast } = useStore();
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast("Profile name updated successfully!", "success");
      } else {
        showToast(data.error || "Update failed", "error");
      }
    } catch (err) {
      showToast("Server error during update", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-gray-500">Checking session. Please sign in...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in py-6">
      <h1 className="font-serif text-2xl font-bold text-brand-dark">My Profile</h1>
      
      <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Specs summary */}
        <div className="md:col-span-1 bg-brand-surface/20 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-brand-primary/5">
          <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-xl font-bold font-serif mb-3 shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold text-brand-dark leading-tight text-sm">{user.name}</h3>
          <p className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider mt-1">{user.role}</p>
        </div>

        {/* Column 2: Details fields */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3 text-xs text-gray-600 border-b border-gray-100 pb-3">
            <Mail className="w-4.5 h-4.5 text-brand-primary/70 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Email address</p>
              <p className="font-medium text-brand-dark">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 border-b border-gray-100 pb-3">
            <Shield className="w-4.5 h-4.5 text-brand-primary/70 shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Account Role</p>
              <p className="font-medium text-brand-dark">{user.role} (Standard Access)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit fields */}
      <div className="bg-white rounded-xl border border-brand-primary/5 p-6 shadow-sm">
        <h3 className="font-serif text-sm font-semibold text-brand-dark mb-4 pb-2 border-b border-gray-100">
          Personal Information
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-brand-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updating || !nameInput.trim()}
            className="rounded-lg bg-brand-primary text-white text-xs font-semibold py-2 px-5 hover:bg-brand-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

    </div>
  );
}

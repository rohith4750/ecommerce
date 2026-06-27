"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const { setUser, showToast } = useStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification OTP state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "OTP code sent to email inbox", "success");
        setShowOtpScreen(true);
      } else {
        showToast(data.error || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Server error during registration", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast("Account activated successfully! Welcome to SilkRoute.", "success");
        router.push("/");
      } else {
        showToast(data.error || "Invalid OTP code", "error");
      }
    } catch (err) {
      showToast("Server error verifying OTP", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-white rounded-xl border border-brand-primary/5 p-8 shadow-sm space-y-6">
        
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-wider text-brand-primary">
            SilkRoute
          </Link>
          <h2 className="mt-4 font-serif text-lg font-semibold text-brand-dark">
            {showOtpScreen ? "Verify Account" : "Create Account"}
          </h2>
          <p className="text-[10px] text-gray-400 mt-1">
            {showOtpScreen
              ? "Verify registration code to activate your account"
              : "Register to explore handloom weaver saree drafts"}
          </p>
        </div>

        {showOtpScreen ? (
          /* OTP Section */
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1">
                Enter Welcome OTP
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center rounded-lg border border-gray-200 px-4 py-2.5 text-base tracking-[6px] font-bold focus:border-brand-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading || otpCode.length !== 6}
              className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Activate Account"}
            </button>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs text-gray-600">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohith Palagummi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 focus:border-brand-primary focus:outline-none"
                />
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 focus:border-brand-primary focus:outline-none"
                />
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1">
                Create Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 focus:border-brand-primary focus:outline-none"
                />
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-gray-100">
              <p className="text-[11px] text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-primary hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

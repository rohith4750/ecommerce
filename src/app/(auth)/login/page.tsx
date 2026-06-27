"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { KeyRound, Mail, ArrowRight, Loader2, Lock } from "lucide-react";

function LoginForm() {
  const { setUser, showToast } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Verification flow state
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Submit Login credentials
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        showToast("Welcome back!", "success");
        router.push(redirectUrl);
      } else if (res.status === 403 && data.status === "VERIFICATION_PENDING") {
        // Redirection trigger: User exists but email is not verified yet
        showToast("Account verification required. OTP sent to email.", "info");
        setShowOtpScreen(true);
      } else {
        showToast(data.error || "Authentication failed", "error");
      }
    } catch (err) {
      showToast("Server error during login", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP Verification
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
        showToast("Account verified and activated!", "success");
        router.push(redirectUrl);
      } else {
        showToast(data.error || "Verification failed", "error");
      }
    } catch (err) {
      showToast("Server error verifying code", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-white rounded-xl border border-brand-primary/5 p-8 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-wider text-brand-primary">
            SilkRoute
          </Link>
          <h2 className="mt-4 font-serif text-lg font-semibold text-brand-dark">
            {showOtpScreen ? "Verify Account" : "Access Account"}
          </h2>
          <p className="text-[10px] text-gray-400 mt-1">
            {showOtpScreen ? "Enter the 6-digit OTP code sent to your inbox" : "Sign in using credentials"}
          </p>
        </div>

        {showOtpScreen ? (
          /* OTP Screen */
          <form onSubmit={handleOtpSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-wider mb-1">
                6-Digit Verification Code
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
              className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify and Continue"}
            </button>

            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              className="w-full text-center text-[10px] font-semibold text-gray-400 hover:text-brand-primary"
            >
              Back to Credentials Sign In
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-gray-600">
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
                Password
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Admin/User credentials hints */}
            <div className="bg-brand-surface/20 border border-brand-primary/5 rounded-lg p-3 text-[10px] space-y-1 text-brand-primary/80">
              <p className="font-bold">Sample Logins (For Testing):</p>
              <p>• Customer: <strong>customer@silkroute.in</strong> / <strong>Customer@123</strong></p>
              <p>• Admin Panel: <strong>admin@silkroute.in</strong> / <strong>Admin@123</strong></p>
            </div>

            <div className="pt-4 text-center border-t border-gray-100">
              <p className="text-[11px] text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-brand-primary hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Login failed. Please try again.");
      }

      await new Promise((res) => setTimeout(res, 200));

      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect');
      router.replace(redirectTo || '/');
    } catch (err: any) {
      const message = err?.message ?? "";

      if (message.toLowerCase().includes("invalid login credentials")) {
        setError(
          "We could not log you in.\n\nIf you signed up with Google, please continue with Google.\nOtherwise you may need to reset your password."
        );
      } else {
        setError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------
  // PASSWORD RESET
  // ---------------------------
  const sendReset = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setResetBusy(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }

    setResetBusy(false);
  };

  // ---------------------------
  // GOOGLE LOGIN
  // ---------------------------
  const handleGoogleLogin = async () => {
    setError(null);

    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get('redirect');
    if (redirectTo) sessionStorage.setItem('post_login_redirect', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-[32px] tracking-[-0.03em] text-[#181512] no-underline"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, lineHeight: 1 }}
          >
            Ancestor<span className="text-[#C8A557]">ii</span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="border border-[#ECE5D8] px-7 py-8 sm:px-9 sm:py-10"
          style={{ background: '#FFFFFF' }}
        >
          {/* Header */}
          <h1
            className="text-[26px] sm:text-[30px] tracking-[-0.03em] text-[#181512] mb-1.5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1.1 }}
          >
            Welcome back.
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#8A7F72] mb-7 leading-relaxed">
            Continue building your family library.
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-[#E0D6C8] text-[13px] font-medium text-[#3D3526] transition-all duration-200 hover:border-[#B8932A] hover:text-[#181512] active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-[18px] w-[18px]">
              <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
              <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
              <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#ECE5D8]" />
            <span className="text-[11px] tracking-[0.08em] uppercase text-[#B5AFA6] font-medium">or</span>
            <div className="flex-1 h-px bg-[#ECE5D8]" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] transition-colors duration-200 focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                style={{ background: '#FDFCFA' }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-[#E0D6C8] px-3.5 py-2.5 pr-16 text-[14px] text-[#181512] placeholder-[#C0B9AE] transition-colors duration-200 focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                  style={{ background: '#FDFCFA' }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors duration-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={sendReset}
                disabled={resetBusy}
                className="text-[12px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors duration-200"
              >
                {resetBusy ? "Sending…" : "Forgot password?"}
              </button>
            </div>

            {error && (
              <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3">
                <p className="text-[13px] text-[#8B3A32] leading-relaxed whitespace-pre-line">
                  {error}
                </p>
              </div>
            )}
            {resetSent && (
              <div className="border border-[#C5DBBF] bg-[#F5FAF3] px-4 py-3">
                <p className="text-[13px] text-[#3D6B35] leading-relaxed">
                  Password reset email sent. Please check your inbox.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold text-white tracking-[0.04em] transition-all duration-200 hover:shadow-lg hover:shadow-[#1A1612]/15 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)' }}
            >
              {busy && (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-7 pt-6 border-t border-[#ECE5D8] flex items-center justify-between">
            <Link
              href="/signup"
              prefetch
              className="text-[12px] sm:text-[13px] font-medium text-[#B8932A] hover:text-[#96751E] transition-colors duration-200 no-underline"
            >
              Create an account
            </Link>
            <Link
              href="/"
              className="text-[12px] sm:text-[13px] text-[#8A7F72] hover:text-[#4A4030] transition-colors duration-200 no-underline"
            >
              Back to stories
            </Link>
          </div>
        </div>

        {/* Trust line */}
      </div>
    </div>
  );
}
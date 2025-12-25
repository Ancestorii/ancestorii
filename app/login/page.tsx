"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

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

      router.replace('/dashboard/profile');
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        {/* Brand */}
        <div className="flex items-center justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/Actual white logo.png"
              alt="Ancestorii"
              className="h-10 w-auto"
            />
            <span className="sr-only">Ancestorii</span>
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-[#0f2040] mb-1">
          Log in
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Welcome back. Continue building your legacy.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="button"
              onClick={sendReset}
              disabled={resetBusy}
              className="text-sm text-[#0f2040] hover:text-[#d4af37] font-medium"
            >
              {resetBusy ? "Sending…" : "Forgot password?"}
            </button>
          </div>

          {/* Errors */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Reset confirmation */}
          {resetSent && (
            <p className="text-sm text-green-600">
              Password reset email sent. Please check your inbox.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white bg-[#0f2040] hover:bg-[#152a52] disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-sm text-slate-600 flex items-center justify-between">
          <Link
            href="/signup"
            className="text-[#0f2040] hover:text-[#d4af37] font-medium"
          >
            Need an account? Create one
          </Link>

          <Link href="/" className="hover:underline">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

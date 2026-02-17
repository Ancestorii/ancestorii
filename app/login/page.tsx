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

      // ⏳ Give Supabase time to persist auth cookies
      await new Promise((res) => setTimeout(res, 200));

      // ✅ ALWAYS REDIRECT TO DASHBOARD
      router.replace("/dashboard/home");
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

  // ---------------------------
// GOOGLE LOGIN
// ---------------------------
const handleGoogleLogin = async () => {
  setError(null);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard/home`,
    },
  });

  if (error) {
    setError(error.message);
  }
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
        {/* Google Login */}
<button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full mb-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-5 w-5"
  >
    <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
    <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
  </svg>
  Continue with Google
</button>

<div className="flex items-center my-4">
  <div className="flex-grow h-px bg-gray-200" />
  <span className="px-3 text-sm text-gray-400">or</span>
  <div className="flex-grow h-px bg-gray-200" />
</div>


        <form onSubmit={onSubmit} className="space-y-4">
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          {resetSent && (
            <p className="text-sm text-green-600">
              Password reset email sent. Please check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white bg-[#0f2040] hover:bg-[#152a52] disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 flex items-center justify-between">
          <Link
            href="/signup" prefetch
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

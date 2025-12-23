"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);


  // If already logged in, bounce to dashboard (use getSession for instant hydration)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) router.replace("/dashboard/profile");
    })();
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }

      // Ensure we actually have a session before redirecting
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session after auth");
      router.replace("/dashboard/profile");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
  if (!email) {
    setError("Please enter your email first.");
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
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-8">
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
          {mode === "login" ? "Log in" : "Create your account"}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {mode === "login"
            ? "Welcome back."
            : "Join Ancestorii to preserve your story."}
        </p>

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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "login" && (
       <div className="text-right">
        <button
          type="button"
         onClick={sendReset}
         disabled={resetBusy}
         className="text-sm text-[#0f2040] hover:text-[#d4af37] font-medium"
         >
         {resetBusy ? "Sending..." : "Forgot password?"}
    </button>
  </div>
)}


          {error && <p className="text-sm text-red-600">{error}</p>}

          {resetSent && (
  <p className="text-sm text-green-600">
    Password reset email sent. Check your inbox.
  </p>
)}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md text-white bg-[#0f2040] hover:bg-[#152a52] disabled:opacity-50"
          >
            {busy
              ? mode === "login"
                ? "Logging in..."
                : "Creating..."
              : mode === "login"
              ? "Log in"
              : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 flex items-center justify-between">
          <button
           onClick={() => {
           setMode(mode === "login" ? "signup" : "login");
           setResetSent(false);
           setError(null);
          }}
          className="text-[#0f2040] hover:text-[#d4af37] font-medium"
          >
            {mode === "login"
            ? "Need an account? Sign up"
             : "Have an account? Log in"}
          </button>
          <Link href="/" className="hover:underline">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

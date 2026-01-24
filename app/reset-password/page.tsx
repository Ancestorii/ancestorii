'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

export default function ResetPasswordPage() {
  const supabase = getBrowserClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error_code');

    if (errorCode === 'otp_expired') {
      setLinkExpired(true);
      return;
    }

    (async () => {
      // first attempt
      let { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
        return;
      }

      // recovery session can hydrate slightly late
      setTimeout(async () => {
        const { data: retry } = await supabase.auth.getSession();

        if (!retry.session) {
          setLinkExpired(true);
        } else {
          setReady(true);
        }
      }, 300);
    })();
  }, [supabase]);

  const updatePassword = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully.');
      window.location.href = '/login';
    }
  };

  /* 🔴 EXPIRED LINK UI */
  if (linkExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold mb-3">Link expired</h1>
          <p className="text-sm text-gray-600 mb-6">
            This password reset link is invalid or has expired.
            Please request a new one.
          </p>
          <a
            href="/login"
            className="block w-full bg-[#E6C26E] py-2 rounded-xl font-semibold"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  /* ✅ NORMAL RESET FLOW */
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4">Set new password</h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl p-2 mb-4"
        />

        <button
          onClick={updatePassword}
          disabled={loading || password.length < 6}
          className="w-full bg-[#E6C26E] py-2 rounded-xl font-semibold"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}

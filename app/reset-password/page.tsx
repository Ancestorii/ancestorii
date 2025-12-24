'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

export default function ResetPasswordPage() {
  const supabase = getBrowserClient();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = '/login';
        return;
      }

      setChecked(true);
    })();
  }, [supabase]);

  if (!checked) return null;

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

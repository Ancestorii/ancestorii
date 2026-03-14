'use client';

import { useEffect, useState } from 'react';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import {
  Bell,
  Mail,
  CheckCircle,
  Settings as Gear,
  Shield,
} from 'lucide-react';

type Prefs = {
  id: string;
  user_id: string;
  in_app: boolean;
  email: boolean;
};

export default function SettingsPage() {
  const supabase = getBrowserClient();

  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedInApp, setSavedInApp] = useState(false);
  const [savedEmail, setSavedEmail] = useState(false);

  const [newPass, setNewPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  /* ---------------------------------- */
  /* Change password                    */
  /* ---------------------------------- */

  const changePassword = async () => {
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);

    const { error } = await supabase.auth.updateUser({
      password: newPass,
    });

    setChangingPass(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully.');
      setNewPass('');
    }
  };

  /* ---------------------------------- */
  /* Fetch notification preferences     */
  /* ---------------------------------- */

  useEffect(() => {
    const fetchPrefs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const marketingOptIn = user?.user_metadata?.newsletter_opt_in ?? false;

      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
  setPrefs({
    ...data,
    email: marketingOptIn,
  });
}

      setLoading(false);
    };

    fetchPrefs();
  }, []);

  const toggle = (key: 'in_app' | 'email') => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const save = async (type: 'in_app' | 'email') => {
    if (!prefs) return;

    setSaving(true);

    const { error } = await supabase
      .from('notification_preferences')
      .update({
        in_app: prefs.in_app,
        email: prefs.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prefs.id);

    setSaving(false);

    /* ---------------------------------- */
/* Update Supabase Auth marketing opt-in */
/* ---------------------------------- */

if (type === 'email') {
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      newsletter_opt_in: prefs.email,
    },
  });

  if (metaError) {
    console.error('Failed to update marketing preference:', metaError);
  }
}

    if (!error) {
  if (type === 'in_app') {
    setSavedInApp(true);
    setTimeout(() => setSavedInApp(false), 2500);
  }

  if (type === 'email') {
    setSavedEmail(true);
    setTimeout(() => setSavedEmail(false), 2500);
  }
}
  };

  if (loading) {
    return (
      <div className="p-10 text-gray-500 text-sm">
        Loading your settings...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-16 bg-[#FFFCF7] min-h-screen">

      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-amber-100 rounded-2xl">
            <Gear className="w-8 h-8 text-[#B8860B]" />
          </div>

          <h1 className="text-4xl font-serif font-bold text-[#0F2040] tracking-tight">
            Settings
          </h1>
        </div>

        <p className="text-[#6B7280] ml-16 font-medium max-w-xl">
          Manage how Ancestorii communicates with you and keep your family's
          memories protected.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* In App Notifications */}
        <section className="group bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-50/50 hover:shadow-[0_8px_30px_rgb(212,175,55,0.1)] transition-all duration-300">

          <div className="flex flex-col h-full justify-between">

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 bg-orange-50 rounded-xl">
                  <Bell className="w-6 h-6 text-[#D4AF37]" />
                </div>

                <Toggle
                  value={prefs?.in_app || false}
                  onChange={() => toggle('in_app')}
                />
              </div>

              <h2 className="text-xl font-bold text-[#0F2040] mb-3">
                In-App Notifications
              </h2>

              <p className="text-sm leading-relaxed text-gray-500">
                Be gently notified when meaningful updates happen inside your
                family library, such as new memories being added or timelines
                being expanded.
              </p>
            </div>

            <button
              onClick={() => save('in_app')}
              disabled={saving}
              className="mt-8 w-full py-3 rounded-2xl bg-[#0F2040] text-white font-semibold hover:bg-[#1a3563] transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            <div className="mt-4 min-h-[24px]">
            {savedInApp && (
              <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-medium transition-opacity duration-300">
                <CheckCircle className="w-4 h-4" />
                Preferences updated successfully.
              </div>
            )}
            </div>
          </div>
        </section>

        {/* Updates & Memory Tips */}
        <section className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-50/50 hover:shadow-[0_8px_30px_rgb(212,175,55,0.1)] transition-all duration-300">

          <div className="flex flex-col h-full justify-between">

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Mail className="w-6 h-6 text-[#D4AF37]" />
                </div>

                <Toggle
                  value={prefs?.email || false}
                  onChange={() => toggle('email')}
                />
              </div>

              <h2 className="text-xl font-bold text-[#0F2040] mb-3">
                Updates & Memory Tips
              </h2>

              <p className="text-sm leading-relaxed text-gray-500">
                Send me occasional updates and helpful tips about preserving
                family memories, along with thoughtful insights on making the
                most of my Ancestorii library.
              </p>
            </div>

            <button
              onClick={() => save('email')}
              disabled={saving}
              className="mt-8 w-full py-3 rounded-2xl bg-[#0F2040] text-white font-semibold hover:bg-[#1a3563] transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
             
             <div className="mt-4 min-h-[24px]">
            {savedEmail && (
  <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-medium transition-opacity duration-300">
    <CheckCircle className="w-4 h-4" />
    Preferences updated successfully.
  </div>
)}
</div>
          </div>
        </section>

      </div>

      {/* Security Section */}
      <section className="mt-12 bg-gradient-to-br from-white to-[#FFFBF0] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100">

        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-green-50 rounded-xl">
            <Shield className="w-6 h-6 text-[#B8860B]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F2040]">
              Security
            </h2>

            <p className="text-sm text-gray-500">
              Protect your family’s history by keeping your account secure.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">

          <input
            type="password"
            placeholder="Enter new password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="flex-1 bg-white border-2 border-amber-50 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100/50 transition-all"
          />

          <button
            onClick={changePassword}
            disabled={changingPass}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E6C26E] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>

        </div>

      </section>

    </div>
  );
}

/* Toggle Component */

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all ${
        value ? 'bg-[#D4AF37]' : 'bg-gray-300'
      } relative`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all ${
          value ? 'translate-x-6' : ''
        }`}
      />
    </button>
  );
}
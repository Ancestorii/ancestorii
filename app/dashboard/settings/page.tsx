'use client';

import { useEffect, useState } from 'react';
import { safeToast as toast } from '@/lib/safeToast';
import { supabase } from '@/lib/supabaseClient';
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle,
  Settings as Gear,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

type Prefs = {
  id: string;
  user_id: string;
  in_app: boolean;
  email: boolean;
  sms: boolean;
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [newPass, setNewPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

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
    toast.success('Password changed successfully.');
    setNewPass('');
  }
};



  // 🔹 Fetch preferences
  useEffect(() => {
    const fetchPrefs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) setPrefs(data);
      setLoading(false);
    };

    fetchPrefs();
  }, []);

  const toggle = (key: 'in_app' | 'email' | 'sms') => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);

    const { error } = await supabase
      .from('notification_preferences')
      .update({
        in_app: prefs.in_app,
        email: prefs.email,
        sms: prefs.sms,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prefs.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setDeleting(true);

    try {
      // Delete user from Auth
      await supabase.auth.admin.deleteUser(user.id);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 text-sm">
        Loading notification preferences...
      </div>
    );

  return (
    <div className="p-12">
      
      {/* 🛠 Title with gear icon */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-[#0F2040] flex items-center gap-2">
          <Gear className="w-7 h-7 text-[#D4AF37] transition-transform hover:rotate-45 duration-300" />
          Settings
        </h1>
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl">

  {/* 🔔 Notification Preferences */}
  <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200">
    <div className="flex items-center gap-2 mb-6">
      <Bell className="w-6 h-6 text-[#D4AF37]" />
      <h2 className="text-2xl font-bold text-[#0F2040]">
        Notification Preferences
      </h2>
    </div>

    <div className="space-y-6">
      <PreferenceRow
        icon={<Bell className="w-5 h-5 text-[#D4AF37]" />}
        label="In-App Notifications"
        value={prefs?.in_app || false}
        toggle={() => toggle('in_app')}
      />

      <PreferenceRow
        icon={<Mail className="w-5 h-5 text-[#D4AF37]" />}
        label="Email Notifications"
        value={prefs?.email || false}
        toggle={() => toggle('email')}
      />

      <PreferenceRow
        icon={<Smartphone className="w-5 h-5 text-[#D4AF37]" />}
        label="SMS Notifications"
        value={prefs?.sms || false}
        toggle={() => toggle('sms')}
      />
    </div>

    <button
      onClick={save}
      disabled={saving}
      className={`mt-8 w-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
        text-[#0F2040] font-semibold py-2 rounded-xl hover:shadow-md transition-all
        ${saving ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </button>

    {saved && (
      <div className="flex items-center gap-2 mt-4 text-green-600 text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        <span>Preferences updated successfully.</span>
      </div>
    )}
  </div>

  {/* 🔐 Security */}
  <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-200">
    <h2 className="text-2xl font-bold text-[#0F2040] mb-6">
      Security
    </h2>

    <div className="space-y-4">
      <input
        type="password"
        placeholder="New password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        className="w-full border border-gray-300 rounded-xl p-3
          focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      />

      <button
        onClick={changePassword}
        disabled={changingPass}
        className={`w-full bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
          text-[#0F2040] font-semibold py-3 rounded-xl transition-all
          ${changingPass ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        `}
      >
        {changingPass ? 'Updating...' : 'Change Password'}
      </button>
    </div>
  </div>

</div>


      {/* 🔴 Delete Account Section */}
      <div className="max-w-2xl mt-16">
        <h2 className="text-2xl font-bold text-[#0F2040] mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Danger Zone
        </h2>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-xl shadow-sm transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* ⚠️ Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md text-center relative">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0F2040] mb-3">
              Delete Account?
            </h2>
            <p className="text-gray-600 mb-6">
              This action <strong>cannot be undone</strong>. All your data and
              memories will be permanently deleted. To confirm, please type{' '}
              <span className="font-bold text-red-600">DELETE</span> below.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full border border-gray-300 rounded-xl p-2 mb-6 text-center focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className={`px-6 py-2 rounded-xl text-white transition-all ${
                  deleteConfirmText === 'DELETE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>

            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------- */
/* 🔧 Sub-component for each toggle row */
/* ----------------------------------------- */
function PreferenceRow({
  icon,
  label,
  value,
  toggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  toggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-gray-700 text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={toggle}
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
    </div>
  );
}

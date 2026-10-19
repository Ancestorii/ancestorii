'use client';

import { useEffect, useId, useState } from 'react';
import { safeToast as toast } from '@/lib/safeToast';
import { getBrowserClient } from '@/lib/supabase/browser';
import {
  Bell,
  Mail,
  Check,
  Shield,
} from 'lucide-react';
import {
  ui,
  AppLoader,
  Btn,
  IconTile,
  PageHeader,
  Spinner,
  toneByKey,
} from '@/components/dashboard/ui/AppBits';
import s from './settings.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Prefs = {
  // null until the row exists: it is created on the first save, not on load.
  id: string | null;
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

  // Each switch is named by its card's title and described by its words; the password
  // field has a label of its own.
  const inAppTitleId = useId();
  const inAppTextId = useId();
  const emailTitleId = useId();
  const emailTextId = useId();
  const securityTitleId = useId();
  const passId = useId();

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
      // The user comes from the local session (no network round trip); RLS guards the rows.
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;

      const marketingOptIn = user?.user_metadata?.newsletter_opt_in ?? false;

      if (!user) {
        // Without this the loader never ended when there was no user.
        setLoading(false);
        return;
      }

      // A fresh account has no row yet: maybeSingle answers null where single() answered 406.
      // Nothing is written on load. A missing row counts as opted in (the column's default, and
      // what send-push assumes), so the switch shows on; the row is created on the first save.
      // (The old upsert on user_id answered 400: that column has no unique constraint.)
      const { data } = await supabase
        .from('notification_preferences')
        .select('id, user_id, in_app, email')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      setPrefs({
        id: data?.id ?? null,
        user_id: user.id,
        in_app: data?.in_app ?? true,
        email: marketingOptIn,
      });

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

    const values = { in_app: prefs.in_app, email: prefs.email };

    // The row is created on the first save, then updated by id. .select() brings the row back,
    // so an update that touched nothing (RLS) reads as a failure, not a success.
    const { data: row, error } = prefs.id
      ? await supabase
          .from('notification_preferences')
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq('id', prefs.id)
          .select('id')
          .maybeSingle()
      : await supabase
          .from('notification_preferences')
          .insert({ user_id: prefs.user_id, ...values })
          .select('id')
          .single();

    if (error || !row) {
      setSaving(false);
      toast.error('Could not save your settings. Please try again.');
      return;
    }

    if (!prefs.id) {
      const newId = row.id as string;
      setPrefs((p) => (p ? { ...p, id: newId } : p));
    }

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

    setSaving(false);

    if (type === 'in_app') {
      setSavedInApp(true);
      setTimeout(() => setSavedInApp(false), 2500);
    }

    if (type === 'email') {
      setSavedEmail(true);
      setTimeout(() => setSavedEmail(false), 2500);
    }
  };

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        {/* Header: always shown, so only the cards wait for the preferences */}
        <PageHeader
          eyebrow="Your account"
          eyebrowDot="var(--c1)"
          title="Settings"
          lead={
            <>
              Manage how Ancestorii communicates with you and keep your family&apos;s
              memories protected.
            </>
          }
        />

        {loading ? (
          <AppLoader label="Loading your settings" />
        ) : (
          <div className={cx(ui.section, s.settings)}>
            <div className={s.prefs}>
              {/* In App Notifications */}
              <section className={cx(ui.card, s.card)} aria-labelledby={inAppTitleId}>
                <div className={s.cardBody}>
                  <div className={s.cardTop}>
                    <IconTile Icon={Bell} tone={toneByKey('blue')} />

                    <Toggle
                      value={prefs?.in_app || false}
                      onChange={() => toggle('in_app')}
                      labelledBy={inAppTitleId}
                      describedBy={inAppTextId}
                    />
                  </div>

                  <h2 id={inAppTitleId} className={s.title}>
                    In-App Notifications
                  </h2>

                  <p id={inAppTextId} className={s.text}>
                    Be gently notified when meaningful updates happen inside your
                    family library, such as new memories being added or timelines
                    being expanded.
                  </p>
                </div>

                <div className={s.foot}>
                  <Btn
                    onClick={() => save('in_app')}
                    disabled={saving}
                    icon={saving ? <Spinner size={16} /> : undefined}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Btn>

                  <p role="status" className={s.saved}>
                    {savedInApp && (
                      <>
                        <span className={s.savedDot} aria-hidden="true">
                          <Check size={13} strokeWidth={3.2} />
                        </span>
                        Preferences updated successfully.
                      </>
                    )}
                  </p>
                </div>
              </section>

              {/* Updates & Memory Tips */}
              <section className={cx(ui.card, s.card)} aria-labelledby={emailTitleId}>
                <div className={s.cardBody}>
                  <div className={s.cardTop}>
                    <IconTile Icon={Mail} tone={toneByKey('pink')} />

                    <Toggle
                      value={prefs?.email || false}
                      onChange={() => toggle('email')}
                      labelledBy={emailTitleId}
                      describedBy={emailTextId}
                    />
                  </div>

                  <h2 id={emailTitleId} className={s.title}>
                    Updates & Memory Tips
                  </h2>

                  <p id={emailTextId} className={s.text}>
                    Send me occasional updates and helpful tips about preserving
                    family memories, along with thoughtful insights on making the
                    most of my Ancestorii library.
                  </p>
                </div>

                <div className={s.foot}>
                  <Btn
                    onClick={() => save('email')}
                    disabled={saving}
                    icon={saving ? <Spinner size={16} /> : undefined}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Btn>

                  <p role="status" className={s.saved}>
                    {savedEmail && (
                      <>
                        <span className={s.savedDot} aria-hidden="true">
                          <Check size={13} strokeWidth={3.2} />
                        </span>
                        Preferences updated successfully.
                      </>
                    )}
                  </p>
                </div>
              </section>
            </div>

            {/* Security Section */}
            <section className={cx(ui.card, s.security)} aria-labelledby={securityTitleId}>
              <div className={s.securityHead}>
                <IconTile Icon={Shield} tone={toneByKey('aqua')} />

                <h2 id={securityTitleId} className={s.title}>
                  Security
                </h2>

                <p className={s.text}>
                  Protect your family’s history by keeping your account secure.
                </p>
              </div>

              <div className={s.securityForm}>
                <label htmlFor={passId} className={ui.label}>
                  New password
                </label>

                <div className={s.passRow}>
                  <input
                    id={passId}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className={cx(ui.input, s.passInput)}
                  />

                  <Btn
                    onClick={changePassword}
                    disabled={changingPass}
                    icon={changingPass ? <Spinner size={16} /> : undefined}
                    className={s.passBtn}
                  >
                    {changingPass ? 'Updating...' : 'Update Password'}
                  </Btn>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* Toggle Component: the kit's on/off switch */

function Toggle({
  value,
  onChange,
  labelledBy,
  describedBy,
}: {
  value: boolean;
  onChange: () => void;
  labelledBy?: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={onChange}
      className={cx(ui.switch, s.switch)}
    >
      <span />
    </button>
  );
}

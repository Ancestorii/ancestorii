"use client";

import { useState, useEffect, useId, type CSSProperties } from "react";
import { Mail, Phone, Plus, Send } from "lucide-react";
import { getBrowserClient } from '@/lib/supabase/browser';
import {
  ui,
  Accent,
  Btn,
  IconTile,
  PageHeader,
  SectionHead,
  Spinner,
  tone,
  toneByKey,
} from '@/components/dashboard/ui/AppBits';
import s from './help.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type StatusState = "success" | "error" | null;

export default function HelpPage() {
  const supabase = getBrowserClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  // null until the subscription is read, then whether this account is on Premium.
  const [premium, setPremium] = useState<boolean | null>(null);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  // Fetch plan for conditional phone box
  useEffect(() => {
    const fetchPlan = async () => {
      // The user comes from the local session (no network round trip).
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) {
        setPremium(false);
        return;
      }

      // The form already knows who is writing.
      setName((n) => n || user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEmail((e) => e || user.email || '');

      // The same test as the sidebar and the Plans page: this user's subscription row, on the
      // Premium plan, active, not cancelling and not past its period. (The old family-wide read
      // used maybeSingle, which errors for any family of two or more, since every member has an
      // active Free row, so Premium families read as Free here.)
      const { data: sub } = await supabase
        .from("subscriptions")
        // Two foreign keys link subscriptions.plan_id to plans (fk_subscriptions_plan and
        // subscriptions_plan_id_fkey), so a bare plans(name) is ambiguous (HTTP 300). Naming one
        // of them makes the embed work.
        .select("status, cancel_at_period_end, current_period_end, plans!subscriptions_plan_id_fkey(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      const planName = (sub?.plans as { name?: string } | null)?.name;
      setPremium(
        planName === 'Premium' &&
          sub?.status === 'active' &&
          sub?.cancel_at_period_end === false &&
          (!sub?.current_period_end || new Date(sub.current_period_end) > new Date())
      );
    };

    fetchPlan();
  }, []);

  // ---------------------------------------------------------
  // 🔥 FINAL WORKING VERSION, uses supabase.functions.invoke
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: { name, email, message },
        }
      );

      if (error) {
        setStatus("error");
      } else {
        // No notification row here: the table has no title or content column (the insert was
        // refused), and the bell has no words for a support request. The confirmation email
        // and the message below are the receipt.
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      setStatus("error");
    }

    setLoading(false);
  };
  // ---------------------------------------------------------

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        {/* PAGE HEADER */}
        <PageHeader
          eyebrow="Support"
          eyebrowDot="var(--c1)"
          title={
            <>
              Need help with <Accent>Ancestorii</Accent>?
            </>
          }
          lead={
            <>
              We’re here to support your journey as you preserve your family&apos;s
              story. Browse the FAQs below or reach out to us directly.
            </>
          }
        />

        {/* FAQ */}
        <section className={ui.section} aria-labelledby="help-faq-title">
          <SectionHead
            id="help-faq-title"
            title={
              <>
                Frequently Asked <Accent>Questions</Accent>
              </>
            }
          />

          <div className={s.faq}>
            <FAQItem
              index={0}
              title="Billing & Subscriptions"
              content={[
                // Upgrading is self-serve; changing or cancelling goes through us (the Plans dialog says so).
                "You can upgrade any time in the Plans section. To change or cancel your subscription, email us or use the contact form on this page.",
                "Your subscription stays active until the end of the billing cycle when cancelled.",
                "If a payment fails, we retry and notify you before any limits apply.",
              ]}
            />
            <FAQItem
              index={1}
              title="Storage Limits"
              content={[
                "All uploaded photos, videos, audio and documents count towards your storage.",
                "You can check your current usage in the sidebar or inside the Plans section.",
                "If you reach the limit, you must free space or upgrade to continue uploading.",
              ]}
            />
            <FAQItem
              index={2}
              title="Creating Timelines"
              content={[
                "Create a timeline using the Create New Timeline button in the Timelines section.",
                "Timelines help organise key life events and milestones.",
                "Plan limits determine how many timelines you can create.",
              ]}
            />
            <FAQItem
              index={3}
              title="Albums & Capsules"
              content={[
                "Albums are ideal for grouping photos and videos.",
                "Capsules are time-locked memories or future messages.",
                "More sharing and permission features are coming soon.",
              ]}
            />
            <FAQItem
              index={4}
              title="Account & Login"
              content={[
                "Use the Forgot Password link if you can't access your account.",
                "You can update your details in My Profile and your password in Settings.",
                "Always use a strong unique password for security.",
              ]}
            />
          </div>
        </section>

        {/* CONTACT + PHONE SIDE-BY-SIDE */}
        <section className={cx(ui.section, s.contact)} aria-label="Contact">
          <div className={s.contactGrid}>
            {/* CONTACT BOX */}
            <div className={cx(ui.card, s.card)}>
              <IconTile Icon={Mail} tone={toneByKey('blue')} />
              <h2 className={s.cardTitle}>Contact Us</h2>

              <p className={s.cardText}>
                Fill in the form below and we&apos;ll get back to you within{" "}
                <strong>24 hours</strong>.
              </p>

              <form onSubmit={handleSubmit} className={s.form}>
                {/* Name */}
                <div className={ui.field}>
                  <label htmlFor={nameId} className={ui.label}>
                    Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={ui.input}
                  />
                </div>

                {/* Email */}
                <div className={ui.field}>
                  <label htmlFor={emailId} className={ui.label}>
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={ui.input}
                  />
                </div>

                {/* Message */}
                <div className={ui.field}>
                  <label htmlFor={messageId} className={ui.label}>
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id={messageId}
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={cx(ui.textarea, 'resize-none')}
                  />
                </div>

                {/* Status */}
                {status === "success" && (
                  <p className={cx(ui.notice, s.status)} role="status">Message sent.</p>
                )}
                {status === "error" && (
                  <p className={cx(ui.noticeError, s.status)} role="alert">
                    Something went wrong, please try again.
                  </p>
                )}

                <Btn
                  type="submit"
                  disabled={loading}
                  className={s.submit}
                  tile={
                    loading ? (
                      <Spinner size={16} />
                    ) : (
                      <Send size={17} strokeWidth={2.4} />
                    )
                  }
                >
                  {loading ? "Sending…" : "Send message"}
                </Btn>
              </form>
            </div>

            {/* PHONE SUPPORT BOX */}
            <div className={cx(ui.card, s.card)}>
              <IconTile Icon={Phone} tone={toneByKey('pink')} />
              <h2 className={s.cardTitle}>Prefer to speak to us?</h2>

              {premium !== null ? (
                premium ? (
                  <>
                    <p className={s.cardText}>
                      Priority phone support for Premium members:
                    </p>

                    <a href="tel:+443301332268" className={cx(ui.textLink, s.phone)}>
                      0330 133 2268
                    </a>

                    <p className={s.cardText}>
                      Available <strong>9:00am to 6:00pm</strong>, Monday to Saturday.
                    </p>

                    <p className={s.cardText}>
                      Or email us at{" "}
                      <a href="mailto:support@ancestorii.com" className={cx(ui.textLink, s.email)}>
                        support@ancestorii.com
                      </a>
                    </p>
                  </>
                ) : (
                  <>
                    <p className={cx(s.cardText, s.cardTextStrong)}>
                      Upgrade to access priority phone support.
                    </p>

                    <p className={s.cardText}>
                      Email support is always available at{" "}
                      <a href="mailto:support@ancestorii.com" className={cx(ui.textLink, s.email)}>
                        support@ancestorii.com
                      </a>
                    </p>
                  </>
                )
              ) : (
                <p className={s.checking}>
                  <Spinner size={16} />
                  Checking your plan…
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type FAQItemProps = {
  index: number;
  title: string;
  content: string[];
};

function FAQItem({ index, title, content }: FAQItemProps) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div
      className={s.faqItem}
      data-open={open ? 'true' : 'false'}
      style={{ '--dot': tone(index).bg } as CSSProperties}
    >
      <h3 className={s.faqHeading}>
        <button
          id={buttonId}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className={s.faqQ}
        >
          <span>{title}</span>
          <span className={s.faqIcon} aria-hidden="true">
            <Plus size={18} strokeWidth={2.8} />
          </span>
        </button>
      </h3>

      {open && (
        <div id={panelId} role="region" aria-labelledby={buttonId} className={s.faqA}>
          <ul className={s.faqList}>
            {content.map((item, i) => (
              <li key={i} className={s.faqLine}>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

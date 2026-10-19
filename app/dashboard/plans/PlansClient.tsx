'use client';

import { useId, type CSSProperties } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  IconBtn,
  PageHeader,
  Spinner,
  Tag,
  btnClass,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './plans.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type PlanName = 'Free' | 'Premium';
type Currency = 'GBP' | 'USD' | 'EUR';

type Plan = {
  id: string;
  name: PlanName;
  max_storage: number;
};

type SubscriptionRow = {
  user_id: string;
  plan_id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
};

type UsageRow = {
  used_bytes: number;
};

// The dots before Premium's lines: pink, aqua and orange (they read on the ink card).
const LINE_DOTS = ['var(--c0)', 'var(--c3)', 'var(--c2)'];

export default function PlansClient({
  loading,
  currency,
  setCurrency,
  currentPlan,
  subscription,
  usage,
  usageLoading,
  freePlanStorage,
  showPlanChangeInfo,
  setShowPlanChangeInfo,
  formatBytes,
  formatDate,
  handleUpgrade,
  upgrading,
  price,
}: {
  loading: boolean;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currentPlan: Plan | null;
  subscription: SubscriptionRow | null;
  usage: UsageRow | null;
  usageLoading: boolean;
  freePlanStorage: number;
  showPlanChangeInfo: boolean;
  setShowPlanChangeInfo: (value: boolean) => void;
  formatBytes: (bytes?: number | null) => string;
  formatDate: (iso: string | null | undefined) => string;
  handleUpgrade: (planName: PlanName) => void;
  upgrading: boolean;
  price: Record<Currency, string>;
}) {
  const isPremium = currentPlan?.name === 'Premium';
  const usedBytes = usage?.used_bytes ?? 0;
  const maxBytes = currentPlan?.max_storage ?? freePlanStorage;
  const pct = maxBytes > 0 ? Math.min(100, (usedBytes / maxBytes) * 100) : 0;
  const lowOnSpace = !isPremium && pct >= 80;

  // "Managing your subscription": Escape closes it, Tab stays inside, focus goes back to the button.
  const closePlanChangeInfo = () => setShowPlanChangeInfo(false);
  const infoRef = useDialog<HTMLDivElement>(showPlanChangeInfo, closePlanChangeInfo);
  const infoTitleId = useId();
  const infoTextId = useId();
  const currentTitleId = useId();
  const premiumTitleId = useId();

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        {/* ── Heading ── */}
        <PageHeader
          eyebrow="Your account"
          eyebrowDot="var(--c1)"
          title={
            <>
              Your <Accent>plan</Accent>
            </>
          }
          lead="One account across the app and the website. Every plan is per family, not per person, so one payment covers your whole family."
        />

        {loading ? (
          <AppLoader label="Loading your plan" />
        ) : (
          <div className={cx(ui.section, s.plans)}>
            {/* ── Current plan + storage ── */}
            <section className={cx(ui.card, s.current)} aria-labelledby={currentTitleId}>
              <div className={s.currentHead}>
                <div className={s.currentTop}>
                  <Tag dot="var(--c1)">Current plan</Tag>
                  <span
                    className={cx(ui.chip, isPremium ? cx(ui.chipColor, s.chipPremium) : ui.chipInk)}
                  >
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
                <h2 id={currentTitleId} className={s.currentTitle}>
                  {isPremium ? 'You’re on Premium' : 'You’re on Free'}
                </h2>
                {isPremium && subscription?.current_period_end && (
                  <p className={s.renews}>Renews on {formatDate(subscription.current_period_end)}</p>
                )}
              </div>

              {/* Storage */}
              <div className={s.storage}>
                <div className={s.storageHead}>
                  <Tag dot="var(--c2)">Family storage</Tag>
                  <span className={s.storageValue}>
                    {usageLoading ? (
                      <Spinner size={16} label="Loading storage" />
                    ) : (
                      <>
                        {formatBytes(usedBytes)} of {formatBytes(maxBytes)} used
                      </>
                    )}
                  </span>
                </div>

                <StorageBar pct={pct} lowOnSpace={lowOnSpace} />

                {lowOnSpace && (
                  <p className={cx(pct >= 95 ? ui.noticeError : ui.noticeWarn, s.lowNotice)}>
                    Your family is running low on space.
                  </p>
                )}

                <p className={s.storageNote}>
                  Shared across everyone in your family. Photos, videos and voice notes all count towards this.
                </p>
              </div>
            </section>

            {/* ── FREE: upgrade is the hero (the page's one ink card) ── */}
            {!isPremium && (
              <section className={cx(ui.inkCard, s.premium)} aria-labelledby={premiumTitleId}>
                <span className={ui.dotPink} aria-hidden="true" />
                <span className={ui.dotBlue} aria-hidden="true" />

                <div className={s.premiumInner}>
                  <div className={s.premiumHead}>
                    <Tag dot="var(--c3)">Upgrade</Tag>
                    <h2 id={premiumTitleId} className={s.premiumTitle}>
                      Upgrade to <Accent>Premium</Accent>
                    </h2>

                    <ul className={s.lines}>
                      {[
                        '100GB of storage for your whole family',
                        'Longer videos, up to 15 minutes',
                        '10% off every keepsake order',
                      ].map((line, i) => (
                        <li
                          key={line}
                          className={s.line}
                          style={{ '--dot': LINE_DOTS[i % LINE_DOTS.length] } as CSSProperties}
                        >
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={s.buy}>
                    {/* Price */}
                    <div className={s.price}>
                      <span className={s.priceBig}>
                        {currency === 'GBP' && '£3.99'}
                        {currency === 'USD' && '$5.99'}
                        {currency === 'EUR' && '€4.99'}
                      </span>
                      <span className={s.priceUnit}>/ month</span>
                    </div>
                    <p className={s.priceNote}>Per family, not per person. One payment covers everyone.</p>

                    {/* Currency */}
                    <div className={cx(ui.tabs, ui.tabsBlock, s.tabs)} role="group" aria-label="Currency">
                      {(['GBP', 'USD', 'EUR'] as Currency[]).map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => setCurrency(cur)}
                          aria-pressed={currency === cur}
                          className={ui.tab}
                        >
                          {cur === 'GBP' && '£ GBP'}
                          {cur === 'USD' && '$ USD'}
                          {cur === 'EUR' && '€ EUR'}
                        </button>
                      ))}
                    </div>

                    {/* CTA */}
                    <Btn
                      variant="light"
                      size="lg"
                      block
                      onClick={() => handleUpgrade('Premium')}
                      disabled={upgrading}
                      aria-busy={upgrading || undefined}
                      className={s.cta}
                    >
                      {upgrading ? (
                        <>
                          <Spinner size={18} />
                          <span className={ui.srOnly}>Opening secure checkout</span>
                        </>
                      ) : (
                        'Upgrade now'
                      )}
                    </Btn>
                    <p className={s.ctaNote}>Secure checkout. Cancel any time.</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── PREMIUM: manage only, no upgrade push (the page's one ink card) ── */}
            {isPremium && (
              <section className={cx(ui.inkCard, s.premium)} aria-labelledby={premiumTitleId}>
                <span className={ui.dotPink} aria-hidden="true" />
                <span className={ui.dotBlue} aria-hidden="true" />

                <div className={cx(s.premiumInner, s.premiumInnerManage)}>
                  <div className={s.premiumHead}>
                    <Tag dot="var(--c3)">Manage</Tag>
                    <h2 id={premiumTitleId} className={s.premiumTitle}>
                      You have everything <Accent>Premium</Accent> offers
                    </h2>
                    <p className={s.premiumText}>
                      100GB of family storage, longer videos, and 10% off every keepsake order. If you cancel, everything you have already created stays safe and accessible.
                    </p>
                  </div>

                  <Btn
                    variant="light"
                    onClick={() => setShowPlanChangeInfo(true)}
                    aria-haspopup="dialog"
                    className={s.manageBtn}
                  >
                    Manage or cancel
                  </Btn>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ── Manage / cancel dialog (reused): above the floating phone nav ── */}
      {showPlanChangeInfo && (
        <div
          className={cx(ui.scrim, ui.fadeIn, 'scrim-blur z-[9999] flex items-end justify-center sm:items-center sm:p-6')}
          onClick={closePlanChangeInfo}
        >
          <div
            ref={infoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={infoTitleId}
            aria-describedby={infoTextId}
            className={cx(ui.sheet, ui.sheetBottom, ui.popIn, s.dialog)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={ui.sheetHeader}>
              <h2 id={infoTitleId} className={ui.sheetTitle}>
                Managing your subscription
              </h2>
              <IconBtn label="Close" onClick={closePlanChangeInfo}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            <div className={ui.sheetBody}>
              <p id={infoTextId} className={s.dialogText}>
                To change or cancel your subscription, visit our Help page and send us an email or complete the contact form. Our team will take care of your request personally.
              </p>

              <p className={cx(ui.notice, s.dialogNotice)}>
                <ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" />
                <span>Your memories and data stay safe and accessible forever, even after a subscription ends.</span>
              </p>
            </div>

            <div className={ui.sheetFooter}>
              <Btn variant="soft" onClick={closePlanChangeInfo}>
                Close
              </Btn>
              <Link href="/dashboard/help" className={btnClass()}>
                Visit Help Centre
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StorageBar({ pct, lowOnSpace }: { pct: number; lowOnSpace: boolean }) {
  const width = pct > 0 ? Math.max(2, pct) : 0;
  const fill = lowOnSpace ? (pct >= 95 ? s.fillFull : s.fillLow) : undefined;

  return (
    <div
      className={cx(ui.progress, s.bar)}
      role="progressbar"
      aria-label="Family storage used"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div className={cx(ui.progressFill, fill)} style={{ width: `${width}%` }} />
    </div>
  );
}

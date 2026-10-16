import type { LucideIcon } from "lucide-react";
import {
  FileUp,
  HardDrive,
  Headset,
  Infinity as InfinityIcon,
  Percent,
  Sparkles,
  Video,
} from "lucide-react";
import StoreBadges from "@/components/StoreBadges";
import SiteShell from "@/components/site/SiteShell";
import { Accent, ArrowLink, Eyebrow, PageHero } from "@/components/site/SiteBits";
import landing from "@/components/landing/landing.module.css";
import site from "@/components/site/site.module.css";
import styles from "./success.module.css";

// Public post-upgrade success page. A completed Premium checkout lands here
// (create-checkout success_url points to /success). Most people arrive from the
// mobile app: tapped Manage plan, logged into the website, upgraded.
//
// Design intent: a warm reception, not a brochure, in the landing page's language
// (SiteShell: white ground, the four colours plus ink, Plus Jakarta Sans). The greeting
// is the hero, visible immediately on mobile, never pushed below an empty viewport.
//
// It shows NO price and NO buy or upgrade button, because whoever reaches it has
// already paid, so it stays a safe general page. The app door is the page's one ink
// card, so StoreBadges uses theme="dark" there: white Apple badge for full contrast.

const FEATURES = [
  "100GB storage for your whole family",
  "Longer videos, up to 15 minutes",
  "10GB max file size",
  "Unlimited albums, timelines and family profiles",
  "10% off every keepsake order",
  "Priority support",
  "Early access to new features",
];

// A symbol and colour for each feature above, in the same order (presentation only).
const FEATURE_LOOK: { Icon: LucideIcon; tone: "pink" | "blue" | "orange" | "aqua" }[] = [
  { Icon: HardDrive, tone: "blue" },
  { Icon: Video, tone: "pink" },
  { Icon: FileUp, tone: "aqua" },
  { Icon: InfinityIcon, tone: "orange" },
  { Icon: Percent, tone: "blue" },
  { Icon: Headset, tone: "pink" },
  { Icon: Sparkles, tone: "aqua" },
];

export default function SuccessPage() {
  return (
    <SiteShell>
      {/* ── The greeting · centred, on screen immediately ── */}
      <PageHero
        eyebrow={<>Premium confirmed</>}
        eyebrowDot="var(--c3)"
        title={
          <>
            Welcome to the <Accent>Premium</Accent> family.
          </>
        }
        lead={<>Your whole family is now on Premium. One payment covers everyone.</>}
      >
        <p className={styles.sent}>We have emailed your confirmation to your inbox.</p>
      </PageHero>

      {/* ── What your family now has ── */}
      <section className={site.section}>
        <div className={landing.wrap}>
          <p className={styles.kicker}>
            <Eyebrow dot="var(--c0)">Everything your family now has</Eyebrow>
          </p>

          <ul className={styles.features}>
            {FEATURES.map((f, i) => {
              const { Icon, tone } = FEATURE_LOOK[i % FEATURE_LOOK.length];
              return (
                <li key={f} className={i === 0 ? styles.featureLead : styles.feature}>
                  <span
                    className={`${i === 0 ? styles.leadTile : styles.tile} ${styles[tone]}`}
                    aria-hidden="true"
                  >
                    <Icon size={i === 0 ? 52 : 26} strokeWidth={2.5} />
                  </span>
                  <span className={i === 0 ? styles.leadText : styles.featureText}>{f}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── The way back · two doors, one room ── */}
      <section className={site.section}>
        <div className={`${landing.wrap} ${styles.doors}`}>
          <div className={`${site.card} ${styles.door}`}>
            <p className={`${site.tag} ${styles.dotPink}`}>On the website</p>
            <p className={styles.doorText}>
              Pick up right where you left off in your dashboard.
            </p>
            <div className={styles.doorAction}>
              <ArrowLink href="/dashboard/home" className={landing.btnShadow}>
                Back to the website
              </ArrowLink>
            </div>
          </div>

          <div className={`${site.inkCard} ${styles.door}`}>
            <p className={`${site.tag} ${styles.dotAqua}`}>In the app</p>
            <p className={styles.doorText}>
              Head back to the Ancestorii app to see your Premium plan. If it still shows Free,
              close the app fully and reopen it.
            </p>
            <div className={styles.doorAction}>
              {/* Ink card, so theme="dark": white Apple badge for full contrast. */}
              <StoreBadges theme="dark" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Priority support · the sign off ── */}
      <section className={site.section}>
        <div className={`${site.narrow} ${styles.support}`}>
          <p className={styles.kicker}>
            <Eyebrow dot="var(--c1)">Priority support</Eyebrow>
          </p>
          <p className={styles.supportText}>
            You are on Premium, so you get priority support. Email{" "}
            <a href="mailto:support@ancestorii.com" className={site.textLink}>
              support@ancestorii.com
            </a>{" "}
            or call{" "}
            <a href="tel:03301332268" className={`${site.textLink} ${styles.nowrap}`}>
              0330 133 2268
            </a>
            , 9am to 6pm Monday to Saturday.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}

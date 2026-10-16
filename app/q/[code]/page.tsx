import type { CSSProperties } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { APPSTORE_URL, PLAYSTORE_URL } from '@/lib/store-links';
import StoreBadges from '@/components/StoreBadges';
import SiteShell from '@/components/site/SiteShell';
import { Accent, PageHero } from '@/components/site/SiteBits';
import { CardStage } from '@/components/site/utility/CardRow';
import { QUESTION_SIDES } from '@/components/site/utility/familyCards';
import landing from '@/components/landing/landing.module.css';
import styles from '@/components/site/utility/handoff.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// /q/[code] — STORE REDIRECT ONLY.
//
// This route's single job is to bounce a visitor to the right app store. It NEVER
// renders a web answering interface — answering happens exclusively in the app.
//
// If the app IS installed, the OS intercepts https://ancestorii.com/q/CODE via the
// Universal Link / App Link verification files (/.well-known/apple-app-site-association
// and /.well-known/assetlinks.json) BEFORE the request reaches this server, opening the
// app directly. So this route only ever runs for people WITHOUT the app — exactly the
// people who need the store.
//
// Store links live in ONE place: src/lib/store-links.ts (@/lib/store-links). Fill the
// App Store id there at launch — this page and /m/[code] both import it.
// ─────────────────────────────────────────────────────────────────────────────

// Device detection runs per request; never cache the redirect.
export const dynamic = 'force-dynamic';

export default async function QStoreRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ua = (await headers()).get('user-agent') ?? '';

  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // Mobile without the app → straight to the store.
  if (isIOS) redirect(APPSTORE_URL);
  if (isAndroid) redirect(PLAYSTORE_URL);

  // Desktop / everything else → a store-oriented choice. Still never an answer flow:
  // Ancestorii is answered in the app, so we point them at the stores and show the code
  // to enter once installed.
  return (
    <SiteShell>
      <PageHero
        eyebrow={<>Ancestorii</>}
        title={
          <>
            You have a <Accent>question to answer</Accent>
          </>
        }
        lead={
          <>
            Ancestorii is answered in the app. Install it on your phone, then enter your code to
            find this question.
          </>
        }
      />

      <section className={styles.section}>
        <div className={landing.wrap}>
          <CardStage sides={QUESTION_SIDES}>
            <div className={`${styles.codeCard} ${styles.blue}`}>
              <p className={styles.codeLabel}>
                Your code
              </p>
              <p className={styles.code} style={{ '--chars': code.length } as CSSProperties}>
                {code}
              </p>
              <p className={styles.codeNote}>Valid for 7 days</p>
            </div>
          </CardStage>

          <StoreBadges theme="light" className={styles.badges} />
        </div>
      </section>
    </SiteShell>
  );
}

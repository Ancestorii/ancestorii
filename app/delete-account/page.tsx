import type { Metadata } from 'next';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';

export const metadata: Metadata = {
  title: 'Delete Your Account — Ancestorii',
  description:
    'How to delete your Ancestorii account and what happens to your data when you do.',
  alternates: {
    canonical: 'https://www.ancestorii.com/delete-account',
  },
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-mt-28" id={`section-${number}`}>
      <h2
        className="font-serif text-[clamp(1.25rem,2vw,1.5rem)] text-[#1A1612] mb-4"
        style={{ fontWeight: 600 }}
      >
        <span className="text-[#B8924A] mr-2">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4 text-[#4A4237] leading-[1.8] text-[15px]">
        {children}
      </div>
    </div>
  );
}

export default function DeleteAccountPage() {
  return (
    <>
      <PublicNav />

      <main className="min-h-screen" style={{ background: '#FDFAF5' }}>
        {/* ── Header band ── */}
        <div
          className="border-b"
          style={{ background: '#1A1612', borderColor: 'rgba(184,146,42,0.15)' }}
        >
          <div className="max-w-[820px] mx-auto px-6 py-[clamp(3rem,6vw,5rem)]">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: '#B8924A' }}
            >
              Account
            </p>
            <h1
              className="font-serif text-[clamp(2rem,4vw,3rem)] text-[#F5F1E6]"
              style={{ fontWeight: 700, lineHeight: 1.15 }}
            >
              Delete Your Account
            </h1>
            <p className="mt-4 text-[14px]" style={{ color: 'rgba(245,241,230,0.5)' }}>
              Last updated: 26 June 2026
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-[820px] mx-auto px-6 py-[clamp(2.5rem,5vw,4rem)]">
          <div className="space-y-12">
            {/* Intro */}
            <div className="text-[#4A4237] leading-[1.8] text-[15px] space-y-4">
              <p>
                This page explains how to delete your{' '}
                <strong className="text-[#1A1612]">Ancestorii</strong> account and
                what happens to your data when you do. The Ancestorii app is
                operated by{' '}
                <strong className="text-[#1A1612]">Ancestorii Ltd</strong>, the
                developer of the Ancestorii mobile app
                (<strong>com.ancestorii.app</strong>) and the website at
                ancestorii.com.
              </p>
              <p>
                Deleting your account is permanent. Once your account is deleted,
                you will be signed out, you will no longer be able to log back in,
                and your account and associated personal data will be removed.
              </p>
            </div>

            {/* 1 */}
            <Section number="1" title="How to delete your account">
              <p>
                You can delete your account and all associated personal data at any
                time directly in the Ancestorii app:
              </p>
              <p>
                <strong className="text-[#1A1612]">1.</strong> Open the Ancestorii
                app on your device.
                <br />
                <strong className="text-[#1A1612]">2.</strong> Go to{' '}
                <strong className="text-[#1A1612]">Settings</strong>.
                <br />
                <strong className="text-[#1A1612]">3.</strong> Tap{' '}
                <strong className="text-[#1A1612]">Delete Account</strong>.
                <br />
                <strong className="text-[#1A1612]">4.</strong> Confirm when
                prompted.
              </p>
              <p>
                Confirming will{' '}
                <strong className="text-[#1A1612]">
                  permanently delete your account
                </strong>{' '}
                and the personal data associated with it. This action cannot be
                undone.
              </p>
            </Section>

            {/* 2 */}
            <Section number="2" title="If you can’t access the app">
              <p>
                If you are unable to access the app, you can still request deletion.
                Email us at{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>{' '}
                from the email address registered to your Ancestorii account, and
                ask us to delete your account. We will verify your request and
                action the deletion on your behalf.
              </p>
            </Section>

            {/* 3 */}
            <Section number="3" title="What data is deleted">
              <p>
                When your account is deleted, the following data is permanently
                removed from our systems:
              </p>
              <p>
                <strong className="text-[#1A1612]">Profile information</strong>{' '}
                including your name and email address; all of your{' '}
                <strong className="text-[#1A1612]">memories and stories</strong>;
                your{' '}
                <strong className="text-[#1A1612]">
                  uploaded photos, videos and voice notes
                </strong>
                ; your{' '}
                <strong className="text-[#1A1612]">comments and reactions</strong>;
                your{' '}
                <strong className="text-[#1A1612]">family membership data</strong>;
                and any other{' '}
                <strong className="text-[#1A1612]">
                  associated account records
                </strong>{' '}
                we hold about you.
              </p>
            </Section>

            {/* 4 */}
            <Section number="4" title="What data is kept and for how long">
              <p>
                Certain records may be retained where we are legally required to do
                so. For example, transaction and payment records may be kept to meet
                our accounting and tax obligations. These records are retained for up
                to the period required by UK law, after which they are deleted.
              </p>
              <p>
                We may also retain anonymised or aggregated data, which can no longer
                be used to identify you, for the purpose of understanding and
                improving the Service.
              </p>
            </Section>

            {/* 5 */}
            <Section number="5" title="How quickly deletion happens">
              <p>
                Deletion requests are actioned promptly. Once a request is made, your
                account and associated personal data are removed from our systems,
                subject only to the limited records described in the section above
                that we are legally required to retain.
              </p>
            </Section>
          </div>

          {/* ── End mark ── */}
          <div className="mt-16 pt-8 border-t border-[#E8E0D0]">
            <p className="text-[13px] text-[#A09888] leading-relaxed">
              Questions about deleting your account? Contact us at{' '}
              <a
                href="mailto:support@ancestorii.com"
                className="text-[#B8924A] font-semibold hover:underline"
              >
                support@ancestorii.com
              </a>
              . This page was last reviewed and updated on 26 June 2026.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

import type { Metadata } from 'next';
import { CircleCheck, CircleUserRound, Smartphone, Trash2 } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, PageHero } from '@/components/site/SiteBits';
import {
  LegalBody,
  LegalContactCard,
  LegalIntro,
  LegalSection as Section,
  LegalSteps,
  legalStyles,
} from '@/components/site/legal/LegalBits';

export const metadata: Metadata = {
  title: 'Delete Your Account',
  description:
    'How to delete your Ancestorii account and what happens to your data when you do.',
  alternates: {
    canonical: 'https://www.ancestorii.com/delete-account',
  },
};

export default function DeleteAccountPage() {
  return (
    <SiteShell>
      <PageHero
        align="left"
        eyebrow="Account"
        title={
          <>
            Delete Your <Accent>Account</Accent>
          </>
        }
        lead={<>Last updated: 16 October 2026</>}
      />

      {/* ── Body ── */}
      <LegalBody
        aside={
          // ── End mark: beside the text on wide screens, under it on smaller ones ──
          <LegalContactCard>
            <p className={legalStyles.contactTitle}>
              Questions about deleting your account?
            </p>
            <p className={legalStyles.contactText}>
              Contact us at{' '}
              <a href="mailto:support@ancestorii.com">
                support@ancestorii.com
              </a>
              .
            </p>
            <p className={legalStyles.contactNote}>
              This page was last reviewed and updated on 26 June 2026.
            </p>
          </LegalContactCard>
        }
      >
        {/* Intro */}
        <LegalIntro lead>
          <p>
            This page explains how to delete your{' '}
            <strong>Ancestorii</strong> account and
            what happens to your data when you do. The Ancestorii app is
            operated by{' '}
            <strong>Ancestorii Ltd</strong>, the
            developer of the Ancestorii mobile app
            (<strong>com.ancestorii.app</strong>) and the website at
            ancestorii.com.
          </p>
          <p>
            Deleting your account is permanent. Once your account is deleted,
            you will be signed out, you will no longer be able to log back in,
            and your account and associated personal data will be removed.
          </p>
        </LegalIntro>

        {/* 1 */}
        <Section number="1" title="How to delete your account">
          <p>
            You can delete your account and all associated personal data at any
            time directly in the Ancestorii app:
          </p>
          <LegalSteps
            steps={[
              {
                Icon: Smartphone,
                text: <>Open the Ancestorii app on your device.</>,
              },
              {
                Icon: CircleUserRound,
                text: (
                  <>
                    Go to your <strong>Profile</strong>.
                  </>
                ),
              },
              {
                Icon: Trash2,
                text: (
                  <>
                    Tap <strong>Delete Account</strong>.
                  </>
                ),
              },
              {
                Icon: CircleCheck,
                text: <>Confirm when prompted.</>,
              },
            ]}
          />
          <p>
            Confirming will{' '}
            <strong>
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
            <a href="mailto:support@ancestorii.com">
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
            <strong>Profile information</strong>{' '}
            including your name and email address; all of your{' '}
            <strong>memories and stories</strong>;
            your{' '}
            <strong>
              uploaded photos, videos and voice notes
            </strong>
            ; your{' '}
            <strong>comments and reactions</strong>;
            your{' '}
            <strong>family membership data</strong>;
            and any other{' '}
            <strong>
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
      </LegalBody>
    </SiteShell>
  );
}

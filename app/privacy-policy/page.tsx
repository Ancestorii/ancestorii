import type { Metadata } from 'next';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy – Ancestorii',
  description:
    'How Ancestorii collects, uses, stores, and protects your personal data across the website and the mobile app.',
  alternates: {
    canonical: 'https://www.ancestorii.com/privacy-policy',
  },
};

function PartBanner({
  letter,
  label,
  children,
}: {
  letter: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-mt-28 pt-2">
      <div
        className="rounded-lg px-6 py-6 border"
        style={{ background: '#1A1612', borderColor: 'rgba(184,146,42,0.25)' }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-2"
          style={{ color: '#B8924A' }}
        >
          Part {letter}
        </p>
        <h2
          className="font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] text-[#F5F1E6]"
          style={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {label}
        </h2>
        <p className="mt-3 text-[14px]" style={{ color: 'rgba(245,241,230,0.6)' }}>
          {children}
        </p>
      </div>
    </div>
  );
}

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

export default function PrivacyPolicyPage() {
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
              Legal
            </p>
            <h1
              className="font-serif text-[clamp(2rem,4vw,3rem)] text-[#F5F1E6]"
              style={{ fontWeight: 700, lineHeight: 1.15 }}
            >
              Privacy Policy
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
                At <strong className="text-[#1A1612]">Ancestorii</strong>, your
                privacy is fundamental to our mission. We exist to help you
                preserve life stories, memories, and personal moments — and we
                treat that responsibility with the highest level of care.
              </p>
              <p>
                This Privacy Policy explains how Ancestorii Ltd
                (&quot;Ancestorii&quot;, &quot;we&quot;, &quot;us&quot;, or
                &quot;our&quot;) collects, uses, stores, shares, and protects your
                personal information when you use the Ancestorii platform. This
                covers both the website at <strong>ancestorii.com</strong> and the
                Ancestorii mobile app for iOS and Android
                (<strong>com.ancestorii.app</strong>), together with all related
                services including the Our Stories public feed, My Family private
                library, My Heirlooms physical products, and AI-assisted writing
                tools (collectively, the &quot;Service&quot;).
              </p>
              <p>
                <strong className="text-[#1A1612]">How this policy is organised.</strong>{' '}
                Because some features exist only on the website and others only in
                the mobile app, this policy is divided into three parts.{' '}
                <strong className="text-[#1A1612]">Part A</strong> applies to both
                the website and the app.{' '}
                <strong className="text-[#1A1612]">Part B</strong> applies to the
                website only. <strong className="text-[#1A1612]">Part C</strong>{' '}
                applies to the mobile app only. Where a feature appears on both, it
                is described once in Part A.
              </p>
              <p>
                Ancestorii Ltd is the data controller for the purposes of UK GDPR
                and the Data Protection Act 2018, and is registered with the
                Information Commissioner&apos;s Office under registration reference
                ZC149600. Our contact address for all data-related enquiries is{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>
                .
              </p>
            </div>

            {/* ───────────────────────── PART A ───────────────────────── */}
            <PartBanner letter="A" label="Applies to the website and the app">
              This part covers the data we handle for every Ancestorii account, on
              whichever platform you use it.
            </PartBanner>

            {/* 1 */}
            <Section number="1" title="Information We Collect">
              <p>
                We collect only the information necessary to operate, maintain,
                and improve the Service. The categories of data we collect across
                both the website and the app are as follows:
              </p>

              <p>
                <strong className="text-[#1A1612]">Account information:</strong>{' '}
                your full name, family name, email address, and authentication
                credentials (a password, or — on the website — a supported
                third-party sign-in such as Google, from which we receive your
                name, email address, and profile photo). At signup we may also
                record a promotional code and a newsletter opt-in preference, and
                we store your account creation date. You may optionally provide a
                phone number, date of birth, biography, title, location, and a
                profile photograph.
              </p>

              <p>
                <strong className="text-[#1A1612]">Family information:</strong>{' '}
                the name of your family space, the names and roles of family
                members you invite, and family membership details. When you
                create profiles for loved ones, you may provide their names,
                dates of birth, dates of passing, biographical details,
                relationship descriptions, and photographs.
              </p>

              <p>
                <strong className="text-[#1A1612]">Content you upload:</strong>{' '}
                photographs, videos, audio recordings (including voice notes and
                voice comments), written memories, comments, reactions, captions,
                timeline events, album descriptions, and any other media or text
                you choose to store on the platform. This may include associated
                metadata such as file names, file sizes, and image dimensions.
                Content may be stored in your private family library (My Family) or
                published to the public feed (Our Stories).
              </p>

              <p>
                <strong className="text-[#1A1612]">Subscription status:</strong>{' '}
                we record whether your account is on the Free or Premium plan so we
                can apply the correct storage limits and features. Payments
                themselves are taken on the website (see Part B); no payment card
                data is collected in the mobile app.
              </p>

              <p>
                <strong className="text-[#1A1612]">Email validation data:</strong>{' '}
                at the point of registration, your email address may be checked
                against a third-party email verification service to confirm
                deliverability and reduce fraud. This check returns a validation
                result only — no other personal content is shared. This applies to
                sign-ups on both the website and the app.
              </p>

              <p>
                <strong className="text-[#1A1612]">Technical and usage data:</strong>{' '}
                limited technical data such as device type, operating system, IP
                address, and request information is processed by our infrastructure
                providers as part of serving the Service securely. On the website
                this may also include browser type, pages visited, and session
                duration, used in aggregate to improve the Service. The mobile app
                does not contain analytics, advertising, or tracking software (see
                Section 23).
              </p>
            </Section>

            {/* 2 */}
            <Section number="2" title="How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>

              <p>
                To create, authenticate, and manage your account and family space.
                To store, organise, display, and protect your uploaded memories
                and content within your private family library. To display
                stories, likes, comments, and shares on the Our Stories public
                feed where you have chosen to publish content. To review content
                submitted to the Our Stories public feed against our community
                standards before publication. To enforce our community standards
                and three-strike policy, including issuing warnings, suspensions,
                and bans from the public feed. To process reports submitted by
                users about content on the public feed. To process physical
                product orders through My Heirlooms, generate print-ready files,
                and coordinate fulfilment and delivery. To provide AI-assisted
                writing suggestions when you opt to use the Story Assistance
                feature. To send transactional communications including welcome
                emails, onboarding guidance, order confirmations, family
                invitation notifications, family activity alerts, community
                standards notifications, strike warnings, and account security
                alerts. To deliver push notifications about family activity to
                your device where you use the mobile app and have granted
                permission. To validate email addresses at registration to ensure
                deliverability of essential communications. To provide customer
                support and respond to enquiries. To maintain the security,
                integrity, and performance of the platform. To detect and prevent
                fraud, abuse, and violations of our Terms. To improve the Service
                based on anonymised and aggregated usage insights.
              </p>
            </Section>

            {/* 3 */}
            <Section number="3" title="Legal Basis for Processing (UK GDPR)">
              <p>
                We process your personal data under the following legal bases as
                defined by the UK General Data Protection Regulation:
              </p>

              <p>
                <strong className="text-[#1A1612]">Performance of a contract:</strong>{' '}
                processing necessary to provide the Service you have signed up
                for, including account management, content storage, public feed
                functionality, order fulfilment, and delivery of physical
                products.
              </p>

              <p>
                <strong className="text-[#1A1612]">Consent:</strong> where you
                have given explicit consent, such as opting in to the AI Story
                Assistance feature, granting device permissions in the mobile app,
                or providing optional profile information. You may withdraw consent
                at any time through your account settings, your device settings, or
                by contacting us.
              </p>

              <p>
                <strong className="text-[#1A1612]">Legitimate interests:</strong>{' '}
                processing necessary for our legitimate business interests,
                including platform security, fraud prevention, content moderation
                and review of the public feed, enforcement of community standards,
                service improvement, and sending non-marketing service
                communications. We balance these interests against your rights and
                freedoms.
              </p>

              <p>
                <strong className="text-[#1A1612]">Legal obligation:</strong>{' '}
                processing required to comply with applicable laws, regulations,
                or legal processes.
              </p>
            </Section>

            {/* 4 */}
            <Section number="4" title="My Family — Private Library Data">
              <p>
                Content stored within My Family is treated as private data.
                This includes timelines, albums, stories, voice recordings,
                family member profiles, and all associated media, whether added
                from the website or the app.
              </p>
              <p>
                <strong className="text-[#1A1612]">Privacy guarantee.</strong>{' '}
                Content within My Family is never displayed on the Our Stories
                public feed unless you explicitly choose to publish it. Private
                content is never included in search results, surfaced in
                recommendations, shared with other users outside your family
                space, or used for any purpose other than providing the Service to
                you and your invited family members.
              </p>
              <p>
                <strong className="text-[#1A1612]">Family member access.</strong>{' '}
                All content within a family space is visible to every invited
                member of that space. This includes content uploaded by any family
                member. Within a family, members can see each other&apos;s name,
                avatar, email address, biography, role, and contribution counts.
                By inviting someone to your family space, you acknowledge that they
                will have access to all content within it.
              </p>
              <p>
                <strong className="text-[#1A1612]">No moderation of private content.</strong>{' '}
                Ancestorii does not monitor, review, or moderate content within
                private family spaces unless a violation of our Terms is reported
                by a member of that family space.
              </p>
              <p>
                <strong className="text-[#1A1612]">Community standards enforcement does not affect private data.</strong>{' '}
                Strikes, suspensions, and bans under our three-strike policy apply
                exclusively to the Our Stories public feed. A user&apos;s private
                family library, including all timelines, albums, stories, voice
                recordings, and the ability to order physical products, is never
                affected by public feed enforcement actions.
              </p>
              <p>
                <strong className="text-[#1A1612]">Media access.</strong>{' '}
                Uploaded media is held in private storage and served to authorised
                family members through short-lived, signed links. Media is not
                publicly addressable.
              </p>
            </Section>

            {/* 5 */}
            <Section number="5" title="Family Collaboration &amp; Shared Data">
              <p>
                When you create or join a family space, all content within that
                space is visible to every member. This means photographs, voice
                notes, timelines, albums, and other memories uploaded by any
                family member are accessible to all members of the same family.
              </p>
              <p>
                Family invitations include a unique, time-limited code or token.
                Where an invitation is sent by email, the recipient&apos;s email
                address is used solely to deliver the invitation. Invitation codes
                and links expire after a set period, after which they can no longer
                be used to join the family.
              </p>
              <p>
                If you leave or are removed from a family space, your access to
                that family&apos;s shared content is revoked immediately. Content
                you uploaded to the shared space may be removed in accordance with
                our deletion policies.
              </p>
            </Section>

            {/* 6 */}
            <Section number="6" title="Third-Party Services We Share Data With">
              <p>
                Ancestorii does <strong className="text-[#1A1612]">not</strong>{' '}
                sell, rent, or trade your personal data to any third party.
              </p>
              <p>
                We share limited data with trusted third-party service providers
                strictly as necessary to operate the Service. The providers below
                are used on both the website and the app. Website-only and
                app-only providers are listed in Part B and Part C respectively.
                Each provider processes data only for the specific purpose
                described and is subject to contractual obligations to protect your
                information:
              </p>

              <p>
                <strong className="text-[#1A1612]">Authentication, database &amp; storage:</strong>{' '}
                we use Supabase to manage user authentication, database storage,
                and file storage. Your account data, content, and uploaded media
                are stored on Supabase&apos;s infrastructure. The mobile app
                communicates with Supabase directly; there is no separate
                Ancestorii app server.
              </p>

              <p>
                <strong className="text-[#1A1612]">Email delivery:</strong>{' '}
                transactional emails (welcome messages, family invitations,
                member-joined notifications, onboarding guidance, order
                confirmations, community standards notifications, strike warnings,
                and activity notifications) are sent via Resend from
                support@ancestorii.com. Resend receives your email address and name
                for the purpose of delivering these communications.
              </p>

              <p>
                <strong className="text-[#1A1612]">Email validation:</strong>{' '}
                at registration, your email address may be checked by Kickbox to
                confirm it is deliverable and to suggest corrections for typos.
                Only the email address is shared — no other personal data.
              </p>

              <p>
                <strong className="text-[#1A1612]">Voice-note conversion:</strong>{' '}
                when you record or upload a voice note or voice comment, the audio
                may be sent to CloudConvert to convert it into a standard playback
                format. The audio is processed solely to produce the converted file
                and is not retained beyond what is necessary to complete the
                conversion.
              </p>

              <p>
                We may also disclose personal data if required to do so by law, in
                response to a valid legal request, or to protect the rights,
                safety, or property of Ancestorii, our users, or the public.
              </p>
            </Section>

            {/* 7 */}
            <Section number="7" title="Data Storage &amp; Security">
              <p>
                Your data is stored using secure, industry-standard cloud
                infrastructure with encryption in transit and at rest. We apply
                technical and organisational measures to protect against
                unauthorised access, alteration, disclosure, or destruction of
                your personal data.
              </p>
              <p>
                These measures include row-level security policies on our
                database ensuring users can only access data belonging to their
                own family space, secure authentication with support for
                third-party OAuth providers, HTTPS encryption across all
                connections, separation of public feed data and private family
                data at the database level, delivery of private media through
                short-lived signed links, and restricted access to production
                systems.
              </p>
              <p>
                Content within My Family is stored with row-level security
                policies that prevent any user outside the family space from
                accessing it, including Ancestorii staff except where required for
                technical support or legal compliance.
              </p>
              <p>
                While no system can guarantee absolute security, Ancestorii is
                designed with privacy-first principles and follows modern security
                practices. If we become aware of a data breach that affects your
                personal data, we will notify you and the relevant supervisory
                authority in accordance with our legal obligations.
              </p>
            </Section>

            {/* 8 */}
            <Section number="8" title="International Data Transfers">
              <p>
                Some of our third-party service providers are based outside the
                United Kingdom. Where personal data is transferred internationally,
                we ensure appropriate safeguards are in place, such as Standard
                Contractual Clauses approved by the UK Information
                Commissioner&apos;s Office, adequacy decisions, or equivalent
                protections as required by UK data protection law.
              </p>
            </Section>

            {/* 9 */}
            <Section number="9" title="Your Rights Under UK GDPR">
              <p>
                Under the UK General Data Protection Regulation, you have the
                following rights in relation to your personal data:
              </p>

              <p>
                <strong className="text-[#1A1612]">Right of access:</strong> you
                may request a copy of the personal data we hold about you,
                including any strike records, content review outcomes, and
                interaction data from Our Stories.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to rectification:</strong>{' '}
                you may request correction of any inaccurate or incomplete
                personal data. You can also update most information directly
                through your account settings.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to erasure (&quot;right to be forgotten&quot;):</strong>{' '}
                you may request deletion of your personal data. You can delete
                your account at any time, which will permanently remove your
                personal data, uploaded content, published stories on Our Stories,
                and all associated interactions in accordance with our retention
                policy.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to restrict processing:</strong>{' '}
                you may request that we limit how we process your data in certain
                circumstances, such as while a dispute about accuracy is being
                resolved.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to data portability:</strong>{' '}
                where technically feasible, you may request a copy of your data in
                a structured, commonly used, machine-readable format.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to object:</strong> you
                may object to processing based on legitimate interests, including
                content moderation. We will cease processing unless we can
                demonstrate compelling legitimate grounds.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to withdraw consent:</strong>{' '}
                where processing is based on consent (such as AI Story
                Assistance or device permissions), you may withdraw that consent at
                any time through your account settings or your device settings.
                Withdrawal does not affect the lawfulness of processing carried out
                before withdrawal.
              </p>

              <p>
                To exercise any of these rights, please contact us at{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>
                . We will respond to your request within one month, as required by
                law. If your request is complex, we may extend this period by up
                to two additional months, in which case we will inform you of the
                extension and the reasons for it.
              </p>

              <p>
                If you are unsatisfied with our response, you have the right to
                lodge a complaint with the UK Information Commissioner&apos;s
                Office (ICO) at{' '}
                <a
                  href="https://ico.org.uk"
                  className="text-[#B8924A] font-semibold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ico.org.uk
                </a>
                .
              </p>
            </Section>

            {/* 10 */}
            <Section number="10" title="Data Retention">
              <p>
                Your personal data and uploaded content are retained for as long
                as your account remains active. We retain data to provide you with
                continuous access to your memories, family library, and published
                stories.
              </p>
              <p>
                Upon account deletion, your personal data, profile information,
                uploaded content, published stories on Our Stories (and all
                associated likes, comments, and shares), and private family
                library content will be permanently removed from our systems
                within 30 days. Content you uploaded to a shared family space will
                also be removed.
              </p>
              <p>
                Strike records are retained for the lifetime of the account. Upon
                account deletion, strike records are permanently removed alongside
                all other personal data.
              </p>
              <p>
                Short-lived records such as family invitation codes, question
                links, and memory-share links expire automatically after their set
                validity period and are no longer usable thereafter. Device push
                tokens are deleted when you sign out of the mobile app.
              </p>
              <p>
                Order records (including shipping addresses and transaction
                details) are retained for up to six years after the date of the
                transaction, in accordance with UK tax and accounting
                requirements. Certain data may be retained for a longer period
                where required by law, after which it will be securely deleted.
              </p>
              <p>
                Backups of our database may retain copies of deleted data for a
                limited period as part of our disaster-recovery processes, after
                which they are overwritten.
              </p>
            </Section>

            {/* 11 */}
            <Section number="11" title="Children&apos;s Privacy">
              <p>
                Ancestorii is not intended for use by children under the age of 16
                without the consent of a parent or legal guardian. We do not
                knowingly collect personal data from children under 16 without
                parental consent.
              </p>
              <p>
                If we become aware that we have collected personal data from a
                child under 16 without appropriate consent, we will take steps to
                delete that information promptly. If you believe a child has
                provided us with personal data without consent, please contact us
                at support@ancestorii.com.
              </p>
              <p>
                Ancestorii is designed to preserve family memories, which may
                include photographs and stories involving children. The
                responsibility for uploading and managing such content lies with
                the adult account holder, who must have the appropriate legal
                authority to share that content.
              </p>
            </Section>

            {/* 12 */}
            <Section number="12" title="Communications &amp; Marketing">
              <p>
                By creating an account, you consent to receive transactional and
                service-related emails that are necessary for the operation of the
                Service. These include welcome emails, onboarding guidance, order
                confirmations, shipping updates, family invitation notifications,
                family activity alerts, community standards notifications, strike
                warnings, suspension notices, and account security notices.
              </p>
              <p>
                We may also send periodic product updates or feature
                announcements. These are infrequent and relate directly to the
                Service. You may opt out of non-essential communications at any
                time by following the unsubscribe link in any email or by
                contacting us.
              </p>
              <p>
                Ancestorii does not send marketing emails on behalf of third
                parties, and we do not share your email address with third parties
                for marketing purposes.
              </p>
            </Section>

            {/* ───────────────────────── PART B ───────────────────────── */}
            <PartBanner letter="B" label="Website only (ancestorii.com)">
              This part covers data handled by features that exist only on the
              website, including the Our Stories public feed, payments, and
              physical product ordering. None of these features collect data in the
              mobile app.
            </PartBanner>

            {/* 13 */}
            <Section number="13" title="Additional Data We Collect on the Website">
              <p>
                In addition to the categories in Part A, the website collects the
                following data through features that are not present in the mobile
                app:
              </p>
              <p>
                <strong className="text-[#1A1612]">Public feed interaction data:</strong>{' '}
                when you interact with the Our Stories public feed, we collect data
                relating to stories you publish, likes you give, comments you
                write, and shares you make, together with any reports you submit
                about other users&apos; content.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content review data:</strong>{' '}
                every story submitted to Our Stories is reviewed before
                publication. We collect data relating to the review process
                including the review outcome, the reason for any rejection, and
                any community standards violations recorded against your account
                under our three-strike policy.
              </p>
              <p>
                <strong className="text-[#1A1612]">Order and shipping information:</strong>{' '}
                when you purchase a physical product through My Heirlooms (Memory
                Book, Canvas Print, or Acrylic Print), we collect your shipping
                name, address, email, and phone number as provided during
                checkout.
              </p>
              <p>
                <strong className="text-[#1A1612]">Payment information:</strong>{' '}
                payment transactions are processed securely by Stripe. Ancestorii
                does not receive, store, or have access to your full payment card
                details. We receive a confirmation of payment status, transaction
                ID, and billing currency from Stripe.
              </p>
              <p>
                <strong className="text-[#1A1612]">AI interaction data:</strong>{' '}
                if you use the optional Story Assistance feature, the names,
                dates, and contextual details you provide as prompts are sent to
                a third-party AI language model to generate writing suggestions.
                We log the type of assistance requested, token usage, and
                response time for service-quality purposes. We do not use your
                content to train AI models.
              </p>
            </Section>

            {/* 14 */}
            <Section number="14" title="Our Stories — Public Feed Data">
              <p>
                When you publish a story to Our Stories, the following data
                becomes publicly visible to all Ancestorii users: the story title,
                story content, any photos or media attached to the story, your
                display name, and your profile photograph.
              </p>
              <p>
                <strong className="text-[#1A1612]">Likes, comments, and shares.</strong>{' '}
                When you like, comment on, or share a story on Our Stories, your
                display name and profile photograph are visible alongside that
                interaction. Comments you write are publicly visible. You may
                delete your own comments at any time.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content review.</strong>{' '}
                Every story submitted to Our Stories is reviewed before it appears
                on the public feed. This review process may involve automated
                systems and manual review. The purpose of the review is to ensure
                compliance with our community standards, which prohibit religious
                content, political content, hate speech, harassment, spam,
                self-promotion, and any content that is not a genuine family
                memory. The outcome of each review (approved or rejected) and the
                reason for any rejection are recorded against your account.
              </p>
              <p>
                <strong className="text-[#1A1612]">Three-strike policy data.</strong>{' '}
                If a published story violates our community standards, a strike
                is recorded against your account. We store the number of strikes,
                the date and reason for each strike, and the status of any
                suspension or ban. This data is used solely to enforce our
                community standards and is not shared publicly. Strike data is
                retained for the lifetime of your account.
              </p>
              <p>
                <strong className="text-[#1A1612]">Reports.</strong>{' '}
                When you report a story or comment, we collect the content of the
                report and your identity for the purpose of investigating the
                report. Your identity as the reporter is not disclosed to the
                person whose content was reported.
              </p>
              <p>
                <strong className="text-[#1A1612]">Removal.</strong>{' '}
                You may remove a story from Our Stories at any time. Upon removal,
                the story content, associated likes, comments, and shares are
                removed from the public feed. Removal from Our Stories does not
                affect content stored in your private family library.
              </p>
              <p>
                <strong className="text-[#1A1612]">No algorithms.</strong>{' '}
                Our Stories does not use engagement-based algorithms, behavioural
                profiling, or personalised content ranking. Stories are displayed
                in chronological order. We do not track or profile your reading
                behaviour on the public feed for the purpose of content
                recommendation.
              </p>
            </Section>

            {/* 15 */}
            <Section number="15" title="My Heirlooms — Physical Product Data">
              <p>
                When you order a physical product through My Heirlooms (Memory
                Book, Canvas Print, or Acrylic Print), the following data is
                processed. Physical products are ordered on the website only.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content data:</strong>{' '}
                a print-ready file is generated from the photos, stories, and
                layouts you have selected from your private family library. This
                file is shared with our third-party print-fulfilment partner
                solely for the purpose of producing your order. The fulfilment
                partner does not retain your content beyond what is necessary to
                complete production and delivery.
              </p>
              <p>
                <strong className="text-[#1A1612]">Shipping data:</strong>{' '}
                your shipping name, address, email, and phone number are shared
                with our fulfilment partner for delivery purposes only.
              </p>
              <p>
                <strong className="text-[#1A1612]">Payment data:</strong>{' '}
                physical product payments are processed by Stripe. Ancestorii does
                not store your full card details. We receive a payment
                confirmation, transaction ID, and billing currency.
              </p>
              <p>
                <strong className="text-[#1A1612]">PDF and image rendering:</strong>{' '}
                print-ready files for Memory Books are generated using a
                cloud-based browser rendering service. Your content is temporarily
                processed to produce the output file and is not stored by the
                rendering service beyond the duration of the rendering request.
              </p>
              <p>
                <strong className="text-[#1A1612]">Order records:</strong>{' '}
                order details including the product type, order date, delivery
                address, and transaction reference are retained for up to six
                years in accordance with UK tax and accounting requirements.
              </p>
            </Section>

            {/* 16 */}
            <Section number="16" title="Website Service Providers">
              <p>
                The following providers process data only through website
                features. They are in addition to the shared providers listed in
                Section 6:
              </p>
              <p>
                <strong className="text-[#1A1612]">Payment processing:</strong>{' '}
                payments for subscriptions and physical products are handled by
                Stripe. Stripe receives your payment details directly — Ancestorii
                does not have access to your full card information.
              </p>
              <p>
                <strong className="text-[#1A1612]">Print fulfilment:</strong>{' '}
                when you order a physical product through My Heirlooms, your
                shipping name, address, email, phone number, and a print-ready
                file containing your content are shared with our print-fulfilment
                partner solely for the purpose of producing and delivering your
                order. Your content is not retained by the fulfilment partner
                beyond what is necessary to complete the order.
              </p>
              <p>
                <strong className="text-[#1A1612]">PDF and image rendering:</strong>{' '}
                print-ready files for Memory Books are generated using a
                cloud-based browser rendering service. Your content is temporarily
                processed to produce the output file and is not stored by the
                rendering service.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content review:</strong>{' '}
                stories submitted to the Our Stories public feed may be reviewed
                using automated systems including third-party AI services. The
                content of the story is processed solely for the purpose of
                determining compliance with our community standards. Content
                processed for review is not retained by third-party review
                services beyond the duration of the review request and is not used
                to train AI models.
              </p>
              <p>
                <strong className="text-[#1A1612]">AI processing:</strong>{' '}
                if you use Story Assistance, the contextual details you provide
                (names, dates, descriptions) are sent to a third-party AI language
                model provider to generate writing suggestions. These inputs are
                not used to train AI models. The AI provider processes data in
                accordance with its own data-handling policies and does not retain
                your inputs beyond the duration of the request.
              </p>
              <p>
                <strong className="text-[#1A1612]">Hosting:</strong>{' '}
                the Ancestorii website is hosted on Vercel. Vercel may process
                technical data such as IP addresses and request headers as part of
                serving the platform.
              </p>
            </Section>

            {/* 17 */}
            <Section number="17" title="Cookies &amp; Tracking">
              <p>
                The Ancestorii website uses essential cookies required for the
                platform to function, including authentication session cookies that
                keep you logged in. These are strictly necessary and do not require
                consent.
              </p>
              <p>
                We may use analytics cookies or similar technologies to
                understand how the website is used in aggregate. Where
                non-essential cookies are used, we will obtain your consent
                before setting them.
              </p>
              <p>
                Ancestorii does not use advertising cookies or tracking pixels for
                profiling. We do not serve ads on the platform, and we do not share
                browsing data with advertising networks. Our Stories does not use
                cookies or tracking to profile reading behaviour or personalise
                content. The mobile app does not use cookies (see Section 23).
              </p>
            </Section>

            {/* ───────────────────────── PART C ───────────────────────── */}
            <PartBanner letter="C" label="Mobile app only (iOS &amp; Android)">
              This part covers data handled only by the Ancestorii mobile app
              (com.ancestorii.app). The app is a private family memory archive:
              content is visible only within your family and is never public, and
              no payments are taken in the app.
            </PartBanner>

            {/* 18 */}
            <Section number="18" title="The Mobile App at a Glance">
              <p>
                The Ancestorii mobile app is an iOS and Android application that
                lets you and your invited family members capture and view memories,
                albums, timelines, voice notes, and family profiles on the go.
              </p>
              <p>
                The app talks directly to our infrastructure provider (Supabase)
                for authentication, database, and storage. There is no separate
                Ancestorii app server. Upgrades to Premium and orders for physical
                products are not available in the app; these are completed on the
                website, and the app never collects payment card data.
              </p>
            </Section>

            {/* 19 */}
            <Section number="19" title="Permissions the App Requests">
              <p>
                The app requests the following device permissions. Each is used
                only for the purpose described, and you can change your decision at
                any time in your device settings:
              </p>
              <p>
                <strong className="text-[#1A1612]">Photo library:</strong>{' '}
                access to your photo library so you can attach photos and videos to
                memories and albums and set a profile photo. The app selects items
                you choose from your library and does not access the camera
                directly.
              </p>
              <p>
                <strong className="text-[#1A1612]">Microphone:</strong>{' '}
                access to your microphone so you can record voice notes and voice
                comments within the app.
              </p>
              <p>
                <strong className="text-[#1A1612]">Notifications:</strong>{' '}
                permission to send push notifications so we can let you know about
                family activity. You can disable notifications at any time in your
                device settings.
              </p>
            </Section>

            {/* 20 */}
            <Section number="20" title="Push Notifications &amp; Device Data">
              <p>
                If you allow notifications, the app registers a per-device push
                token and stores it with the device platform (iOS or Android) and
                your user ID so we can deliver notifications to your device.
              </p>
              <p>
                Notifications are sent through the Expo push notification service
                and, for delivery to the device, through Apple Push Notification
                service on iOS and Firebase Cloud Messaging on Android. They are
                triggered by family activity such as a new memory, a comment, a
                reaction, a question received, a new member joining, and welcome
                messages.
              </p>
              <p>
                When you sign out of the app, your device&apos;s push token is
                deleted.
              </p>
            </Section>

            {/* 21 */}
            <Section number="21" title="Data Stored on Your Device">
              <p>
                To keep you signed in and to complete certain flows, the app stores
                a small amount of data locally on your device. This includes your
                authentication session token and any pending invitation, question,
                or share codes you are in the process of using.
              </p>
              <p>
                The app also caches images on the device so they load quickly, and
                when you tap &quot;Copy&quot; on an invitation code or share link,
                that value is written to your device clipboard so you can paste it
                where you wish.
              </p>
            </Section>

            {/* 22 */}
            <Section number="22" title="App Service Providers">
              <p>
                In addition to the shared providers listed in Section 6, the app
                uses the following providers for push notification delivery:
              </p>
              <p>
                <strong className="text-[#1A1612]">Expo:</strong> the Expo push
                notification service is used to deliver notifications to your
                device, receiving your push token for that purpose.
              </p>
              <p>
                <strong className="text-[#1A1612]">Apple and Google push services:</strong>{' '}
                Apple Push Notification service (iOS) and Firebase Cloud Messaging
                (Android) deliver the notifications to your device at the operating
                system level.
              </p>
            </Section>

            {/* 23 */}
            <Section number="23" title="What the App Does Not Collect">
              <p>
                The mobile app contains no analytics, advertising, crash-reporting,
                or tracking software. We do not embed third-party tracking SDKs.
                Firebase is present only to deliver Android push notifications.
              </p>
              <p>
                The app does not capture photos or video directly through the
                camera, does not access your device GPS or location sensor, and
                does not access your contacts. Where a &quot;location&quot; appears
                on a profile, it is free text you have typed, not data read from
                your device.
              </p>
            </Section>

            {/* 24 */}
            <Section number="24" title="Account &amp; Data Deletion">
              <p>
                You can delete your account and all associated personal data at any
                time directly in the app. Go to the Profile screen and tap
                &quot;Delete account&quot;. This permanently removes your account
                and personal data, signs you out, and you will no longer be able to
                log back in.
              </p>
              <p>
                Deletion also remains available by contacting{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>{' '}
                or by deleting your account on the website at ancestorii.com.
                However you request it, deletion is permanent and is actioned in
                accordance with the Data Retention section in Part A (Section 10).
              </p>
            </Section>

            {/* ───────────────────────── Closing ───────────────────────── */}
            {/* 25 */}
            <Section number="25" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect
                changes to the Service, our data practices, or legal requirements.
                When we make material changes, we will notify you via email or
                through a prominent notice on the platform.
              </p>
              <p>
                The &quot;Last updated&quot; date at the top of this page
                indicates when the policy was most recently revised. Continued use
                of the Service after changes are posted constitutes acceptance of
                the updated policy.
              </p>
              <p>
                Previous versions of this Privacy Policy are available upon
                request.
              </p>
            </Section>

            {/* 26 */}
            <Section number="26" title="Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy, your personal data, or how Ancestorii handles your
                information, please contact us at:
              </p>
              <p>
                <strong className="text-[#1A1612]">Ancestorii Ltd</strong>
                <br />
                ICO registration: ZC149600
                <br />
                Email:{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>
              </p>
              <p>
                We aim to respond to all enquiries within five working days.
              </p>
            </Section>
          </div>

          {/* ── End mark ── */}
          <div className="mt-16 pt-8 border-t border-[#E8E0D0]">
            <p className="text-[13px] text-[#A09888] leading-relaxed">
              This Privacy Policy was last reviewed and updated on 26 June 2026.
              Previous versions are available upon request.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

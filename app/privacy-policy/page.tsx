import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy – Ancestorii',
  description:
    'How Ancestorii collects, uses, stores, and protects your personal data.',
  alternates: {
    canonical: 'https://www.ancestorii.com/privacy-policy',
  },
};

/* ────────────────────────────────────────────────────── */

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

/* ────────────────────────────────────────────────────── */

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />

      <main
        className="min-h-screen"
        style={{ background: '#FDFAF5' }}
      >
        {/* ── Header band ── */}
        <div
          className="border-b"
          style={{
            background: '#1A1612',
            borderColor: 'rgba(184,146,42,0.15)',
          }}
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
            <p
              className="mt-4 text-[14px]"
              style={{ color: 'rgba(245,241,230,0.5)' }}
            >
              Last updated: 17 May 2026
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
                personal information when you use the Ancestorii platform, website
                at <strong>ancestorii.com</strong>, and all related services
                (collectively, the &quot;Service&quot;).
              </p>
              <p>
                Ancestorii Ltd is the data controller for the purposes of UK GDPR
                and the Data Protection Act 2018. Our contact address for all
                data-related enquiries is{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>
                .
              </p>
            </div>

            {/* 1 */}
            <Section number="1" title="Information We Collect">
              <p>
                We collect only the information necessary to operate, maintain,
                and improve the Service. The categories of data we collect are as
                follows:
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Account information:
                </strong>{' '}
                your full name, email address, and authentication credentials.
                If you sign up using Google, we receive your name, email address,
                and profile photo from Google. You may also optionally provide a
                phone number, date of birth, biography, location, and a profile
                photograph.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Family information:
                </strong>{' '}
                the name of your family space, the names and roles of family
                members you invite, and family membership details. When you
                create profiles for loved ones, you may provide their names,
                dates of birth, dates of passing, biographical details,
                relationship descriptions, and photographs.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Content you upload:
                </strong>{' '}
                photographs, videos, audio recordings (including voice notes),
                written memories, captions, timeline events, album descriptions,
                time capsule messages, and any other media or text you choose to
                store on the platform. This may include associated metadata such
                as file names, file sizes, and image dimensions.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Order and shipping information:
                </strong>{' '}
                when you purchase a physical product (Memory Book, Memory Canvas,
                or Acrylic Print), we collect your shipping name, address, email,
                and phone number as provided during checkout.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Payment information:
                </strong>{' '}
                payment transactions are processed securely by Stripe. Ancestorii
                does not receive, store, or have access to your full payment card
                details. We receive a confirmation of payment status, transaction
                ID, and billing currency from Stripe.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  AI interaction data:
                </strong>{' '}
                if you use the optional Story Assistance feature, the names,
                dates, and contextual details you provide as prompts are sent to
                a third-party AI language model to generate writing suggestions.
                We log the type of assistance requested, token usage, and
                response time for service-quality purposes. We do not use your
                content to train AI models.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Technical and usage data:
                </strong>{' '}
                browser type, device type, operating system, IP address, pages
                visited, feature interactions, and session duration. This data is
                collected automatically and used in aggregate to improve the
                Service.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Email validation data:
                </strong>{' '}
                at the point of registration, your email address may be checked
                against a third-party email verification service to confirm
                deliverability and reduce fraud. This check returns a validation
                result only — no personal content is shared.
              </p>
            </Section>

            {/* 2 */}
            <Section number="2" title="How We Use Your Information">
              <p>We use the information we collect for the following purposes:</p>

              <p>
                To create, authenticate, and manage your account and family space.
                To store, organise, display, and protect your uploaded memories
                and content. To process physical product orders, generate
                print-ready files, and coordinate fulfilment and delivery. To
                provide AI-assisted writing suggestions when you opt to use the
                Story Assistance feature. To send transactional communications
                including welcome emails, onboarding guidance, order
                confirmations, family invitation notifications, and account
                security alerts. To validate email addresses at registration to
                ensure deliverability of essential communications. To provide
                customer support and respond to enquiries. To maintain the
                security, integrity, and performance of the platform. To detect
                and prevent fraud, abuse, and violations of our Terms. To improve
                the Service based on anonymised and aggregated usage insights.
              </p>
            </Section>

            {/* 3 */}
            <Section number="3" title="Legal Basis for Processing (UK GDPR)">
              <p>
                We process your personal data under the following legal bases as
                defined by the UK General Data Protection Regulation:
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Performance of a contract:
                </strong>{' '}
                processing necessary to provide the Service you have signed up
                for, including account management, content storage, order
                fulfilment, and delivery of physical products.
              </p>

              <p>
                <strong className="text-[#1A1612]">Consent:</strong> where you
                have given explicit consent, such as opting in to the AI Story
                Assistance feature or providing optional profile information. You
                may withdraw consent at any time through your account settings or
                by contacting us.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Legitimate interests:
                </strong>{' '}
                processing necessary for our legitimate business interests,
                including platform security, fraud prevention, service
                improvement, and sending non-marketing service communications. We
                balance these interests against your rights and freedoms.
              </p>

              <p>
                <strong className="text-[#1A1612]">Legal obligation:</strong>{' '}
                processing required to comply with applicable laws, regulations,
                or legal processes.
              </p>
            </Section>

            {/* 4 */}
            <Section number="4" title="Family Collaboration &amp; Shared Data">
              <p>
                When you create or join a family space, all content within that
                space is visible to every member. This means photographs, voice
                notes, timelines, albums, and other memories uploaded by any
                family member are accessible to all members of the same family.
              </p>
              <p>
                Family invitations are sent via email and include a unique,
                time-limited token. The recipient&apos;s email address is used
                solely to deliver the invitation. If the recipient does not accept
                the invitation within seven days, the token expires and no account
                is created on their behalf.
              </p>
              <p>
                If you leave or are removed from a family space, your access to
                that family&apos;s shared content is revoked immediately. Content
                you uploaded to the shared space may be removed in accordance with
                our deletion policies.
              </p>
              <p>
                Ancestorii does not monitor or moderate content within private
                family spaces unless a violation of our Terms is reported.
              </p>
            </Section>

            {/* 5 */}
            <Section number="5" title="Data Sharing &amp; Third-Party Services">
              <p>
                Ancestorii does <strong className="text-[#1A1612]">not</strong>{' '}
                sell, rent, or trade your personal data to any third party.
              </p>
              <p>
                We share limited data with trusted third-party service providers
                strictly as necessary to operate the Service. Each provider
                processes data only for the specific purpose described and is
                subject to contractual obligations to protect your information:
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  Authentication &amp; database:
                </strong>{' '}
                we use Supabase to manage user authentication, database storage,
                and file storage. Your account data, content, and uploaded media
                are stored on Supabase&apos;s infrastructure.
              </p>

              <p>
                <strong className="text-[#1A1612]">Payment processing:</strong>{' '}
                payments for subscriptions and physical products are handled by
                Stripe. Stripe receives your payment details directly — Ancestorii
                does not have access to your full card information.
              </p>

              <p>
                <strong className="text-[#1A1612]">Email delivery:</strong>{' '}
                transactional emails (welcome messages, order confirmations,
                family invitations, onboarding guidance, and activity
                notifications) are sent via Resend from support@ancestorii.com.
                Resend receives your email address and name for the purpose of
                delivering these communications.
              </p>

              <p>
                <strong className="text-[#1A1612]">Email validation:</strong>{' '}
                at registration, your email address may be checked by Kickbox to
                confirm it is deliverable and to suggest corrections for typos.
                Only the email address is shared — no other personal data.
              </p>

              <p>
                <strong className="text-[#1A1612]">Print fulfilment:</strong>{' '}
                when you order a physical product, your shipping name, address,
                email, phone number, and a print-ready file containing your
                content are shared with our print-fulfilment partner solely for
                the purpose of producing and delivering your order. Your content
                is not retained by the fulfilment partner beyond what is necessary
                to complete the order.
              </p>

              <p>
                <strong className="text-[#1A1612]">
                  PDF and image rendering:
                </strong>{' '}
                print-ready files for physical products are generated using a
                cloud-based browser rendering service. Your content is temporarily
                processed to produce the output file and is not stored by the
                rendering service.
              </p>

              <p>
                <strong className="text-[#1A1612]">AI processing:</strong> if
                you use Story Assistance, the contextual details you provide
                (names, dates, descriptions) are sent to a third-party AI language
                model provider to generate writing suggestions. These inputs are
                not used to train AI models. The AI provider processes data in
                accordance with its own data-handling policies and does not retain
                your inputs beyond the duration of the request.
              </p>

              <p>
                <strong className="text-[#1A1612]">Hosting:</strong> the
                Ancestorii website and application are hosted on Vercel. Vercel
                may process technical data such as IP addresses and request
                headers as part of serving the platform.
              </p>

              <p>
                We may also disclose personal data if required to do so by law, in
                response to a valid legal request, or to protect the rights,
                safety, or property of Ancestorii, our users, or the public.
              </p>
            </Section>

            {/* 6 */}
            <Section number="6" title="Data Storage &amp; Security">
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
                connections, and restricted access to production systems.
              </p>
              <p>
                While no system can guarantee absolute security, Ancestorii is
                designed with privacy-first principles and follows modern security
                practices. If we become aware of a data breach that affects your
                personal data, we will notify you and the relevant supervisory
                authority in accordance with our legal obligations.
              </p>
            </Section>

            {/* 7 */}
            <Section number="7" title="International Data Transfers">
              <p>
                Some of our third-party service providers are based outside the
                United Kingdom. Where personal data is transferred internationally,
                we ensure appropriate safeguards are in place, such as Standard
                Contractual Clauses approved by the UK Information
                Commissioner&apos;s Office, adequacy decisions, or equivalent
                protections as required by UK data protection law.
              </p>
            </Section>

            {/* 8 */}
            <Section number="8" title="Cookies &amp; Tracking">
              <p>
                Ancestorii uses essential cookies required for the platform to
                function, including authentication session cookies that keep you
                logged in. These are strictly necessary and do not require
                consent.
              </p>
              <p>
                We may use analytics cookies or similar technologies to
                understand how the platform is used in aggregate. Where
                non-essential cookies are used, we will obtain your consent
                before setting them.
              </p>
              <p>
                Ancestorii does not use advertising cookies or tracking pixels. We
                do not serve ads on the platform, and we do not share browsing
                data with advertising networks.
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
                may request a copy of the personal data we hold about you.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to rectification:</strong>{' '}
                you may request correction of any inaccurate or incomplete
                personal data. You can also update most information directly
                through your account settings.
              </p>
              <p>
                <strong className="text-[#1A1612]">
                  Right to erasure (&quot;right to be forgotten&quot;):
                </strong>{' '}
                you may request deletion of your personal data. You can delete
                your account at any time, which will permanently remove your
                personal data and uploaded content in accordance with our
                retention policy.
              </p>
              <p>
                <strong className="text-[#1A1612]">
                  Right to restrict processing:
                </strong>{' '}
                you may request that we limit how we process your data in certain
                circumstances, such as while a dispute about accuracy is being
                resolved.
              </p>
              <p>
                <strong className="text-[#1A1612]">
                  Right to data portability:
                </strong>{' '}
                where technically feasible, you may request a copy of your data in
                a structured, commonly used, machine-readable format.
              </p>
              <p>
                <strong className="text-[#1A1612]">Right to object:</strong> you
                may object to processing based on legitimate interests. We will
                cease processing unless we can demonstrate compelling legitimate
                grounds.
              </p>
              <p>
                <strong className="text-[#1A1612]">
                  Right to withdraw consent:
                </strong>{' '}
                where processing is based on consent (such as AI Story
                Assistance), you may withdraw that consent at any time through
                your account settings. Withdrawal does not affect the lawfulness
                of processing carried out before withdrawal.
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
                continuous access to your memories and family library.
              </p>
              <p>
                Upon account deletion, your personal data, profile information,
                and uploaded content will be permanently removed from our systems
                within 30 days. Content you uploaded to a shared family space will
                also be removed. Certain data may be retained for a longer period
                where required by law (such as financial transaction records for
                tax and accounting purposes), after which it will be securely
                deleted.
              </p>
              <p>
                Order records (including shipping addresses and transaction
                details) are retained for up to six years after the date of the
                transaction, in accordance with UK tax and accounting
                requirements.
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
                family activity alerts, and account security notices.
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

            {/* 13 */}
            <Section number="13" title="Changes to This Policy">
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

            {/* 14 */}
            <Section number="14" title="Contact Us">
              <p>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy, your personal data, or how Ancestorii handles your
                information, please contact us at:
              </p>
              <p>
                <strong className="text-[#1A1612]">Ancestorii Ltd</strong>
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
              This Privacy Policy was last reviewed and updated on 17 May 2026.
              Previous versions are available upon request.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
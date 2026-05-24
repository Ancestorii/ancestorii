
import type { Metadata } from 'next';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';

export const metadata: Metadata = {
  title: 'Terms & Conditions – Ancestorii',
  description:
    'Terms and conditions governing use of the Ancestorii platform, physical products, and services.',
  alternates: {
    canonical: 'https://www.ancestorii.com/terms',
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

export default function TermsPage() {
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
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 text-[14px]" style={{ color: 'rgba(245,241,230,0.5)' }}>
              Last updated: 22 May 2026
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-[820px] mx-auto px-6 py-[clamp(2.5rem,5vw,4rem)]">
          <div className="space-y-12">
            {/* Intro */}
            <div className="text-[#4A4237] leading-[1.8] text-[15px] space-y-4">
              <p>
                Welcome to <strong className="text-[#1A1612]">Ancestorii</strong>.
                These Terms &amp; Conditions (&quot;Terms&quot;) govern your access
                to and use of the Ancestorii platform, website at{' '}
                <strong>ancestorii.com</strong>, mobile experience, and all related
                services including the public story feed, private family library,
                family collaboration features, physical product ordering, and
                AI-assisted writing tools (collectively, the &quot;Service&quot;).
              </p>
              <p>
                By creating an account, accessing the platform, or placing an
                order, you agree to be bound by these Terms. If you do not agree,
                please do not use the Service.
              </p>
              <p>
                Ancestorii is operated by Ancestorii Ltd, registered in England
                and Wales, with correspondence addressed to{' '}
                <strong>support@ancestorii.com</strong>.
              </p>
            </div>

            {/* 1 */}
            <Section number="1" title="About Ancestorii">
              <p>
                Ancestorii is a digital platform designed to help individuals and
                families preserve memories, life stories, photographs, voice
                recordings, and personal histories for long-term safekeeping. The
                Service is built around two distinct layers:
              </p>
              <p>
                <strong className="text-[#1A1612]">Our Stories</strong> is the
                public layer. It is a shared space where users publish family
                memories that anyone on the platform can read, like, comment on,
                and share. Our Stories is designed exclusively for genuine family
                memories. Religious content, political content, hate speech,
                harassment, spam, self-promotion, and commercial content are not
                permitted.
              </p>
              <p>
                <strong className="text-[#1A1612]">My Family</strong> is the
                private layer. It is a closed, invite-only space where families
                build a living library of timelines, albums, stories, voice
                recordings, and family member profiles. Content inside My Family is
                visible only to invited family members and is never surfaced
                publicly, searchable by other users, or included in any discovery
                or recommendation features.
              </p>
              <p>
                <strong className="text-[#1A1612]">My Heirlooms</strong> is the
                physical product layer within My Family. It allows users to create
                and order printed Memory Books, Canvas Prints, and Acrylic Prints
                from the content stored in their private family library.
              </p>
              <p>
                Ancestorii is a memory-preservation and storytelling service. It is
                not a legal, financial, genealogical research, or estate-planning
                service.
              </p>
            </Section>

            {/* 2 */}
            <Section number="2" title="Eligibility">
              <p>
                You must be at least 16 years old to create an account. If you are
                under 18, you confirm that you have the consent of a parent or
                legal guardian. Ancestorii reserves the right to request
                verification of age or parental consent at any time and to suspend
                accounts where eligibility cannot be confirmed.
              </p>
            </Section>

            {/* 3 */}
            <Section number="3" title="Account Registration &amp; Security">
              <p>
                You may register using an email address and password or through a
                supported third-party authentication provider such as Google. You
                are responsible for maintaining the confidentiality of your login
                credentials and for all activity that occurs under your account.
              </p>
              <p>
                You agree to provide accurate, current information during
                registration and to update it as necessary. If you become aware of
                any unauthorised use of your account, you must notify us
                immediately at support@ancestorii.com.
              </p>
              <p>
                Ancestorii may validate email addresses at the point of
                registration using third-party verification services to reduce
                fraud and ensure deliverability of important communications.
              </p>
            </Section>

            {/* 4 */}
            <Section number="4" title="Our Stories — Public Feed">
              <p>
                Our Stories is a public space where users may publish family
                memories for other Ancestorii users to read. By publishing a story
                to Our Stories, you acknowledge that the content will be publicly
                visible to all users of the platform.
              </p>
              <p>
                <strong className="text-[#1A1612]">Interactions.</strong> Users may
                like, comment on, and share stories published to Our Stories. All
                interactions must be respectful and genuine. Comments that contain
                harassment, abuse, hate speech, spam, self-promotion, or content
                unrelated to the story may be removed without notice.
              </p>
              <p>
                <strong className="text-[#1A1612]">No algorithms.</strong> Stories
                on Our Stories are displayed in chronological order. There is no
                engagement-based ranking, algorithmic boosting, or suppression of
                content. Every published story receives the same treatment.
              </p>
              <p>
                <strong className="text-[#1A1612]">No follower counts.</strong>{' '}
                Our Stories does not include follower counts, audience metrics,
                vanity numbers, or any mechanism designed to encourage competition
                between users.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content restrictions.</strong>{' '}
                Our Stories exists exclusively for genuine family memories. The
                following content is prohibited on the public feed: religious
                content of any kind; political content of any kind; hate speech,
                harassment, or discriminatory language; spam, self-promotion, or
                commercial content; and any content that is not a genuine family
                memory. This list is not exhaustive. Ancestorii reserves the right
                to remove any content from the public feed that it determines, in
                its sole discretion, does not meet the spirit or standards of the
                platform.
              </p>
              <p>
                <strong className="text-[#1A1612]">Content review.</strong> Every
                story published to Our Stories is reviewed before it appears on the
                public feed. Stories that do not meet our community standards will
                not be published and the author will be notified.
              </p>
              <p>
                <strong className="text-[#1A1612]">Reporting.</strong> Users may
                report stories or comments that they believe violate these Terms or
                our community standards. Reports are reviewed by Ancestorii and
                action is taken where appropriate.
              </p>
              <p>
                <strong className="text-[#1A1612]">You choose what is public.</strong>{' '}
                Publishing to Our Stories is entirely voluntary. No content from
                your private family library (My Family) is ever published to Our
                Stories without your explicit action. You may remove a published
                story from Our Stories at any time.
              </p>
            </Section>

            {/* 5 */}
            <Section number="5" title="Community Standards &amp; Three-Strike Policy">
              <p>
                Ancestorii enforces a three-strike policy for violations of community
                standards on the Our Stories public feed. This policy exists to
                protect the integrity of the shared space and ensure it remains
                dedicated to genuine family memories.
              </p>
              <p>
                <strong className="text-[#1A1612]">First violation:</strong> The
                story is removed from the public feed and the author receives a
                warning email explaining which standard was violated and why the
                content was removed.
              </p>
              <p>
                <strong className="text-[#1A1612]">Second violation:</strong> The
                story is removed, a final warning is issued, and the author is
                suspended from publishing to Our Stories for a period of seven
                days. During the suspension, the author may not publish new
                stories, comment on other stories, or interact with the public
                feed.
              </p>
              <p>
                <strong className="text-[#1A1612]">Third violation:</strong> The
                author is permanently banned from Our Stories. They may no longer
                publish, comment, like, share, or otherwise interact with the
                public feed.
              </p>
              <p>
                <strong className="text-[#1A1612]">Private library unaffected.</strong>{' '}
                Strikes and bans under this policy apply exclusively to the Our
                Stories public feed. A user's private family library (My Family) is
                never affected by public feed enforcement actions. Access to My
                Family, including all timelines, albums, stories, voice recordings,
                and physical product ordering, remains fully intact regardless of
                the user's standing on the public feed.
              </p>
              <p>
                Ancestorii reserves the right to bypass the graduated strike system
                and take immediate action, including permanent removal from Our
                Stories, in cases of severe violations including but not limited to
                hate speech, threats, harassment, or content that endangers the
                safety of others.
              </p>
            </Section>

            {/* 6 */}
            <Section number="6" title="My Family — Private Library">
              <p>
                My Family is the private layer of Ancestorii. It is a closed space
                accessible only to the account holder and family members they have
                explicitly invited.
              </p>
              <p>
                <strong className="text-[#1A1612]">What My Family includes.</strong>{' '}
                The private library includes the following features: timelines for
                structuring a life chronologically; albums for grouping memories by
                theme, event, or chapter; written stories and reflections; voice
                recordings; family member profiles; and the ability to order
                physical products through My Heirlooms.
              </p>
              <p>
                <strong className="text-[#1A1612]">Privacy guarantee.</strong>{' '}
                Content stored within My Family is never displayed on the Our
                Stories public feed, included in search results, surfaced in
                recommendations, or made accessible to any user outside the
                family space. There are no discovery features, suggested families
                features, or any mechanism by which a non-member could view,
                browse, or access private family content.
              </p>
              <p>
                <strong className="text-[#1A1612]">Capsules.</strong> Ancestorii
                may in the future introduce time capsules (&quot;Capsules&quot;)
                within My Family. Capsules allow users to seal a memory and set a
                future date on which it will be opened. Once sealed, the content of
                a capsule is not accessible until the specified date. Terms
                governing capsules will be updated when the feature is released.
              </p>
            </Section>

            {/* 7 */}
            <Section number="7" title="Family Collaboration">
              <p>
                Ancestorii allows account holders to create a family space and
                invite other users to join as family members. Invitations are sent
                via email and expire after seven days.
              </p>
              <p>
                Family spaces have three roles: Owner, Admin, and Member. The
                Owner has full control over the family space, including the ability
                to invite and remove members, rename the family, and manage
                content. Admins may invite new members. Members may view and
                contribute content within the shared family library.
              </p>
              <p>
                Content uploaded by any family member is visible to all members of
                that family space. Only the original creator of a piece of content
                may delete it. By inviting someone to your family space, you
                acknowledge that they will have access to all content within it.
              </p>
              <p>
                Ancestorii is not responsible for disputes between family members
                regarding shared content or access.
              </p>
            </Section>

            {/* 8 */}
            <Section number="8" title="Content Ownership &amp; Licence">
              <p>
                You retain full ownership of all content you upload to Ancestorii,
                including photographs, text, voice recordings, and other media.
                Ancestorii does not claim any ownership rights over your content.
              </p>
              <p>
                By uploading content, you grant Ancestorii a limited,
                non-exclusive, worldwide licence to store, process, display,
                reproduce, and transmit that content solely for the purpose of
                providing and improving the Service. This includes generating
                print-ready files for physical product orders, displaying content
                to other members of your family space, and displaying content on
                the Our Stories public feed where you have chosen to publish it.
              </p>
              <p>
                For content published to Our Stories, you additionally grant
                Ancestorii the right to display that content publicly on the
                platform, including any associated likes, comments, and shares.
                This licence for public content may be revoked at any time by
                removing the story from Our Stories.
              </p>
              <p>
                You represent and warrant that you have the legal right to upload
                and share any content you submit, and that your content does not
                infringe the intellectual property rights, privacy rights, or any
                other rights of any third party.
              </p>
              <p>
                You agree not to upload content that is unlawful, harmful,
                threatening, abusive, defamatory, obscene, or otherwise
                objectionable.
              </p>
            </Section>

            {/* 9 */}
            <Section number="9" title="AI Story Assistance">
              <p>
                Ancestorii offers an optional AI-assisted writing feature
                (&quot;Story Assistance&quot;) designed to help you find words to
                describe memories, write captions, and craft introductory text for
                your content. This feature can be enabled or disabled in your
                account settings at any time.
              </p>
              <p>
                Story Assistance generates suggestions based on the names, dates,
                and context you provide. All AI-generated text is offered as a
                starting point for your own editing and is not a substitute for
                your personal voice. You are solely responsible for reviewing,
                editing, and approving any AI-generated content before it is saved,
                published to Our Stories, or included in a physical product.
              </p>
              <p>
                Ancestorii does not guarantee the accuracy, completeness, or
                suitability of AI-generated suggestions. The AI writing feature is
                powered by third-party language model technology. Your content
                inputs to this feature are processed in accordance with our Privacy
                Policy.
              </p>
            </Section>

            {/* 10 */}
            <Section number="10" title="Subscriptions &amp; Digital Access">
              <p>
                Ancestorii offers subscription plans with varying features and
                storage limits. Subscriptions are billed in advance on a recurring
                basis at the interval specified at the time of purchase.
              </p>
              <p>
                You may cancel your subscription at any time. Upon cancellation,
                you will retain access to your plan&apos;s features until the end
                of the current billing period, after which your account will revert
                to the free tier. Content already stored will remain accessible
                subject to free-tier storage limits. Your ability to view your
                private family library is not removed upon cancellation or
                downgrade. You retain read access to all content you have created.
              </p>
              <p>
                Ancestorii reserves the right to change subscription pricing or
                features with reasonable notice. Any price change will take effect
                at your next billing cycle following the notice period.
              </p>
              <p>
                Subscription payments are processed securely through Stripe.
                Ancestorii does not store your full payment card details.
              </p>
            </Section>

            {/* 11 */}
            <Section number="11" title="Physical Products &amp; My Heirlooms">
              <p>
                Ancestorii offers physical products through the My Heirlooms
                feature within My Family. Available products include Memory Books,
                Canvas Prints, and Acrylic Prints. These are one-time purchases,
                separate from any subscription plan.
              </p>
              <p>
                <strong className="text-[#1A1612]">Memory Books</strong> are
                printed, hardcover books designed by the user in a visual page
                editor. The user selects which stories, photos, and layouts to
                include and arranges every page of the book. Memory Books are
                available in three tiers with varying page counts and are printed
                at professional quality in A4 landscape format at 300 DPI.
              </p>
              <p>
                <strong className="text-[#1A1612]">Canvas Prints</strong> are
                museum-grade photographs printed on stretched canvas, intended for
                display.
              </p>
              <p>
                <strong className="text-[#1A1612]">Acrylic Prints</strong> are
                high-definition UV photographs printed behind polished acrylic
                glass with a contemporary finish.
              </p>
              <p>
                When you place an order, a print-ready file is generated from your
                digital content and submitted to our third-party print-fulfilment
                partner for production and delivery. By placing an order, you
                authorise Ancestorii to share the necessary content and shipping
                details with our fulfilment partner for the sole purpose of
                completing your order.
              </p>
              <p>
                All physical product prices are displayed inclusive of the product
                cost. Shipping costs and any applicable taxes are calculated at
                checkout. Prices are displayed in GBP, USD, or EUR depending on
                your detected location and may vary by currency. Delivery is free
                worldwide for all physical products.
              </p>
              <p>
                Once a physical product order has been submitted to our fulfilment
                partner for production, it cannot be cancelled or modified. Printed
                products are made to order using your personal content and are
                therefore non-refundable unless they arrive damaged, defective, or
                materially different from what was ordered.
              </p>
              <p>
                If you receive a damaged or defective product, please contact
                support@ancestorii.com within 14 days of delivery with photographs
                of the issue. We will arrange a replacement or refund at our
                discretion.
              </p>
              <p>
                Delivery times are estimates and are not guaranteed. Ancestorii is
                not liable for delays caused by our fulfilment partner, postal
                services, customs processing, or other circumstances beyond our
                reasonable control.
              </p>
            </Section>

            {/* 12 */}
            <Section number="12" title="Payments &amp; Refunds">
              <p>
                All payments are processed through Stripe. By making a purchase,
                you agree to Stripe&apos;s terms of service in addition to these
                Terms.
              </p>
              <p>
                Subscription refunds are not provided for partial billing periods.
                If you believe you have been charged in error, please contact
                support@ancestorii.com and we will investigate promptly.
              </p>
              <p>
                Physical product refunds are handled in accordance with Section 11
                above. Refunds for damaged or defective products will be issued to
                the original payment method.
              </p>
            </Section>

            {/* 13 */}
            <Section number="13" title="Privacy &amp; Data Protection">
              <p>
                Your privacy is central to Ancestorii. We collect and process
                personal data only as necessary to provide the Service. Personal
                data is handled in accordance with our{' '}
                <a
                  href="/privacy-policy"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                , which forms part of these Terms.
              </p>
              <p>
                By using the Service, you acknowledge that certain data may be
                processed by third-party service providers (including
                authentication, email delivery, payment processing, email
                validation, content review, and print fulfilment) as described in
                our Privacy Policy.
              </p>
              <p>
                Content within My Family is treated as private data and is never
                shared with third parties except as required for the fulfilment of
                physical product orders or as required by law.
              </p>
            </Section>

            {/* 14 */}
            <Section number="14" title="Acceptable Use">
              <p>You agree not to use Ancestorii to:</p>
              <p>
                Upload, store, or distribute content that is illegal, harmful,
                threatening, abusive, harassing, defamatory, obscene, or
                discriminatory; impersonate any person or entity, or
                misrepresent your affiliation with any person or entity; attempt to
                gain unauthorised access to other users&apos; accounts, family
                spaces, or data; use the platform for commercial purposes
                unrelated to its intended use as a personal memory-preservation
                tool; interfere with or disrupt the integrity or performance of the
                Service; use automated tools, bots, or scrapers to access or
                extract data from the platform; circumvent any security features or
                usage limits; manipulate the Our Stories public feed through fake
                accounts, coordinated activity, or artificial engagement; or use
                comments, likes, or shares on Our Stories for the purpose of
                harassment, spam, or promotion.
              </p>
              <p>
                Ancestorii reserves the right to remove content and suspend or
                terminate accounts that violate these acceptable use provisions
                without prior notice.
              </p>
            </Section>

            {/* 15 */}
            <Section number="15" title="Intellectual Property">
              <p>
                The Ancestorii name, logo, brand identity, website design, and all
                associated visual elements, software, and documentation are the
                intellectual property of Ancestorii Ltd and are protected by
                applicable copyright, trademark, and other intellectual property
                laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative
                works from any part of the Ancestorii platform or brand without
                prior written consent.
              </p>
            </Section>

            {/* 16 */}
            <Section number="16" title="Service Availability &amp; Modifications">
              <p>
                We strive to keep Ancestorii available at all times, but
                uninterrupted or error-free access cannot be guaranteed. The
                Service may be temporarily unavailable due to scheduled
                maintenance, updates, security patches, or circumstances beyond our
                reasonable control.
              </p>
              <p>
                Ancestorii reserves the right to modify, suspend, or discontinue
                any part of the Service at any time. Where a significant change
                affects your stored content or active subscription, we will provide
                reasonable notice and, where applicable, the opportunity to export
                your data.
              </p>
            </Section>

            {/* 17 */}
            <Section number="17" title="Account Termination">
              <p>
                You may delete your account at any time through your account
                settings or by contacting support@ancestorii.com. Upon deletion,
                your personal data and uploaded content will be permanently removed
                in accordance with our data-retention practices outlined in the
                Privacy Policy. Content within a shared family space that was
                uploaded by you will also be removed. Stories published to Our
                Stories will be removed from the public feed upon account deletion.
              </p>
              <p>
                Ancestorii reserves the right to suspend or terminate accounts that
                violate these Terms, applicable laws, or our acceptable-use
                provisions. Where possible, we will provide notice before
                termination unless immediate action is required to protect the
                Service or other users.
              </p>
            </Section>

            {/* 18 */}
            <Section number="18" title="Disclaimer of Warranties">
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis without warranties of any kind, whether
                express or implied, including but not limited to implied warranties
                of merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
              <p>
                Ancestorii does not warrant that the Service will be uninterrupted,
                secure, or free from errors, viruses, or other harmful components.
                Ancestorii does not warrant the accuracy or reliability of any
                AI-generated content. Ancestorii does not warrant that content
                review processes will identify all prohibited content prior to
                publication. You use the Service at your own risk.
              </p>
            </Section>

            {/* 19 */}
            <Section number="19" title="Limitation of Liability">
              <p>
                To the fullest extent permitted by law, Ancestorii Ltd, its
                directors, employees, and agents shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages,
                including but not limited to loss of data, loss of profits, or
                emotional distress, arising from or in connection with your use of
                or inability to use the Service.
              </p>
              <p>
                In no event shall Ancestorii&apos;s total aggregate liability to
                you for all claims arising from or related to the Service exceed
                the total amount you have paid to Ancestorii in the twelve months
                preceding the claim, or £100, whichever is greater.
              </p>
              <p>
                Nothing in these Terms excludes or limits liability for death or
                personal injury caused by negligence, fraud, or any other liability
                that cannot be excluded or limited under applicable law.
              </p>
            </Section>

            {/* 20 */}
            <Section number="20" title="Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless Ancestorii Ltd
                and its directors, employees, and agents from and against any
                claims, damages, losses, liabilities, costs, and expenses
                (including reasonable legal fees) arising from or related to your
                use of the Service, your content, your violation of these Terms, or
                your violation of any rights of a third party.
              </p>
            </Section>

            {/* 21 */}
            <Section number="21" title="Third-Party Services">
              <p>
                Ancestorii integrates with third-party services for authentication,
                payment processing, email delivery, email validation, content
                review, print fulfilment, and AI language processing. Your use of
                the Service may be subject to the terms and privacy policies of
                these third-party providers.
              </p>
              <p>
                Ancestorii is not responsible for the availability, accuracy, or
                practices of any third-party service. Links to external websites or
                services do not constitute endorsement.
              </p>
            </Section>

            {/* 22 */}
            <Section number="22" title="Communications &amp; Emails">
              <p>
                By creating an account, you consent to receive transactional
                and service-related emails from Ancestorii, including welcome
                messages, onboarding guidance, order confirmations, family
                invitation notifications, community standards notifications, strike
                warnings, and account security alerts. These communications are
                necessary for the operation of the Service and are not marketing.
              </p>
              <p>
                We may also send occasional product updates or feature
                announcements. You may opt out of non-essential communications at
                any time.
              </p>
            </Section>

            {/* 23 */}
            <Section number="23" title="Governing Law &amp; Jurisdiction">
              <p>
                These Terms are governed by and construed in accordance with the
                laws of England and Wales. Any dispute arising from or in
                connection with these Terms shall be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>
              <p>
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision shall be limited or eliminated to the
                minimum extent necessary, and the remaining provisions shall
                continue in full force and effect.
              </p>
            </Section>

            {/* 24 */}
            <Section number="24" title="Changes to These Terms">
              <p>
                Ancestorii may update these Terms from time to time to reflect
                changes to the Service, legal requirements, or business practices.
                When we make material changes, we will notify you via email or
                through a prominent notice on the platform.
              </p>
              <p>
                Continued use of Ancestorii after such changes constitutes
                acceptance of the updated Terms. If you do not agree with the
                revised Terms, you should discontinue use of the Service and delete
                your account.
              </p>
            </Section>

            {/* 25 */}
            <Section number="25" title="Contact">
              <p>
                If you have any questions, concerns, or requests regarding these
                Terms &amp; Conditions, please contact us at{' '}
                <a
                  href="mailto:support@ancestorii.com"
                  className="text-[#B8924A] font-semibold hover:underline"
                >
                  support@ancestorii.com
                </a>
                .
              </p>
            </Section>
          </div>

          {/* ── End mark ── */}
          <div className="mt-16 pt-8 border-t border-[#E8E0D0]">
            <p className="text-[13px] text-[#A09888] leading-relaxed">
              These Terms &amp; Conditions were last reviewed and updated on 22 May
              2026. Previous versions are available upon request.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
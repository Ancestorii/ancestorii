export default function TermsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-20 text-[#0F2040]">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>

      <p className="text-gray-600 mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="space-y-8 text-gray-700 leading-relaxed">
        {/* INTRO */}
        <p>
          Welcome to <strong>Ancestorii</strong>. These Terms & Conditions govern
          your use of the Ancestorii platform, website, and services.
        </p>

        <p>
          By creating an account or using Ancestorii, you agree to be bound by
          these terms. If you do not agree, please do not use the platform.
        </p>

        {/* SERVICE DESCRIPTION */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            1. About Ancestorii
          </h2>

          <p>
            Ancestorii provides a digital platform designed to help users
            preserve memories, life events, media, and personal stories for
            long-term safekeeping.
          </p>

          <p className="mt-3">
            Ancestorii is a memory-preservation service, not a legal, financial,
            or estate-planning service.
          </p>
        </div>

        {/* ELIGIBILITY */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            2. Eligibility
          </h2>

          <p>
            You must be at least 16 years old to create an account, or have
            permission from a parent or legal guardian.
          </p>
        </div>

        {/* USER RESPONSIBILITIES */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            3. User Responsibilities
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials.
            </li>
            <li>
              You must ensure you have the legal right to upload and store any
              content you submit.
            </li>
            <li>
              You agree not to upload unlawful, harmful, or abusive material.
            </li>
          </ul>
        </div>

        {/* CONTENT OWNERSHIP */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            4. Content Ownership
          </h2>

          <p>
            You retain full ownership of all content you upload to Ancestorii.
          </p>

          <p className="mt-3">
            By uploading content, you grant Ancestorii a limited licence to
            store, process, and display that content solely for the purpose of
            providing the service.
          </p>
        </div>

        {/* SUBSCRIPTIONS */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            5. Subscriptions & Payments
          </h2>

          <p>
            Ancestorii offers subscription plans with varying features and
            storage limits.
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Subscriptions are billed in advance.</li>
            <li>You may cancel at any time; access remains until the end of the billing period.</li>
            <li>Prices and features may change with reasonable notice.</li>
          </ul>
        </div>

        {/* DATA & PRIVACY */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            6. Privacy & Data Protection
          </h2>

          <p>
            Your privacy is central to Ancestorii. Personal data is handled in
            accordance with our{" "}
            <a
              href="/privacy-policy"
              className="text-[#D4AF37] font-semibold hover:underline"
            >
              Privacy Policy
            </a>.
          </p>
        </div>

        {/* AVAILABILITY */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            7. Service Availability
          </h2>

          <p>
            We strive to keep Ancestorii available at all times, but uninterrupted
            access cannot be guaranteed.
          </p>

          <p className="mt-3">
            We may suspend access temporarily for maintenance, security, or
            operational reasons.
          </p>
        </div>

        {/* TERMINATION */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            8. Account Termination
          </h2>

          <p>
            You may delete your account at any time.
          </p>

          <p className="mt-3">
            Ancestorii reserves the right to suspend or terminate accounts that
            violate these terms or applicable laws.
          </p>
        </div>

        {/* LIABILITY */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            9. Limitation of Liability
          </h2>

          <p>
            Ancestorii is provided on an “as is” and “as available” basis.
          </p>

          <p className="mt-3">
            To the fullest extent permitted by law, Ancestorii shall not be
            liable for indirect, incidental, or consequential damages arising
            from use of the platform.
          </p>
        </div>

        {/* GOVERNING LAW */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            10. Governing Law
          </h2>

          <p>
            These Terms & Conditions are governed by the laws of the United
            Kingdom.
          </p>
        </div>

        {/* CHANGES */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            11. Changes to These Terms
          </h2>

          <p>
            We may update these terms from time to time. Continued use of
            Ancestorii constitutes acceptance of any updated terms.
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            12. Contact
          </h2>

          <p>
            If you have questions regarding these Terms & Conditions, please
            contact us at{" "}
            <strong>support@ancestorii.com</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}

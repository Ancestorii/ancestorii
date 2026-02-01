
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Privacy Policy – Ancestorii",
  description: "How Ancestorii collects, uses, and protects your personal data.",
  alternates: {
    canonical: "https://www.ancestorii.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
 return (
   <>
     <Nav />
     <main className="max-w-5xl mx-auto px-6 py-20 text-[#0F2040]">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-gray-600 mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <section className="space-y-8 text-gray-700 leading-relaxed">
        {/* INTRO */}
        <p>
          At <strong>Ancestorii</strong>, your privacy is fundamental to our
          mission. We exist to help you preserve life stories, memories, and
          personal moments — and we treat that responsibility with the highest
          level of care.
        </p>

        <p>
          This Privacy Policy explains how we collect, use, store, and protect
          your information when you use the Ancestorii platform.
        </p>

        {/* DATA WE COLLECT */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            1. Information We Collect
          </h2>

          <p className="mb-3">
            We collect only the information necessary to operate and improve our
            services.
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>
              <strong>Account information:</strong> name, email address, and
              login credentials.
            </li>
            <li>
              <strong>Content you upload:</strong> photos, videos, audio,
              documents, written memories, and related metadata.
            </li>
            <li>
              <strong>Usage data:</strong> interactions with the platform,
              feature usage, and basic technical information.
            </li>
            <li>
              <strong>Payment information:</strong> processed securely by our
              payment providers. Ancestorii does not store full card details.
            </li>
          </ul>
        </div>

        {/* HOW DATA IS USED */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            2. How We Use Your Information
          </h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>To create and manage your Ancestorii account.</li>
            <li>To store, display, and protect your memories.</li>
            <li>To provide customer support and respond to enquiries.</li>
            <li>To maintain platform security and prevent abuse.</li>
            <li>
              To improve the platform based on anonymised usage insights.
            </li>
          </ul>
        </div>

        {/* LEGAL BASIS */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            3. Legal Basis for Processing (GDPR)
          </h2>

          <p>
            We process personal data under the following legal bases:
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Your consent when creating an account and uploading content.</li>
            <li>Performance of a contract to provide our services.</li>
            <li>Legal obligations under applicable laws.</li>
            <li>
              Legitimate interests related to platform security and improvement.
            </li>
          </ul>
        </div>

        {/* DATA STORAGE */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            4. Data Storage & Security
          </h2>

          <p>
            Your data is stored using secure, industry-standard infrastructure.
            We apply technical and organisational measures to protect against
            unauthorised access, loss, or misuse.
          </p>

          <p className="mt-3">
            While no system can guarantee absolute security, Ancestorii is
            designed with privacy-first principles and modern security
            practices.
          </p>
        </div>

        {/* SHARING */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            5. Data Sharing
          </h2>

          <p>
            Ancestorii does <strong>not</strong> sell, rent, or trade your
            personal data.
          </p>

          <p className="mt-3">
            We may share limited data with trusted service providers strictly
            necessary to operate the platform (such as hosting and payment
            processing), all of whom are contractually obligated to protect your
            information.
          </p>
        </div>

        {/* USER RIGHTS */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            6. Your Rights
          </h2>

          <p>
            Under UK GDPR, you have the right to:
          </p>

          <ul className="list-disc ml-6 space-y-2">
            <li>Access your personal data.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your account and data.</li>
            <li>Restrict or object to certain processing.</li>
            <li>Request data portability where applicable.</li>
          </ul>

          <p className="mt-3">
            Requests can be made by contacting{" "}
            <strong>support@ancestorii.com</strong>.
          </p>
        </div>

        {/* RETENTION */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            7. Data Retention
          </h2>

          <p>
            Your data is retained for as long as your account remains active.
            Upon account deletion, your personal data and uploaded content will
            be permanently removed unless retention is required by law.
          </p>
        </div>

        {/* CHILDREN */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            8. Children’s Privacy
          </h2>

          <p>
            Ancestorii is not intended for use by children under the age of 16
            without parental consent. We do not knowingly collect data from
            minors.
          </p>
        </div>

        {/* CHANGES */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            9. Changes to This Policy
          </h2>

          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected on this page with an updated revision date.
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h2 className="text-2xl font-semibold mb-3">
            10. Contact Us
          </h2>

          <p>
            If you have any questions about this Privacy Policy or how your data
            is handled, please contact us at{" "}
            <strong>support@ancestorii.com</strong>.
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </>
);
}

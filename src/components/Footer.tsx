import Link from "next/link";

export default function Footer() {
  return (
    <footer className="p-6 bg-white">
      <div className="mx-auto max-w-screen-xl">

        <div className="md:flex md:justify-between md:items-start">

          {/* Logo */}
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center">
              <img
                src="/Actual white logo.png"
                className="h-10"
                alt="Ancestorii Logo"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">

            {/* Follow Us (left on mobile) */}
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Follow Us
              </h2>
              <div className="flex space-x-6">
                <a
                  href="https://www.facebook.com/profile.php?id=61586259749930"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>

                <a
  href="https://www.instagram.com/ancestorii_official/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-gray-500 hover:text-gray-900"
  aria-label="Instagram"
>
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
</a>
              </div>
            </div>

            {/* Legal (right on mobile) */}
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Legal
              </h2>
              <ul className="text-gray-500">
                <li className="mb-2">
                  <Link href="/privacy-policy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn (full width on mobile, unchanged on desktop) */}
            <div className="col-span-2 md:col-span-1">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Learn
              </h2>
              <ul className="text-gray-500">
                <li className="mb-2 font-semibold text-gray-900">
                  <Link href="/digital-legacy" className="hover:underline">
                    What is a Digital Legacy?
                  </Link>
                </li>
                <li className="mb-2 font-semibold text-gray-900">
                  <Link href="/why-this-exists" className="hover:underline">
                    Why Ancestorii exists?
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <hr className="my-6 border-gray-200 lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500">
            © {new Date().getFullYear()} Ancestorii™. All Rights Reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}

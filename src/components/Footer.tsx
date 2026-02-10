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
<a
  href="https://open.spotify.com/show/0fR2O7fyOBB98yGlRpRsiJ"
  target="_blank"
  rel="noopener noreferrer"
  className="text-gray-500 hover:text-gray-900"
  aria-label="Spotify"
>
  <svg
    className="w-5 h-5"
    viewBox="0 0 168 168"
    fill="currentColor"
  >
    <path d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.6 121.5c-1.6 2.6-5 3.4-7.6 1.8-20.8-12.7-47-15.6-77.8-8.6-3 .7-6-1.1-6.7-4.1-.7-3 1.1-6 4.1-6.7 33.8-7.7 63-4.3 86.2 10.2 2.6 1.6 3.4 5 1.8 7.4zm10.9-24.3c-2 3.2-6.2 4.2-9.4 2.2-23.8-14.6-60-18.9-87.9-10.4-3.6 1.1-7.4-.9-8.5-4.5-1.1-3.6.9-7.4 4.5-8.5 31.9-9.6 71.6-4.9 98.7 11.7 3.2 2 4.2 6.2 2.6 9.5zm.9-25.2C106 55.7 59.6 54.7 31.4 63.3c-4.3 1.3-8.9-1.1-10.2-5.4-1.3-4.3 1.1-8.9 5.4-10.2 32.6-9.9 85.6-8 118.9 12.1 3.9 2.4 5.1 7.4 2.7 11.2-2.3 3.7-7.3 5-11.1 2.5z" />
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

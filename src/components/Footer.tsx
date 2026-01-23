import Link from "next/link";

export default function Footer() {
  return (
    <footer className="p-6 bg-white">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between items-center">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <img
                src="/Actual white logo.png"
                className="h-10"
                alt="Ancestorii Logo"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10">
            {/* Follow Us */}
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                Follow Us
              </h2>

              <div className="flex space-x-6">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61586259749930"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 
                      6.477 2 12c0 4.991 3.657 9.128 8.438 
                      9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 
                      1.492-3.89 3.777-3.89 1.094 0 
                      2.238.195 2.238.195v2.46h-1.26c-1.243 
                      0-1.63.771-1.63 1.562V12h2.773l-.443 
                      2.89h-2.33v6.988C18.343 21.128 22 
                      16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/ancestorii_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2c-2.716 0-3.056.01-4.122.06-1.065.05-1.79.217-2.427.465a4.92 4.92 0 00-1.675 1.09 4.918 4.918 0 00-1.09 1.675c-.248.637-.415 1.362-.465 2.427C2.01 8.944 2 9.284 2 12s.01 3.056.06 4.122c.05 1.065.217 1.79.465 2.427a4.92 4.92 0 001.09 1.675 4.918 4.918 0 001.675 1.09c.637.248 1.362.415 2.427.465C8.944 21.99 9.284 22 12 22s3.056-.01 4.122-.06c1.065-.05 1.79-.217 2.427-.465a4.92 4.92 0 001.675-1.09 4.918 4.918 0 001.09-1.675c.248-.637.415-1.362.465-2.427.05-1.066.06-1.406.06-4.122s-.01-3.056-.06-4.122c-.05-1.065-.217-1.79-.465-2.427a4.92 4.92 0 00-1.09-1.675 4.918 4.918 0 00-1.675-1.09c-.637-.248-1.362-.415-2.427-.465C15.056 2.01 14.716 2 12 2zm0 5.838a4.162 4.162 0 100 8.324 4.162 4.162 0 000-8.324zm0 6.862a2.7 2.7 0 110-5.4 2.7 2.7 0 010 5.4zm4.406-6.862a.972.972 0 11-1.944 0 .972.972 0 011.944 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Legal */}
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

'use client';

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#faf8f4] border-t border-[#e8e1d8]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 lg:gap-16 items-start">

          {/* BRAND */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="text-[1.8rem] font-serif text-[#1a1410]">
              Ancestor<span className="text-[#b8924a]">ii</span>
            </div>

            <p className="mt-4 text-[0.95rem] leading-[1.7] text-[#3d3428]">
              A private place for your family's stories.
            </p>

            {/* FOLLOW */}
            <div className="mt-6">
              <div className="text-[0.7rem] tracking-[0.14em] uppercase text-[#b8924a] mb-3">
                Follow
              </div>

              <div className="flex gap-4">
                {/* Facebook */}
                <a href="https://www.facebook.com/profile.php?id=61586259749930" target="_blank" className="opacity-70 hover:opacity-100">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="https://www.instagram.com/ancestorii_official/" target="_blank" className="opacity-70 hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="3.5" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </a>

                {/* Spotify */}
                <a href="https://open.spotify.com/show/0fR2O7fyOBB98yGlRpRsiJ" target="_blank" className="opacity-70 hover:opacity-100">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.372 0 0 5.373 0 12c0 6.627 5.372 12 12 12 6.627 0 12-5.373 12-12C24 5.373 18.627 0 12 0zm5.52 17.34c-.216.354-.684.462-1.038.246-2.844-1.74-6.42-2.13-10.638-1.158-.408.096-.816-.162-.912-.57-.096-.408.162-.816.57-.912 4.578-1.056 8.52-.6 11.778 1.398.354.216.462.684.246.996zm1.482-3.3c-.27.438-.84.57-1.278.3-3.252-2.004-8.202-2.586-12.06-1.422-.498.15-1.026-.132-1.176-.63-.15-.498.132-1.026.63-1.176 4.326-1.302 9.738-.66 13.548 1.668.438.27.57.84.336 1.26zm.126-3.42c-3.888-2.304-10.302-2.514-14.016-1.38-.6.18-1.242-.162-1.422-.762-.18-.6.162-1.242.762-1.422 4.32-1.314 11.394-1.056 16.02 1.668.546.318.72 1.02.402 1.566-.318.546-1.02.72-1.566.402z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <div className="text-[0.7rem] tracking-[0.14em] uppercase text-[#b8924a] mb-4">
              Explore
            </div>
            <ul className="space-y-2 text-[0.9rem] text-[#1a1410]">
              <li><Link href="/digital-legacy">What is a Digital Legacy?</Link></li>
              <li><Link href="/living-library">What is a Living Library?</Link></li>
              <li><Link href="/moments-worth-keeping">Moments Worth Keeping</Link></li>
              <li><Link href="/compare">Compare Platforms</Link></li>
            </ul>
          </div>

          {/* PRODUCT */}
          <div>
            <div className="text-[0.7rem] tracking-[0.14em] uppercase text-[#b8924a] mb-4">
              Product
            </div>
            <ul className="space-y-2 text-[0.9rem] text-[#1a1410]">
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/memory-books">Memory Books</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/guides">Guides</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <div className="text-[0.7rem] tracking-[0.14em] uppercase text-[#b8924a] mb-4">
              Company
            </div>
            <ul className="space-y-2 text-[0.9rem] text-[#1a1410]">
              <li><Link href="/why-this-exists">Why Ancestorii Exists</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-16 pt-6 border-t border-[#e8e1d8] flex flex-col md:flex-row justify-between text-[0.75rem] text-[#6b5f50]">
          <span>© {new Date().getFullYear()} Ancestorii™. All Rights Reserved.</span>
          <span className="mt-2 md:mt-0">Funded by families. Built for generations.</span>
        </div>

      </div>
    </footer>
  );
}
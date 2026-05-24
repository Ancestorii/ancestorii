import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Living Library vs Digital Vault | What Preserves Family Memories Best?',
  description:
    'What is the difference between a digital vault and a living library? Discover why structure, context, and connection matter when preserving family memories.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/living-library-vs-digital-vault',
  },
};

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 md:space-y-7 xl:space-y-8 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
      {children}
    </div>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 md:my-16 xl:my-20 py-6 md:py-8 xl:py-10 border-l-[3px] border-[#B8932A] pl-6 md:pl-8 xl:pl-10">
      <p className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] leading-[1.35] tracking-[-0.02em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
        {children}
      </p>
    </blockquote>
  );
}

function CompRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex flex-col sm:flex-row border-t border-[#ECE5D8] py-4 md:py-5">
      <div className="sm:w-1/2 text-[14px] md:text-[16px] xl:text-[18px] leading-[1.7] text-[#3D3526]/40 line-through decoration-[#3D3526]/15">
        {left}
      </div>
      <div className="sm:w-1/2 text-[14px] md:text-[16px] xl:text-[18px] leading-[1.7] text-[#181512] font-medium">
        {right}
      </div>
    </div>
  );
}

export default function LivingLibraryVsVaultPage() {
  return (
    <>
      <Script id="article-schema-living-library" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'Living library vs digital vault',
          description: 'Understanding the difference between storing memories and helping them grow.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/living-library-vs-digital-vault' },
          datePublished: '2026-02-17', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-living-library" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'Living Library vs Digital Vault', item: 'https://www.ancestorii.com/guides/living-library-vs-digital-vault' },
          ],
        })}
      </Script>

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>
        <PublicNav />

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-20 md:pb-32 xl:pb-40">

          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Guide</span>
          </div>

          <h1 className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            Living library vs<br />
            <span className="italic text-[#A9782F]">digital vault.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              Both sound like they do the same thing. Both promise to keep your family's memories safe. But they work in completely different ways, and the difference matters more than most people realise.
            </p>
          </Body>

          {/* VAULT SECTION */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              A vault <span className="italic text-[#A9782F]">holds.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  A digital vault is built for security. It takes your files, locks them away, and keeps them safe from damage, loss, or unauthorised access. That is its job and it does it well.
                </p>
                <p>
                  But a vault does not care what is inside it. A photo of your grandmother has the same status as a tax return. A voice recording of your dad telling his favourite story sits next to a scanned utility bill. Everything is treated as data. Nothing is treated as meaning.
                </p>
                <p>
                  You open a vault when you need to retrieve something specific. You do not open it to remember. You do not open it to feel something. You do not open it because your family wants to sit together and look through it on a Sunday afternoon.
                </p>
              </Body>
            </div>
          </div>

          {/* LIVING LIBRARY SECTION */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              A library <span className="italic text-[#A9782F]">grows.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  A living library is built for connection. Every memory links to a person. Every person links to a timeline. Every timeline tells a story that your family can follow, add to, and return to over years.
                </p>
                <p>
                  It is not static. Your mum adds a recipe she has been meaning to write down for years. Your brother uploads photos from a trip nobody else had copies of. Your cousin fills in a name that was on the tip of everyone's tongue but nobody could quite remember. The library grows because your family grows.
                </p>
                <p>
                  You open a living library because you want to. Because something reminded you of a story and you want to read it again. Because your kids asked a question about their grandparents and the answer is right there, in the words of someone who was actually there.
                </p>
              </Body>
            </div>
          </div>

          <PullQuote>
            A vault protects your files.{' '}
            <span className="italic text-[#A9782F]">A library protects your story.</span>
          </PullQuote>

          {/* COMPARISON */}
          <div className="mt-8 md:mt-12">
            <div className="flex flex-col sm:flex-row mb-4">
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#8A7F72] font-semibold">Digital vault</div>
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#B8932A] font-semibold">Living library</div>
            </div>
            <CompRow left="Stores files in folders" right="Connects memories to people" />
            <CompRow left="Organised by file type" right="Organised by meaning and relationships" />
            <CompRow left="One person manages it" right="Your whole family contributes" />
            <CompRow left="Opened when you need a file" right="Opened when you want to remember" />
            <CompRow left="Stays the same once filled" right="Grows with every generation" />
            <CompRow left="Treats everything as data" right="Treats everything as a story" />
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* CLOSING */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <Body>
              <p>
                If your goal is to keep files safe, a vault works. If your goal is to keep your family's story alive, readable, and growing, you need something different. You need a space that cares about what is inside it, not just that it is there.
              </p>
            </Body>
          </div>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                Your family deserves more<br />
                <span className="italic text-[#C8A557]">than a locked folder.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">Build something your family actually wants to open.</p>
              <Link href="/signup" prefetch className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}>
                START FOR FREE
              </Link>
              <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em] text-center">Free forever · No credit card · Takes 2 minutes</p>
            </div>
          </div>
        </div>

        <PublicFooter />
      </main>
    </>
  );
}
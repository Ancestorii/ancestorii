import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'What to Do with Old Family Photos | Ancestorii',
  description:
    'A practical guide on how to preserve old family photos by adding context, stories, and meaning so each image becomes part of a living family library.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos',
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
      <p className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] leading-[1.35] tracking-[-0.02em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
        {children}
      </p>
    </blockquote>
  );
}

function DoNot({ dont, doThis }: { dont: string; doThis: string }) {
  return (
    <div className="border-t border-[#ECE5D8] py-5 md:py-6 flex flex-col sm:flex-row gap-3 sm:gap-8">
      <div className="sm:w-1/2 flex gap-3">
        <span className="shrink-0 text-[#3D3526]/25 font-semibold text-[13px] md:text-[14px] mt-[0.2em]">✕</span>
        <p className="text-[14px] md:text-[16px] xl:text-[18px] leading-[1.7] text-[#3D3526]/45">{dont}</p>
      </div>
      <div className="sm:w-1/2 flex gap-3">
        <span className="shrink-0 text-[#C8A557] font-semibold text-[13px] md:text-[14px] mt-[0.2em]">✓</span>
        <p className="text-[14px] md:text-[16px] xl:text-[18px] leading-[1.7] text-[#181512] font-medium">{doThis}</p>
      </div>
    </div>
  );
}

export default function OldFamilyPhotosPage() {
  return (
    <>
      <Script id="article-schema-old-photos" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'What to do with old family photos',
          description: 'A practical guide on how to preserve old family photos by adding context, stories, and meaning.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-old-photos" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'What to Do with Old Family Photos', item: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos' },
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

          <h1 className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            What to do with<br />
            <span className="italic text-[#A9782F]">old family photos.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              Every family has them. A shoebox in the loft. A drawer that does not close properly because it is stuffed with prints. A folder on a hard drive with three thousand images that nobody has opened since 2016. Hundreds of photos, maybe thousands, and most of them mean absolutely nothing to anyone who was not there when they were taken.
            </p>
            <p>
              That is the problem. Not that the photos are lost, but that the meaning behind them is. The names fade. The dates blur. The stories that made those photos worth taking in the first place live in someone's memory and nowhere else. And memories are not permanent.
            </p>
          </Body>

          <PullQuote>
            The photo survives.{' '}
            <span className="italic text-[#A9782F]">The story behind it usually does not.</span>
          </PullQuote>

          {/* THE REAL PROBLEM */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Scanning is not <span className="italic text-[#A9782F]">preserving.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  Most advice about old photos starts and ends with scanning. Digitise them. Back them up. Put them in the cloud. And yes, that protects the image from physical damage. But a scanned photo with no context is just a higher resolution mystery.
                </p>
                <p>
                  Who are these people? Where was this taken? What year? Why did someone keep this specific photo out of all the ones they could have kept? Those answers are the difference between an image and a memory. And those answers live in people, not in files.
                </p>
              </Body>
            </div>
          </div>

          {/* DO / DONT */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="mb-10 md:mb-14 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              What actually <span className="italic text-[#A9782F]">helps.</span>
            </h2>

            <div className="flex flex-col sm:flex-row mb-4">
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#8A7F72] font-semibold">What most people do</div>
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#B8932A] font-semibold">What actually preserves them</div>
            </div>

            <DoNot dont="Scan everything and dump it in a folder" doThis="Pick ten photos that matter and add context to each one" />
            <DoNot dont="Organise by date or filename" doThis="Organise by person, event, or chapter of life" />
            <DoNot dont="Keep them in a cloud drive nobody opens" doThis="Put them somewhere your family actually wants to return to" />
            <DoNot dont="Wait until you have time to do them all" doThis="Start with one photo this week and add to it over time" />
            <DoNot dont="Assume someone else will remember the details" doThis="Ask now, while the person who knows is still here to tell you" />
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* PRACTICAL START */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Start with <span className="italic text-[#A9782F]">one photo.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  Pick up the photo that catches your eye first. Not the best one. Not the oldest one. The one that makes you stop and think. The one where you can almost hear the conversation that was happening when it was taken.
                </p>
                <p>
                  Write down who is in it. Write down where it was taken if you know, and roughly when. Then write one sentence about why this photo matters. That is it. That is a preserved memory. You have done more than most families ever do.
                </p>
                <p>
                  If someone in your family can tell you more about it, ask them. Sit with them and show them the photo. Do not ask "do you remember this?" Ask "what was happening here?" That second question opens the door to stories you did not know existed.
                </p>
                <p>
                  Then do another one next week. And another the week after that. In a year you will have fifty photos that actually mean something, and that is worth more than three thousand unnamed files in a cloud folder that nobody ever opens.
                </p>
              </Body>
            </div>
          </div>

          <PullQuote>
            A photo with three sentences of context{' '}
            <span className="italic text-[#A9782F]">is worth more than a thousand without.</span>
          </PullQuote>

          {/* CTA */}
          <div className="mt-12 md:mt-20 xl:mt-24 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                Give your photos<br /><span className="italic text-[#C8A557]">the story they deserve.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">Start with one. Add the story. Let it grow.</p>
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
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'How to Capture and Grow Family Memories | Ancestorii',
  description:
    'A practical guide to capturing family memories while life is happening. Learn simple ways to record stories, voices, and moments and grow a living family library over time.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-preserve-family-memories',
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

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6 md:gap-8 xl:gap-10">
      <span className="shrink-0 text-[36px] md:text-[44px] xl:text-[52px] 2xl:text-[58px] leading-none tracking-[-0.03em] text-[#C8A557]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
        {number}
      </span>
      <div>
        <h3 className="text-[18px] md:text-[20px] xl:text-[22px] 2xl:text-[24px] font-semibold text-[#181512] mb-3 md:mb-4">{title}</h3>
        <div className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526] space-y-4 md:space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PreserveFamilyMemoriesPage() {
  return (
    <>
      <Script id="article-schema-preserve-memories" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'How to capture and grow family memories',
          description: 'A practical guide to capturing stories, voices, and meaningful moments while life is happening.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/how-to-preserve-family-memories' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-preserve-memories" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'How to Preserve Family Memories', item: 'https://www.ancestorii.com/guides/how-to-preserve-family-memories' },
          ],
        })}
      </Script>

      <Script id="howto-schema-preserve" type="application/ld+json" strategy="afterInteractive">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to preserve family memories',
    description: 'A practical guide to capturing family memories while life is happening. Five simple ways to start today.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Pick the memory you are most afraid of losing',
        text: 'Not the prettiest photo or the most dramatic story. The one that lives in someone\'s head right now and would disappear if they did. That is your starting point.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Write three sentences about it',
        text: 'Who was there. What happened. Why it mattered. You are not writing a novel. You are leaving a note for the people who come after you. Three sentences is more than most families ever write down.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Ask someone to tell you a story',
        text: 'Call your mum. Visit your grandad. Ask them about a memory they think about often. Just listen, and write it down afterwards while it is still fresh.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Add context to one photo',
        text: 'Pick any photo on your phone. Write who is in it, where it was taken, and what was happening in your life at the time. That is the difference between an image and a memory.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Put it somewhere that lasts',
        text: 'Not a notes app. Not a text message. Not a Google Doc that nobody will ever open again. Put it somewhere intentional, structured, and private. Somewhere your family can find it in ten years without having to search through folders.',
      },
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
            How to preserve<br />
            <span className="italic text-[#A9782F]">family memories.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              Nobody wakes up one morning and decides to let their family history disappear. It happens slowly. A story that used to get told at every gathering stops being told because the person who told it is no longer around. A photo sits in a drawer for so long that nobody remembers who is in it. A recipe lives in one person's head until the day it no longer does.
            </p>
            <p>
              Preserving family memories is not about building an archive. It is about paying attention while you still can.
            </p>
          </Body>

          <PullQuote>
            The best time to capture a memory{' '}
            <span className="italic text-[#A9782F]">is while the person who holds it is still here.</span>
          </PullQuote>

          {/* WHY IT FEELS HARD */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Why it feels <span className="italic text-[#A9782F]">harder than it is.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  Most people think preserving memories means scanning every old photograph, recording hours of interviews, and building some kind of complete family history from scratch. That is not what this is.
                </p>
                <p>
                  The reason most families never start is because the task feels enormous. So they wait. They wait until they have more time, more energy, more photos organised. And then one day they realise they waited too long, because the person who knew the story is gone and the details went with them.
                </p>
                <p>
                  The truth is much simpler. You do not need to do everything. You just need to start doing something.
                </p>
              </Body>
            </div>
          </div>

          {/* STEPS */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="mb-12 md:mb-16 xl:mb-20 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Five ways to <span className="italic text-[#A9782F]">start today.</span>
            </h2>

            <div className="space-y-12 md:space-y-16 xl:space-y-20">
              <Step number="01" title="Pick the memory you are most afraid of losing.">
                <p>Not the prettiest photo or the most dramatic story. The one that lives in someone's head right now and would disappear if they did. That is your starting point.</p>
              </Step>

              <Step number="02" title="Write three sentences about it.">
                <p>Who was there. What happened. Why it mattered. You are not writing a novel. You are leaving a note for the people who come after you. Three sentences is more than most families ever write down.</p>
              </Step>

              <Step number="03" title="Ask someone to tell you a story.">
                <p>Call your mum. Visit your grandad. Ask them about a memory they think about often. Do not record it formally. Just listen, and write it down afterwards while it is still fresh. People speak more naturally when they do not know they are being preserved.</p>
              </Step>

              <Step number="04" title="Add context to one photo.">
                <p>Pick any photo on your phone. Write who is in it, where it was taken, and what was happening in your life at the time. That is the difference between an image and a memory.</p>
              </Step>

              <Step number="05" title="Put it somewhere that lasts.">
                <p>Not a notes app. Not a text message. Not a Google Doc that nobody will ever open again. Put it somewhere intentional, structured, and private. Somewhere your family can find it in ten years without having to search through folders.</p>
              </Step>
            </div>
          </div>

          {/* CLOSING */}
          <PullQuote>
            You do not need a perfect system.{' '}
            <span className="italic text-[#A9782F]">You just need to start before the stories are gone.</span>
          </PullQuote>

          <Body>
            <p>
              A family library is not built in a weekend. It is built one memory at a time, over months and years. The important thing is that you begin. Because every memory you capture today is one your grandchildren will not have to guess about.
            </p>
          </Body>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                One memory today.<br /><span className="italic text-[#C8A557]">A lifetime preserved.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">It takes two minutes to start.</p>
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
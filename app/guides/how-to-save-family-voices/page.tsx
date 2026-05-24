import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'How to Capture and Keep Family Voices | Ancestorii',
  description:
    'A practical guide to capturing family voices and recordings while life is happening. Learn simple ways to record tone, personality, and presence as part of a growing family library.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-save-family-voices',
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

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 md:gap-5">
      <span className="shrink-0 mt-[0.4em] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#C8A557]" />
      <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
        {children}
      </p>
    </div>
  );
}

export default function SaveFamilyVoicesPage() {
  return (
    <>
      <Script id="article-schema-voices" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'How to capture family voices',
          description: 'A practical guide to capturing and preserving family voices.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/how-to-save-family-voices' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-voices" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'How to Save Family Voices', item: 'https://www.ancestorii.com/guides/how-to-save-family-voices' },
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
            How to save<br />
            <span className="italic text-[#A9782F]">family voices.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              You know the way your mum says your name when she is annoyed. The way your dad clears his throat before he tells a long story. The way your grandmother hums something under her breath while she cooks. These are not things you can capture in a photograph. They live in sound, and sound is the first thing we forget.
            </p>
            <p>
              We lose the way someone laughed before we lose their face. We lose the rhythm of their voice before we lose their words. And once it is gone, no amount of photographs will bring it back.
            </p>
          </Body>

          <PullQuote>
            A photograph shows you what someone looked like.{' '}
            <span className="italic text-[#A9782F]">A voice reminds you who they were.</span>
          </PullQuote>

          {/* WHY WE DONT */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Why we never think <span className="italic text-[#A9782F]">to press record.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  Because voices feel permanent. You hear them every day, every phone call, every visit. They are so present in your life that it never occurs to you they could disappear. You take a hundred photos at a family gathering but you do not think to record thirty seconds of your uncle telling that story everyone has heard before.
                </p>
                <p>
                  And then one day you are trying to remember exactly how they sounded, and you cannot. You can remember what they said, roughly. But the tone, the timing, the way they would pause for effect before the punchline. That is gone.
                </p>
              </Body>
            </div>
          </div>

          {/* WHAT TO CAPTURE */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              What is worth <span className="italic text-[#A9782F]">recording.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  It does not need to be a formal interview. It does not need a script or a plan or studio quality audio. Some of the most valuable voice recordings in the world are shaky, noisy, and imperfect. What makes them valuable is that they exist at all.
                </p>
              </Body>

              <div className="mt-8 md:mt-10 space-y-5 md:space-y-6">
                <Tip>Your dad telling the story he has told a hundred times. Record it the hundred and first time. That is the version your grandchildren will hear.</Tip>
                <Tip>Your mum explaining how she makes that dish. Not the recipe. The explanation. The way she talks about it, the shortcuts she takes, the bits she makes up as she goes.</Tip>
                <Tip>Your grandparent describing where they grew up. Not the facts. The feeling. What the street looked like, what the air smelled like, who lived next door.</Tip>
                <Tip>A birthday message. A bedtime story. A laugh. Thirty seconds of someone being themselves, unscripted, unplanned.</Tip>
                <Tip>A phone call you did not expect to matter. Save it. Add a note about when it happened and why it stuck with you.</Tip>
              </div>
            </div>
          </div>

          {/* HOW TO DO IT */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              How to actually <span className="italic text-[#A9782F]">do it.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  <strong>Do not announce it.</strong> The moment you say "I am going to record this" most people freeze. They start performing instead of being themselves. Just open your voice recorder app during a conversation and let it run. You can trim it later.
                </p>
                <p>
                  <strong>Ask one question.</strong> "Tell me about when you first moved here." "What do you remember about your mum's kitchen?" "What is the funniest thing that ever happened at a family gathering?" One question is all it takes. People will talk for ten minutes if the question is right.
                </p>
                <p>
                  <strong>Save it somewhere that lasts.</strong> Not in your voice memos app where it will get buried under grocery reminders and random recordings. Somewhere intentional, private, and connected to the person it belongs to. Somewhere your family can find it in twenty years.
                </p>
                <p>
                  <strong>Add context while it is fresh.</strong> Who is speaking. When it was recorded. What was happening around it. A voice recording without context becomes a mystery in five years. A voice recording with three sentences of explanation becomes a treasure.
                </p>
              </Body>
            </div>
          </div>

          <PullQuote>
            You do not need perfect audio.{' '}
            <span className="italic text-[#A9782F]">You just need to press record before it is too late.</span>
          </PullQuote>

          {/* CTA */}
          <div className="mt-12 md:mt-20 xl:mt-24 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                {`Capture a voice while it's`}<br /><span className="italic text-[#C8A557]">still here to be heard.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">A thirty second recording today. A lifetime of meaning later.</p>
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
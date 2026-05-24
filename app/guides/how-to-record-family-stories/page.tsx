import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'How to Record Family Stories and Voices | Ancestorii',
  description:
    'Learn how to record family stories in a simple, meaningful way. Capture personal memories while life is happening and grow a living family collection over time.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-record-family-stories',
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

function Prompt({ question, context }: { question: string; context: string }) {
  return (
    <div className="py-5 md:py-6 border-t border-[#ECE5D8]">
      <p
        className="text-[18px] md:text-[22px] xl:text-[26px] leading-[1.3] tracking-[-0.01em] text-[#181512] italic"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        &ldquo;{question}&rdquo;
      </p>
      <p className="mt-3 text-[14px] md:text-[15px] xl:text-[17px] leading-[1.7] text-[#3D3526]/55">
        {context}
      </p>
    </div>
  );
}

export default function RecordFamilyStoriesPage() {
  return (
    <>
      <Script id="article-schema-record-stories" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'How to record family stories',
          description: 'A practical guide to recording family stories while life is happening.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/how-to-record-family-stories' },
          datePublished: '2026-02-10', dateModified: '2026-05-22',
        })}
      </Script>

      <Script id="breadcrumb-schema-record-stories" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'How to Record Family Stories', item: 'https://www.ancestorii.com/guides/how-to-record-family-stories' },
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
            How to record<br />
            <span className="italic text-[#A9782F]">family stories.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              Every family has a storyteller. The one who starts talking at dinner and does not stop until someone reminds them their food is cold. The one who remembers the name of every person at a gathering that happened twenty years ago. The one who turns a ten second anecdote into a fifteen minute performance and nobody minds because they are that good at telling it.
            </p>
            <p>
              That person is holding half your family history in their head. And none of it is written down.
            </p>
          </Body>

          <PullQuote>
            Every family has a storyteller.{' '}
            <span className="italic text-[#A9782F]">Most of their stories exist nowhere but their own memory.</span>
          </PullQuote>

          {/* WHY ITS HARD */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Why "tell me a story" <span className="italic text-[#A9782F]">never works.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  If you sit someone down and say "I want to record your stories," they will freeze. They will say they cannot think of any. They will say their life is not that interesting. They will suddenly become the most modest person on earth, despite having told the same eight stories at every family event for the last thirty years.
                </p>
                <p>
                  That is because stories do not work on demand. They come out naturally, triggered by a place, a smell, a photo, a question they were not expecting. The trick is not to make someone tell a story. The trick is to ask the right question and get out of the way.
                </p>
              </Body>
            </div>
          </div>

          {/* QUESTIONS THAT WORK */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="mb-10 md:mb-14 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Questions that <span className="italic text-[#A9782F]">open doors.</span>
            </h2>

            <p className="mb-8 md:mb-10 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
              You do not need a list of fifty questions. You need five or six good ones and the patience to let someone talk. Here are some that tend to unlock the stories nobody thought to tell.
            </p>

            <Prompt question="What is the earliest thing you remember?" context="This almost always leads somewhere unexpected. People remember strange, specific details from childhood that reveal more about a time and place than any history book." />
            <Prompt question="What did your house smell like growing up?" context="Sensory questions bypass the filter. Nobody rehearses an answer about smell. It pulls real, unscripted memories out of people." />
            <Prompt question="What is something your parents did that you did not understand until you were older?" context="This one goes deep. It connects generations and often reveals the quiet sacrifices and decisions that shaped a family without anyone noticing." />
            <Prompt question="What was the funniest thing that ever happened at a family gathering?" context="Laughter opens people up. Once they start laughing about one thing, three more stories follow. Some of the best recordings start here." />
            <Prompt question="What is a tradition your family had that nobody else would understand?" context="Every family has strange rituals. The specific way something was done at Christmas. The game nobody else played. These are the details that make a family story feel real." />
            <Prompt question="Who in the family do you think about the most, and why?" context="This question is quiet and personal. It often leads to the most meaningful stories because it is about connection, not events." />
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* PRACTICAL TIPS */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

            <h2 className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Making it <span className="italic text-[#A9782F]">stick.</span>
            </h2>

            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  <strong>Write it down the same day.</strong> You will remember the details right after the conversation. A week later you will remember that someone told you something good but you will not remember the specifics. Write it while it is fresh. Even bullet points are better than nothing.
                </p>
                <p>
                  <strong>Do not edit their words.</strong> If your grandmother says something in a roundabout way, keep it roundabout. The way someone tells a story is part of the story. Clean it up too much and you lose the person inside it.
                </p>
                <p>
                  <strong>Record more than you think you need.</strong> The best part of a conversation is almost never the part you expected. Let it run. You can always trim later, but you cannot go back and capture something you missed.
                </p>
                <p>
                  <strong>Connect it to a person.</strong> A story floating in a folder is easy to lose. A story attached to a person, a timeline, a chapter of their life, becomes part of something bigger. It has a place. It has context. It means something to the next person who finds it.
                </p>
              </Body>
            </div>
          </div>

          <PullQuote>
            The right question at the right moment{' '}
            <span className="italic text-[#A9782F]">can unlock thirty years of stories.</span>
          </PullQuote>

          {/* CTA */}
          <div className="mt-12 md:mt-20 xl:mt-24 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                The stories are still here.<br /><span className="italic text-[#C8A557]">Start capturing them.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">One story. One question. That is all it takes.</p>
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
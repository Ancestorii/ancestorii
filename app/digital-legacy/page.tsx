import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Legacy: Capture and Grow Your Family Story Digitally',
  description:
    'Discover how to build a living digital legacy by capturing family stories, voices, and everyday moments as they happen — and growing a library your family can return to.',
  alternates: {
    canonical: 'https://www.ancestorii.com/digital-legacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 md:my-16 xl:my-20 py-6 md:py-8 xl:py-10 border-l-[3px] border-[#B8932A] pl-6 md:pl-8 xl:pl-10">
      <p
        className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] leading-[1.35] tracking-[-0.02em] text-[#181512]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {children}
      </p>
    </blockquote>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 md:space-y-7 xl:space-y-8 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
      {children}
    </div>
  );
}

export default function DigitalLegacyPage() {
  return (
    <>
      <PublicNav />

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ━━━ HERO ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-24">

          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
              Digital Legacy
            </span>
          </div>

          <h1
            className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Your family already has<br />
            <span className="italic text-[#A9782F]">a story worth keeping.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              A digital legacy is not something you sit down and create in an afternoon. It is something that builds slowly, one memory at a time, while life is still happening around you.
            </p>
            <p>
              It is your dad's voice telling a story he has told a hundred times. It is the photo your mum keeps in her purse and the reason she keeps it there. It is the recipe your grandmother never measured, the nickname only your uncle uses, the argument at Christmas dinner that became family legend.
            </p>
            <p>
              None of that exists in a cloud folder. None of it survives on social media. And none of it writes itself down.
            </p>
          </Body>
        </div>

        {/* ━━━ PHOTO BREAK ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">
          <div className="flex justify-center">
            <div className="w-full max-w-[88%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] xl:max-w-[50%]" style={{ transform: 'rotate(-1.5deg)' }}>
              <div className="relative">
                <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-[#e3dccb]" />
                <div className="relative bg-white p-2.5 md:p-3 shadow-sm">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
                    <Image src="/family4.jpg" alt="Family sharing stories across generations" fill sizes="(max-width: 640px) 88vw, 55vw" className="object-cover" priority />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-[12px] md:text-[13px] xl:text-[14px] italic text-[#8A7F72]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                The moments between the moments. That is where the real story lives.
              </p>
            </div>
          </div>
        </div>

        {/* ━━━ WHY IT MATTERS ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <Body>
            <p>
              Most families lose their history without realising it is happening. Not in one dramatic moment, but slowly. A detail here, a voice there. A story that used to get told at every gathering until the person who told it was no longer around, and nobody could quite remember how it went.
            </p>
            <p>
              We assume there will always be more time. That the person who knows the recipe will always be there to make it. That the stories will keep getting told. That someone, eventually, will write it all down.
            </p>
            <p>
              But they rarely do. And by the time you notice what is missing, it is already gone.
            </p>
          </Body>

          <PullQuote>
            You do not lose a family's history all at once.{' '}
            <span className="italic text-[#A9782F]">You lose it one forgotten detail at a time.</span>
          </PullQuote>

          <Body>
            <p>
              A digital legacy changes that. Not by turning your family into a project, but by giving you a place to put the things that matter as they come to you. A photo with a few sentences about why it is important. A voice recording of someone you love telling a story in their own words. A date, a name, a detail that would otherwise disappear into the back of someone's memory and stay there until it fades.
            </p>
            <p>
              It does not need to be perfect. It does not need to be complete. It just needs to exist.
            </p>
          </Body>
        </div>

        {/* ━━━ WHAT GETS LOST ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            The problem
          </span>

          <h2
            className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Photos are not{' '}
            <span className="italic text-[#A9782F]">enough.</span>
          </h2>

          <div className="mt-8 md:mt-10 xl:mt-12">
            <Body>
              <p>
                Every family has thousands of photos. On phones, on hard drives, in cloud accounts nobody checks. But a photo without a story is just an image. It tells you what someone looked like, not who they were. It tells you where they stood, not why that place mattered.
              </p>
              <p>
                Cloud storage keeps your files safe. It does not keep your history alive. There is no context, no structure, no connection between one image and the next. Just rows of thumbnails that nobody scrolls through, getting older and more meaningless with every passing year.
              </p>
              <p>
                Social media is worse. Your family memories are wedged between advertisements and strangers' opinions, controlled by an algorithm that decides who sees what and when. You do not own that space. You are borrowing it. And one day the platform will change, or close, or bury your posts so deep that nobody will ever find them again.
              </p>
              <p>
                A digital legacy is different. It is intentional. It is organised. And it belongs to your family.
              </p>
            </Body>
          </div>
        </div>

        {/* ━━━ HOW TO START ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Getting started
          </span>

          <h2
            className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Start with{' '}
            <span className="italic text-[#A9782F]">one thing.</span>
          </h2>

          <div className="mt-8 md:mt-10 xl:mt-12">
            <Body>
              <p>
                The biggest reason families never build a legacy is because it feels overwhelming. Where do you even begin? Do you start from the beginning? Do you need to scan every old photograph? Do you need to sit down with a recorder and interview your grandparents for hours?
              </p>
              <p>
                No. You start with one thing.
              </p>
              <p>
                One photo that means something. One story you have heard a thousand times and can write in five minutes. One detail about a person you love that you do not want to forget. That is it. That is a digital legacy. Everything else builds from there.
              </p>
            </Body>
          </div>

          <PullQuote>
            You do not need to do everything today.{' '}
            <span className="italic text-[#A9782F]">You just need to start before the stories are gone.</span>
          </PullQuote>

          <Body>
            <p>
              Over time, those small additions stack up. A photo becomes an album. An album becomes a timeline. A timeline becomes the story of someone's life told by the people who knew them best. Not a biography written by a stranger. Not a Wikipedia summary. The real thing, in the words of the people who were actually there.
            </p>
            <p>
              That is what a digital legacy becomes when you give it time. Not a task you complete, but a collection that grows alongside your family.
            </p>
          </Body>
        </div>

        {/* ━━━ COMMON QUESTIONS ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Questions
          </span>

          <h2
            className="mt-4 mb-10 md:mb-14 xl:mb-16 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Things people{' '}
            <span className="italic text-[#A9782F]">ask us.</span>
          </h2>

          <Body>
            <p>
              <strong>Is cloud storage not enough?</strong><br />
              Cloud storage keeps files safe. It does not organise your history, add meaning to your photos, or help your grandchildren understand who someone was. It is a hard drive in the sky. A digital legacy is a living collection with structure, context, and intention.
            </p>
            <p>
              <strong>What if I do not have old photos or documents?</strong><br />
              You do not need them. Start with what you have right now. A memory in your head. A story someone told you last week. A photo on your phone from this morning. A legacy is not an archive of the past. It is a record of everything that matters, including today.
            </p>
            <p>
              <strong>What should I capture first?</strong><br />
              Whatever you are most afraid of forgetting. The story your dad always tells. The sound of someone's laugh. The reason behind a tradition that has been in your family for years. Start with the thing that would hurt most to lose.
            </p>
            <p>
              <strong>Can my family contribute?</strong><br />
              Yes. Ancestorii lets you invite family members into your private library so they can add their own memories, fill in gaps, and help build something together. The best family histories are never built by one person alone.
            </p>
          </Body>
        </div>

        {/* ━━━ CTA ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-8 pb-20 md:pb-32 xl:pb-40">

          <div className="mb-14 md:mb-20 xl:mb-24" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <div className="flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p
                className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                One memory today.<br />
                <span className="italic text-[#C8A557]">A lifetime preserved.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
                Free to start. No credit card. Takes two minutes.
              </p>
              <Link
                href="/signup"
                prefetch
                className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90"
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}
              >
                START FOR FREE
              </Link>
              <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em] text-center">
                Free forever · No credit card · Takes 2 minutes
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
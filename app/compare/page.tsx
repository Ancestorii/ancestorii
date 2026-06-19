import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Ancestorii vs StoryWorth vs Remento: Which Family Memory Platform Is Right for You?',
  description: 'An honest comparison of Ancestorii, StoryWorth, and Remento. See how a living family library compares to prompt-based book services — and decide which approach fits your family.',
  alternates: { canonical: 'https://www.ancestorii.com/compare' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Ancestorii vs StoryWorth vs Remento | Honest Comparison',
    description: 'Compare the three leading family memory platforms side by side.',
    url: 'https://www.ancestorii.com/compare',
    siteName: 'Ancestorii',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Ancestorii vs StoryWorth vs Remento comparison' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Ancestorii vs StoryWorth vs Remento', description: 'An honest comparison of the three leading family memory platforms.', images: ['/og-image.jpg'] },
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

function TableRow({ feature, ancestorii, storyworth, remento }: { feature: string; ancestorii: string; storyworth: string; remento: string }) {
  return (
    <tr className="border-t border-[#ECE5D8]">
      <td className="py-4 md:py-5 pr-4 text-[14px] md:text-[15px] xl:text-[16px] font-semibold text-[#181512] align-top">{feature}</td>
      <td className="py-4 md:py-5 px-4 text-[13px] md:text-[14px] xl:text-[15px] text-[#181512] align-top">{ancestorii}</td>
      <td className="py-4 md:py-5 px-4 text-[13px] md:text-[14px] xl:text-[15px] text-[#3D3526]/60 align-top">{storyworth}</td>
      <td className="py-4 md:py-5 pl-4 text-[13px] md:text-[14px] xl:text-[15px] text-[#3D3526]/60 align-top">{remento}</td>
    </tr>
  );
}

function PlatformCard({ name, oneLiner, strengths, bestFor }: { name: string; oneLiner: string; strengths: string[]; bestFor: string }) {
  return (
    <div className="py-10 md:py-12 xl:py-14 border-t border-[#ECE5D8]">
      <h3
        className="text-[24px] md:text-[30px] xl:text-[36px] 2xl:text-[40px] leading-[1.1] tracking-[-0.02em] text-[#181512]"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
      >
        {name}
      </h3>
      <p className="mt-3 text-[15px] md:text-[17px] xl:text-[19px] leading-[1.7] text-[#3D3526]/70 italic">{oneLiner}</p>

      <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
        {strengths.map((s, i) => (
          <div key={i} className="flex gap-4">
            <span className="shrink-0 mt-[0.4em] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#C8A557]" />
            <p className="text-[14px] md:text-[16px] xl:text-[17px] leading-[1.75] text-[#3D3526]">{s}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 md:mt-8 text-[14px] md:text-[15px] xl:text-[16px] leading-[1.7] text-[#181512]">
        <strong>Best for:</strong> <span className="text-[#3D3526]/70">{bestFor}</span>
      </p>
    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <Script id="compare-webpage-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          name: 'Ancestorii vs StoryWorth vs Remento',
          description: 'An honest, side-by-side comparison of three different approaches to preserving family stories.',
          url: 'https://www.ancestorii.com/compare',
          isPartOf: { '@type': 'WebSite', name: 'Ancestorii' },
        })}
      </Script>

      <Script id="compare-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is the difference between Ancestorii and StoryWorth?', acceptedAnswer: { '@type': 'Answer', text: 'StoryWorth sends weekly email prompts to one storyteller over a year, then compiles responses into a printed book. Ancestorii is a living digital library with two layers — a public story feed and a private family space — plus printed Memory Books, Canvas Prints, and Acrylic Prints.' } },
            { '@type': 'Question', name: 'What is the difference between Ancestorii and Remento?', acceptedAnswer: { '@type': 'Answer', text: 'Remento captures voice and video recordings and uses AI to transcribe them into a printed book. Ancestorii combines a persistent digital library with physical heirlooms and gives full creative control over every page of the Memory Book.' } },
            { '@type': 'Question', name: 'Which platform gives the most creative control over the book?', acceptedAnswer: { '@type': 'Answer', text: 'Ancestorii. Both StoryWorth and Remento auto-compile books. Ancestorii gives you a visual page editor where you design every spread yourself.' } },
            { '@type': 'Question', name: 'Is Ancestorii a good StoryWorth alternative in the UK?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Ancestorii is built in the UK and ships worldwide with free delivery. StoryWorth is US-based and charges in dollars.' } },
            { '@type': 'Question', name: 'Do StoryWorth or Remento offer a digital library?', acceptedAnswer: { '@type': 'Answer', text: 'No. Both platforms end with a printed book. Ancestorii is a living library that continues to grow after any book is printed.' } },
          ],
        })}
      </Script>

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>
        <PublicNav />

        {/* ━━━ HERO ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-24">

          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Compare</span>
          </div>

          <h1
            className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Three platforms.<br />
            <span className="italic text-[#A9782F]">Three different ideas.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              StoryWorth, Remento, and Ancestorii all help families preserve memories. But they are built around fundamentally different ideas about what preservation means. One sends you prompts. One records your voice. One builds a library your whole family can grow together.
            </p>
            <p>
              This page is an honest breakdown. We will tell you what each platform does well, where each one falls short, and which one makes sense depending on what your family actually needs.
            </p>
          </Body>
        </div>

        {/* ━━━ EACH PLATFORM ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">The platforms</span>

          <h2
            className="mt-4 mb-4 md:mb-6 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            What each one <span className="italic text-[#A9782F]">actually does.</span>
          </h2>

          <PlatformCard
            name="StoryWorth"
            oneLiner="A weekly email prompt that builds a book over twelve months."
            strengths={[
              'One email per week with a thoughtful question. The storyteller replies, photos are attached, and after a year everything is compiled into a hardcover book.',
              'Over 500 prompts to choose from. The experience is hands off for the gift giver and structured for the writer.',
              'Pioneered this category. Over a million books printed since 2013. They deserve credit for making family storytelling mainstream.',
              'Works beautifully for a single storyteller who enjoys writing to a schedule and is comfortable with email.',
            ]}
            bestFor="Gifting one person a structured writing experience that ends with a single book. Minimal decisions, minimal effort, proven results."
          />

          <PlatformCard
            name="Remento"
            oneLiner="Speak instead of write. AI turns your voice into a polished book."
            strengths={[
              'The storyteller records voice or video responses to prompts. AI transcribes them into polished written stories.',
              'Removes the writing barrier completely. For families where the person with the stories will talk but will not type, this solves a real problem.',
              'The printed book includes QR codes that play the original recordings. So you get the written version and the voice.',
              'The founder built Remento after his mother was diagnosed with cancer. That personal motivation shows in every detail of the product.',
            ]}
            bestFor="Families where the storyteller prefers speaking over writing. Especially powerful when preserving someone's voice matters as much as their words."
          />

          <PlatformCard
            name="Ancestorii"
            oneLiner="A living library with two layers, built for the whole family."
            strengths={[
              'Two distinct spaces. Our Stories is public — share memories with the world, no algorithms, no follower counts, just real stories from real families. My Family is private — only invited family members can see what is inside.',
              'Not built around one storyteller or one year. Your whole family contributes. Timelines, albums, stories, and voice recordings grow together over time.',
              'My Heirlooms lets you turn your library into physical keepsakes. Memory Books designed page by page in a visual editor. Canvas Prints. Acrylic Prints. Things you hold, frame, and pass down.',
              'No prompts. No AI rewriting your words. You write what you want, when you want, in your own voice.',
              'Built in the UK. Free worldwide delivery on all physical products.',
            ]}
            bestFor="Families who want more than a book. A private digital library that grows with every generation, a public space to share stories with the world, and physical heirlooms whenever you are ready."
          />
          <div className="border-t border-[#ECE5D8]" />
        </div>

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]">
          <PullQuote>
            Some platforms build a book.{' '}
            <span className="italic text-[#A9782F]">Ancestorii builds a library your family keeps returning to.</span>
          </PullQuote>
        </div>

        {/* ━━━ TABLE ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Side by side</span>

          <h2
            className="mt-4 mb-10 md:mb-14 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Feature <span className="italic text-[#A9782F]">comparison.</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[480px] sm:min-w-0">
              <thead>
                <tr>
                  <th className="pb-4 pr-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#8A7F72] font-semibold w-[22%]">Feature</th>
                  <th className="pb-4 px-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#B8932A] font-semibold">Ancestorii</th>
                  <th className="pb-4 px-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#8A7F72] font-semibold">StoryWorth</th>
                  <th className="pb-4 pl-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#8A7F72] font-semibold">Remento</th>
                </tr>
              </thead>
              <tbody>
                <TableRow feature="Core concept" ancestorii="Living library + public stories + physical heirlooms" storyworth="Weekly prompts → printed book" remento="Voice recordings → AI written book" />
                <TableRow feature="Public sharing" ancestorii="Yes — Our Stories feed" storyworth="No" remento="No" />
                <TableRow feature="Private family space" ancestorii="Yes — My Family, invite only" storyworth="No" remento="No" />
                <TableRow feature="Digital library" ancestorii="Timelines, albums, stories, profiles" storyworth="No" remento="No" />
                <TableRow feature="Printed book" ancestorii="Memory Book — you design every page" storyworth="Auto compiled hardcover" remento="Auto compiled with QR codes" />
                <TableRow feature="Canvas prints" ancestorii="Yes" storyworth="No" remento="No" />
                <TableRow feature="Acrylic prints" ancestorii="Yes" storyworth="No" remento="No" />
                <TableRow feature="Voice recordings" ancestorii="Yes — stored in library" storyworth="Yes — phone recording" remento="Yes — voice and video" />
                <TableRow feature="Who contributes" ancestorii="Whole family" storyworth="One storyteller" remento="One storyteller" />
                <TableRow feature="Prompt system" ancestorii="No — write freely" storyworth="500+ email prompts" remento="Weekly prompts" />
                <TableRow feature="AI rewrites your words" ancestorii="No" storyworth="No" remento="Yes" />
                <TableRow feature="Continues after the book" ancestorii="Yes — library keeps growing" storyworth="No" remento="No" />
                <TableRow feature="Algorithm or follower counts" ancestorii="No — stories shown in order" storyworth="N/A" remento="N/A" />
                <TableRow feature="Religion and politics" ancestorii="Not allowed on public feed" storyworth="N/A" remento="N/A" />
                <TableRow feature="Worldwide shipping" ancestorii="Free worldwide" storyworth="Free US, extra internationally" remento="Free US, extra internationally" />
                <TableRow feature="Built in" ancestorii="United Kingdom" storyworth="United States" remento="United States" />
              </tbody>
            </table>
            <div className="border-t border-[#ECE5D8] mt-0" />
          </div>
        </div>

        {/* ━━━ COMMON QUESTIONS ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Questions</span>

          <h2
            className="mt-4 mb-10 md:mb-14 xl:mb-16 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            Things people <span className="italic text-[#A9782F]">ask us.</span>
          </h2>

          <Body>
            <p>
              <strong>What is the main difference between Ancestorii and StoryWorth?</strong><br />
              StoryWorth is a book service. One storyteller writes to prompts for a year, and those responses become a book. Ancestorii is a living library with two layers — a public feed for sharing stories with the world, and a private space only your family can see. You can also print Memory Books, Canvas Prints, and Acrylic Prints from your library whenever you want.
            </p>
            <p>
              <strong>What is the main difference between Ancestorii and Remento?</strong><br />
              Remento records your voice and uses AI to rewrite it into a polished book. Ancestorii does not use AI to rewrite anything. Your words stay your words. And instead of ending with a single book, your library keeps growing and you can create physical heirlooms from it at any point.
            </p>
            <p>
              <strong>Which platform gives you the most control over the book?</strong><br />
              Ancestorii. StoryWorth and Remento auto compile books from your content. Ancestorii gives you a visual editor where you design every spread, choose layouts, arrange photos, and control exactly how the finished book looks.
            </p>
            <p>
              <strong>Do I need to print a book to use Ancestorii?</strong><br />
              No. The digital library is the core of the platform. Plenty of families use Ancestorii purely as a private space to capture timelines, albums, stories, and voice recordings without ever printing a physical product.
            </p>
            <p>
              <strong>Can my whole family contribute on Ancestorii?</strong><br />
              Yes. Ancestorii is built for family collaboration. You invite members into your private library and everyone can add stories, upload photos, fill in names, and help build the archive together. StoryWorth and Remento are built around one storyteller per subscription.
            </p>
            <p>
              <strong>Is Ancestorii a good alternative to StoryWorth in the UK?</strong><br />
              Yes. Ancestorii is built in the UK, charges in pounds, and ships all physical products worldwide for free. StoryWorth is US based, charges in dollars, and its prompts lean American. Ancestorii does not use prompts at all — you write and record freely at your own pace.
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
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
              >
                More than a book.<br />
                <span className="italic text-[#C8A557]">A library that lasts.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
                Free to start. No credit card. No prompts. No AI rewriting your words.
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

        <PublicFooter />
      </main>
    </>
  );
}
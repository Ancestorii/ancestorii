import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

const SITE = 'https://www.ancestorii.com';

export const metadata: Metadata = {
  title: 'The Best StoryWorth Alternative for 2026 | Ancestorii',
  description:
    'Looking for a StoryWorth alternative? See how Ancestorii compares — a living family library with a private space, a public story feed, and printed Memory Books you design yourself. Built in the UK, ships worldwide.',
  alternates: { canonical: `${SITE}/compare/storyworth-alternative` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'The Best StoryWorth Alternative | Ancestorii',
    description:
      'A living family library instead of a one year prompt service. See how Ancestorii compares to StoryWorth.',
    url: `${SITE}/compare/storyworth-alternative`,
    siteName: 'Ancestorii',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Ancestorii, a StoryWorth alternative' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Best StoryWorth Alternative | Ancestorii',
    description: 'A living family library instead of a one year prompt service.',
    images: ['/og-image.jpg'],
    creator: '@ancestorii',
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

function TableRow({ feature, ancestorii, storyworth }: { feature: string; ancestorii: string; storyworth: string }) {
  return (
    <tr className="border-t border-[#ECE5D8]">
      <td className="py-4 md:py-5 pr-4 text-[14px] md:text-[15px] xl:text-[16px] font-semibold text-[#181512] align-top">{feature}</td>
      <td className="py-4 md:py-5 px-4 text-[13px] md:text-[14px] xl:text-[15px] text-[#181512] align-top">{ancestorii}</td>
      <td className="py-4 md:py-5 pl-4 text-[13px] md:text-[14px] xl:text-[15px] text-[#3D3526]/60 align-top">{storyworth}</td>
    </tr>
  );
}

const FAQ = [
  {
    q: 'What is the best alternative to StoryWorth?',
    a: 'It depends on what you want. If you want more than a single book, Ancestorii is the strongest alternative. StoryWorth sends one storyteller weekly email prompts for a year and compiles the replies into a hardcover. Ancestorii is a living family library with a private space for your family and a public story feed, plus printed Memory Books, Canvas Prints, and Acrylic Prints you design yourself.',
  },
  {
    q: 'Is there a StoryWorth alternative in the UK?',
    a: 'Yes. Ancestorii is built in the UK, charges in pounds, and ships all physical products worldwide. StoryWorth is US based, charges in dollars, and its prompts lean American. Ancestorii uses no prompts at all, so you write and record freely at your own pace.',
  },
  {
    q: 'How is Ancestorii different from StoryWorth?',
    a: 'StoryWorth is a book service built around one storyteller and one year. Ancestorii is a permanent digital library the whole family can add to, with timelines, albums, stories, and voice recordings that keep growing. You can turn any of it into physical heirlooms whenever you want, and you design every page yourself rather than letting it auto compile.',
  },
  {
    q: 'Is Ancestorii cheaper than StoryWorth?',
    a: 'Ancestorii has a free forever plan, so you can build a family library at no cost and only pay if you choose to print something or upgrade. StoryWorth charges a yearly fee per book. The two are priced around different ideas, so the better question is whether you want one book or a library that lasts.',
  },
  {
    q: 'Can the whole family contribute, not just one person?',
    a: 'Yes. Ancestorii is built for family collaboration. You invite members into your private library and everyone can add stories, upload photos, and help build the archive together. StoryWorth is built around one storyteller per subscription.',
  },
  {
    q: 'Does my content disappear after the book is printed?',
    a: 'No. With StoryWorth the experience ends with the book. With Ancestorii the library is the core of the product and keeps growing after any book is printed. You can create more heirlooms from it at any point in the future.',
  },
];

export default function StoryworthAlternativePage() {
  return (
    <>
      <Script id="sw-alt-webpage-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebPage',
          name: 'The best StoryWorth alternative',
          description: 'How Ancestorii compares to StoryWorth as a way to preserve family stories.',
          url: `${SITE}/compare/storyworth-alternative`,
          isPartOf: { '@id': `${SITE}/#website` },
        })}
      </Script>

      <Script id="sw-alt-breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE}/compare` },
            { '@type': 'ListItem', position: 3, name: 'StoryWorth alternative', item: `${SITE}/compare/storyworth-alternative` },
          ],
        })}
      </Script>

      <Script id="sw-alt-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQ.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        })}
      </Script>

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>
        <PublicNav />

        {/* HERO */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-24">
          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <Link href="/compare" className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold hover:text-[#A9782F] transition">Compare</Link>
          </div>

          <h1 className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            A StoryWorth alternative<br />
            <span className="italic text-[#A9782F]">that does not end with the book.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              StoryWorth helped make family storytelling mainstream, and it does one thing genuinely well. It sends a weekly prompt to one person for a year, then turns their answers into a hardcover book. If that is exactly what you want, it is a lovely gift.
            </p>
            <p>
              But many families want something the book model cannot give them. A space the whole family can add to. Something that keeps going after the twelve months are up. Stories in their own words rather than answers to set prompts. That is the gap Ancestorii was built to fill.
            </p>
          </Body>
        </div>

        {/* WHY LOOK */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-12 md:pb-16">
          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">The honest version</span>
          <h2 className="mt-4 mb-6 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Why people look <span className="italic text-[#A9782F]">for an alternative.</span>
          </h2>
          <Body>
            <p>
              It is built around one storyteller. StoryWorth works beautifully for a single person writing to prompts, but it is not designed for a whole family contributing together.
            </p>
            <p>
              It ends. After a year, the book is printed and the experience is over. There is no living library that keeps growing as life carries on.
            </p>
            <p>
              The prompts are fixed. Some people love them. Others find that being asked the same set questions produces tidy answers rather than the stories they actually wanted to tell.
            </p>
            <p>
              It is priced in dollars and built for the US. For families in the UK and elsewhere, the prompts, the pricing, and the shipping all assume you are somewhere you are not.
            </p>
          </Body>
        </div>

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]">
          <PullQuote>
            StoryWorth gives a family one book.{' '}
            <span className="italic text-[#A9782F]">Ancestorii gives them a library that keeps growing.</span>
          </PullQuote>
        </div>

        {/* TABLE */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] py-16 md:py-24">
          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Side by side</span>
          <h2 className="mt-4 mb-10 md:mb-14 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Ancestorii vs <span className="italic text-[#A9782F]">StoryWorth.</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[440px] sm:min-w-0">
              <thead>
                <tr>
                  <th className="pb-4 pr-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#8A7F72] font-semibold w-[26%]">Feature</th>
                  <th className="pb-4 px-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#B8932A] font-semibold">Ancestorii</th>
                  <th className="pb-4 pl-4 text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#8A7F72] font-semibold">StoryWorth</th>
                </tr>
              </thead>
              <tbody>
                <TableRow feature="Core concept" ancestorii="Living library + public stories + heirlooms" storyworth="Weekly prompts → one printed book" />
                <TableRow feature="Who contributes" ancestorii="The whole family" storyworth="One storyteller per subscription" />
                <TableRow feature="Continues after the book" ancestorii="Yes — the library keeps growing" storyworth="No — ends after a year" />
                <TableRow feature="Prompt system" ancestorii="None — write freely" storyworth="500+ fixed email prompts" />
                <TableRow feature="Private family space" ancestorii="Yes — invite only" storyworth="No" />
                <TableRow feature="Public story feed" ancestorii="Yes — Our Stories" storyworth="No" />
                <TableRow feature="Voice recordings" ancestorii="Yes — kept in the library" storyworth="Limited" />
                <TableRow feature="Book design control" ancestorii="You design every page" storyworth="Auto compiled" />
                <TableRow feature="Canvas and acrylic prints" ancestorii="Yes" storyworth="No" />
                <TableRow feature="Free plan" ancestorii="Yes — free forever" storyworth="No" />
                <TableRow feature="Built in / pricing" ancestorii="United Kingdom, in pounds" storyworth="United States, in dollars" />
                <TableRow feature="Worldwide shipping" ancestorii="Ships worldwide" storyworth="Free US, extra internationally" />
              </tbody>
            </table>
            <div className="border-t border-[#ECE5D8]" />
          </div>
          <p className="mt-6 text-[13px] md:text-[14px] text-[#3D3526]/60">
            Want the full picture?{' '}
            <Link href="/compare" className="text-[#A9782F] underline underline-offset-2 hover:text-[#181512] transition">Compare Ancestorii, StoryWorth, and Remento side by side.</Link>
          </p>
        </div>

        {/* FAQ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">
          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Questions</span>
          <h2 className="mt-4 mb-10 md:mb-14 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            Things people <span className="italic text-[#A9782F]">ask us.</span>
          </h2>
          <Body>
            {FAQ.map((item, i) => (
              <p key={i}>
                <strong>{item.q}</strong>
                <br />
                {item.a}
              </p>
            ))}
          </Body>
        </div>

        {/* CTA */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-8 pb-20 md:pb-32 xl:pb-40">
          <div className="mb-14 md:mb-20 xl:mb-24" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
          <div className="flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                More than a book.<br /><span className="italic text-[#C8A557]">A library that lasts.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">Free to start. No credit card. No prompts. Built in the UK.</p>
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

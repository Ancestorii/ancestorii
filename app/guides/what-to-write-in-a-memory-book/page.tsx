import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'What to Write in a Memory Book | Ancestorii',
  description:
    'A practical guide to what to write in a memory book, what to include on every page, and how to turn scattered memories into a keepsake your family will actually return to.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book',
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

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-6 md:gap-8 xl:gap-10">
      <span className="shrink-0 text-[36px] md:text-[44px] xl:text-[52px] 2xl:text-[58px] leading-none tracking-[-0.03em] text-[#C8A557]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
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

export default function WhatToWriteInAMemoryBookPage() {
  return (
    <>
      <Script id="article-schema-memory-book" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'What to write in a memory book',
          description: 'A practical guide to what to write in a memory book and what to include on every page.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book' },
          datePublished: '2026-06-20', dateModified: '2026-06-20',
        })}
      </Script>

      <Script id="breadcrumb-schema-memory-book" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'What to Write in a Memory Book', item: 'https://www.ancestorii.com/guides/what-to-write-in-a-memory-book' },
          ],
        })}
      </Script>

      <Script id="howto-schema-memory-book" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'What to write in a memory book',
          description: 'Five things to include so a memory book becomes a keepsake your family returns to.',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Start with the story, not the photo', text: 'Write what was actually happening when the picture was taken. Who was there, what it felt like, and why the moment mattered.' },
            { '@type': 'HowToStep', position: 2, name: 'Add the small specific details', text: 'The name of the street, the song on the radio, the smell of the kitchen. Specifics are what make a memory feel alive years later.' },
            { '@type': 'HowToStep', position: 3, name: 'Write in your own voice', text: 'Do not write like a textbook. Write the way you would tell it out loud to someone you love, in your own words.' },
            { '@type': 'HowToStep', position: 4, name: 'Include the people, not just the events', text: 'Describe what someone was like, not only what they did. A turn of phrase, a habit, a kindness. That is what people forget first.' },
            { '@type': 'HowToStep', position: 5, name: 'End each page with why it is here', text: 'A single line on why this memory earned its place tells the next generation what mattered to you, and why.' },
          ],
        })}
      </Script>

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>
        <PublicNav />

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-20 md:pb-32 xl:pb-40">

          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <Link href="/guides" className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold hover:text-[#A9782F] transition">Guide</Link>
          </div>

          <h1 className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            What to write in<br />
            <span className="italic text-[#A9782F]">a memory book.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              A blank page is intimidating. You have the photographs, you have the memories, and yet the moment you sit down to write something it all feels either too small to bother with or too big to begin. So the book stays empty, and the stories stay in your head.
            </p>
            <p>
              The truth is that a memory book is not an essay. It is a series of small, honest captures. You do not need to be a writer. You need to write down what you would say if you were sitting beside someone, turning the pages together.
            </p>
          </Body>

          <PullQuote>
            A photo shows what happened.{' '}
            <span className="italic text-[#A9782F]">The words tell us why it mattered.</span>
          </PullQuote>

          {/* WHAT MAKES ONE WORTH KEEPING */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
            <h2 className="text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              What makes one <span className="italic text-[#A9782F]">worth keeping.</span>
            </h2>
            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  The memory books families treasure are never the ones with the most pages. They are the ones where you can hear the person who made them. A grandmother’s dry humour. A father noting, almost in passing, how proud he was. That is the difference between a photo album and an heirloom.
                </p>
                <p>
                  You get there not by writing more, but by writing truer. A few real sentences on a page will outlast a paragraph of polished nothing.
                </p>
              </Body>
            </div>
          </div>

          {/* THE FIVE THINGS */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
            <h2 className="mb-12 md:mb-16 xl:mb-20 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Five things to <span className="italic text-[#A9782F]">put on the page.</span>
            </h2>
            <div className="space-y-12 md:space-y-16 xl:space-y-20">
              <Step number="01" title="Start with the story, not the photo.">
                <p>The image is the prompt, not the point. Write what was actually happening when it was taken. Who was there, what you were laughing about, what you did not yet know was about to change.</p>
              </Step>
              <Step number="02" title="Add the small specific details.">
                <p>The name of the street. The song on the radio. The smell of the kitchen on a Sunday. Specifics are what make a memory feel alive when someone reads it forty years from now.</p>
              </Step>
              <Step number="03" title="Write in your own voice.">
                <p>Do not write like a museum caption. Write the way you would tell it out loud to someone you love. If you would say it with a laugh, write it with a laugh.</p>
              </Step>
              <Step number="04" title="Include the people, not just the events.">
                <p>Describe what someone was like, not only what they did. A turn of phrase they always used. A habit. A kindness nobody else saw. That is what people forget first, and miss most.</p>
              </Step>
              <Step number="05" title="End each page with why it is here.">
                <p>One line on why this memory earned its place. It is the most important sentence on the page, because it tells the people who come after you exactly what mattered to you, and why.</p>
              </Step>
            </div>
          </div>

          <PullQuote>
            You are not making a book.{' '}
            <span className="italic text-[#A9782F]">You are leaving a voice behind.</span>
          </PullQuote>

          <Body>
            <p>
              With Ancestorii, you do not write into a void and hope it comes together. Your memories already live in your family library as stories, photos, and voice recordings. When you are ready, you arrange them into a Memory Book, designing each page yourself and printing a keepsake your family can hold. The words you write today become the pages they keep.
            </p>
            <p>
              If you would like more help capturing the raw material first, our guide on{' '}
              <Link href="/guides/how-to-preserve-family-memories" className="text-[#A9782F] underline underline-offset-2 hover:text-[#181512] transition">how to preserve family memories</Link>{' '}
              is a good place to begin.
            </p>
          </Body>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                Fill the first page.<br /><span className="italic text-[#C8A557]">The book follows.</span>
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

'use client';

import Image from 'next/image';
import Link from 'next/link';

/* ─── Pull quote ─── */
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 md:my-16 xl:my-20 py-6 md:py-8 xl:py-10 border-l-[3px] border-[#B8932A] pl-6 md:pl-8 xl:pl-10">
      <p className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] leading-[1.35] tracking-[-0.02em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
        {children}
      </p>
    </blockquote>
  );
}

/* ─── Body ─── */
function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 md:space-y-7 xl:space-y-8 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
      {children}
    </div>
  );
}

/* ─── Section divider ─── */
function Divider() {
  return <div className="my-16 md:my-20 xl:my-24" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />;
}

/* ─── FAQ Item ─── */
function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="py-6 md:py-7 xl:py-8 border-b border-[#ECE5D8]">
      <h3 className="text-[16px] md:text-[18px] xl:text-[20px] 2xl:text-[22px] font-medium text-[#181512] mb-2 md:mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {q}
      </h3>
      <p className="text-[14px] md:text-[16px] xl:text-[18px] 2xl:text-[19px] leading-[1.8] text-[#4A4030]">
        {a}
      </p>
    </div>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  { name: 'Alison', location: 'Nevada, United States', quote: 'I walked past my dad\u2019s room and caught him looking through his memory book again. That\u2019s the third time this week. Ancestorii helped me turn years of photos into something he genuinely treasures.', image: '/Testimonial2.png' },
  { name: 'Nicole', location: 'Nampa, United States', quote: 'In my case, I have external hard drives full of photos I never get to see, but Ancestorii finally gave those memories a place where they can be easily enjoyed and shared.', image: '/testimonial1.png' },
  { name: 'Andrea', location: 'Dudley, United Kingdom', quote: 'I recently lost my dad, so this book became incredibly special. It captured the essence of him and the life he lived. Our family will treasure it for years to come.', image: '/testimonial4.png' },
  { name: 'Erin', location: 'United Kingdom', quote: 'Ancestorii feels less like cloud storage and more like a living family archive. Beautifully designed and genuinely meaningful.', image: '/Testimonial5.png' },
];

function Star() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="#C8A557" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

/* ─── MAIN ─── */
export default function MemoryBooksContent() {
  const px = "px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]";

  return (
    <div className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ━━━ HERO ━━━ */}
      <div className={`${px} pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-0`}>
        <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
          <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">From Screen to Shelf</span>
        </div>

        <h1 className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-5 md:mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          Your photos deserve<br />
          more than <span className="italic text-[#A9782F]">a phone.</span>
        </h1>

        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

        <Body>
          <p>
            Hundreds of photos sit on your phone right now. Thousands, probably. And behind every single one of them is a story that nobody else knows. A Memory Book takes those photos and those stories and turns them into something real. A hardcover book, professionally printed, delivered to your door. Something your family can hold, open, and pass down.
          </p>
        </Body>
      </div>

      {/* ━━━ WHAT IS IT ━━━ */}
      <div className={`${px} pb-4`}>

        <PullQuote>
          A photograph captures a moment.{' '}
          <span className="italic text-[#A9782F]">A Memory Book captures why that moment mattered.</span>
        </PullQuote>

        <Body>
          <p>
            Think about the difference between a photo of your grandmother in her kitchen and a page that shows that photo alongside the story of what she was cooking that day, why she always used that same pan, and the recipe she never once wrote down. That is what a Memory Book does. It gives the photo a voice.
          </p>
        </Body>
      </div>

      <div className={px}><Divider /></div>

      {/* ━━━ FULL CREATIVE CONTROL ━━━ */}
      <div className={`${px} pb-4`}>
        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Your Book, Your Way</span>

        <h2 className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-8 md:mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          Full creative control<br />
          <span className="italic text-[#A9782F]">over every page.</span>
        </h2>

        <Body>
          <p>
            Most memory book services use rigid question and answer templates or auto generated layouts. You answer prompts, they arrange a book for you. It looks the same as everyone else's book because the template decides the structure, not you.
          </p>
          <p>
            Ancestorii works differently. You design each page yourself using a visual editor. Drag photos, add text, choose from multiple layouts, and decide exactly how your story is told. Your book reflects your family the way you want to tell it, not the way a template decides for you.
          </p>
          <p>
            See how Ancestorii compares to other family memory book services like{' '}
            <Link href="/compare" className="text-[#B8932A] hover:text-[#96751E] underline-offset-2 underline">StoryWorth and Remento</Link>.
          </p>
        </Body>
      </div>

      <div className={px}><Divider /></div>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <div className={`${px} pb-4`}>
        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">How It Works</span>

        <h2 className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-8 md:mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          Three steps.{' '}
          <span className="italic text-[#A9782F]">One book.</span>
        </h2>

        <div className="space-y-0 mb-10 md:mb-12">
          {[
            { num: '01', title: 'Choose your photos and write the stories behind them', text: 'Pick the moments that matter from your family library. Add the context, the voices, the details that turn a photo into a memory.' },
            { num: '02', title: 'Design every page using the visual editor', text: 'Arrange layouts, position text, preview your book spread by spread. Full control, no templates, no restrictions.' },
            { num: '03', title: 'Order and we print it as a hardcover book', text: 'Printed on 200gsm gloss pages with a hardcover matte finish. Delivered to your door. Order as many copies as you need.' },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-5 md:gap-6 xl:gap-8 py-6 md:py-7 xl:py-8 border-b border-[rgba(95,78,43,0.08)]">
              <span className="flex-shrink-0 text-[14px] md:text-[16px] xl:text-[18px] font-semibold text-[#B8932A] mt-[2px]" style={{ letterSpacing: '0.08em', minWidth: '2rem' }}>{step.num}</span>
              <div>
                <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] font-medium text-[#181512] mb-1.5">{step.title}</p>
                <p className="text-[14px] md:text-[15px] lg:text-[16px] xl:text-[18px] 2xl:text-[19px] leading-[1.75] text-[#4A4030]">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <Body>
          <p>
            Order as many copies as you need. One for yourself, one for your parents, one for a sibling. The same book, shared across the people who matter.
          </p>
        </Body>
      </div>

      <div className={px}><Divider /></div>

      {/* ━━━ A GIFT ━━━ */}
      <div className={`${px} pb-4`}>
        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">More Than a Gift</span>

        <h2 className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-8 md:mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          A gift that actually{' '}
          <span className="italic text-[#A9782F]">means something.</span>
        </h2>

        <Body>
          <p>
            Most gifts get forgotten. A Memory Book does not. It is a printed collection of real family stories, designed by someone who lived them, handed to someone who needs to hold them. For a birthday, an anniversary, Mother's Day, Father's Day, or simply because the stories deserve to exist somewhere other than your phone.
          </p>
        </Body>

        <PullQuote>
          The photos were on my phone for years.{' '}
          <span className="italic text-[#A9782F]">Now they are on my shelf forever.</span>
        </PullQuote>
      </div>

      <div className={px}><Divider /></div>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <div className={`${px} pb-4`}>
        <div className="text-center mb-10 md:mb-14 xl:mb-16">
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">From Our Families</span>
          <h2 className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            Memories <span className="italic text-[#A9782F]">finally</span> given a home.
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} />)}</div>
            <div className="h-px w-6 bg-[#B8932A]/30" />
            <span className="text-[10px] md:text-[11px] tracking-[0.14em] uppercase text-[#B8932A] font-semibold">Real Stories</span>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="block md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {testimonials.map((t) => (
              <div key={t.name} className="flex-shrink-0 w-[82vw] max-w-[380px] snap-center">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
          <p className="text-center text-[12px] text-[#B8932A] font-medium mt-4 tracking-[0.06em]">Swipe for more →</p>
        </div>

        {/* Tablet: 2 col */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-5">{testimonials.map((t) => <TestimonialCard key={t.name} t={t} />)}</div>

        {/* Desktop: 4 col */}
        <div className="hidden lg:grid grid-cols-4 gap-5 xl:gap-6">{testimonials.map((t) => <TestimonialCard key={t.name} t={t} />)}</div>
      </div>

      <div className={px}><Divider /></div>

      {/* ━━━ FAQ ━━━ */}
      <div className={`${px} pb-4`}>
        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Common Questions</span>

        <h2 className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-8 md:mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          Questions about{' '}
          <span className="italic text-[#A9782F]">Memory Books.</span>
        </h2>

        <div className="border-t border-[#ECE5D8]">
          <FAQ q="How is this different from a regular photo book?" a="Photo books display images. Memory Books preserve stories. Each page can combine photographs with written context, personal reflections, and the meaning behind a moment. Not just the image itself." />
          <FAQ q="Do I need design experience?" a="No. The visual editor is built so anyone can arrange pages naturally. Drag photos, add text, adjust layouts. The design stays clean without needing professional skills." />
          <FAQ q="How are Memory Books printed and delivered?" a="Memory Books are professionally printed as hardcover books and shipped directly to your door. Print quality is handled by a specialist fulfilment partner to ensure every book feels like a keepsake." />
          <FAQ q="Can I order multiple copies?" a="Yes. Once your book is designed, order as many copies as you need. For family members, as gifts, or to keep for different branches of your family." />
          <FAQ q="What makes this different from StoryWorth or other services?" a="Most services use a question and answer format to auto generate a book from responses. Ancestorii gives you full creative control. You decide the layout, the stories, the photos, and the structure. Your book looks exactly the way you want it to." />
          <FAQ q="Is a Memory Book a good gift?" a="It is one of the most personal gifts you can give. A printed collection of family stories, designed by someone who was there, for a birthday, anniversary, or simply because the stories deserve to exist on a shelf." />
        </div>
      </div>

      {/* ━━━ CTA ━━━ */}
      <div className={`${px} pt-8 pb-20 md:pb-32 xl:pb-40`}>
        <Divider />
        <div className="flex justify-center">
          <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
            <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
              Your stories deserve more than{' '}<span className="italic text-[#C8A557]">a phone screen.</span>
            </p>
            <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">Turn them into something your family can hold.</p>
            <Link href="/signup" prefetch className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}>
              START DESIGNING YOUR BOOK
            </Link>
            <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em] text-center">No credit card required · Takes 2 minutes</p>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
      `}</style>
    </div>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ t }: { t: { name: string; location: string; quote: string; image: string } }) {
  return (
    <div className="overflow-hidden flex flex-col border border-[rgba(184,147,42,0.12)]" style={{ boxShadow: '0 20px 60px rgba(42,31,17,0.06)' }}>
      <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[360px] xl:h-[420px] 2xl:h-[480px] flex-shrink-0">
        <img src={t.image} alt={`${t.name} with their Ancestorii Memory Book`} className="absolute inset-0 w-full h-full object-cover brightness-[0.92] contrast-[1.05]" style={{ objectPosition: '50% 15%' }} />
      </div>
      <div className="relative flex flex-col justify-between flex-1 p-5 md:p-6 xl:p-7" style={{ background: 'linear-gradient(160deg, #F5EDDA 0%, #EDE3CB 100%)' }}>
        <div>
          <svg width="22" height="16" viewBox="0 0 32 24" fill="#B8932A" className="mb-3 opacity-35"><path d="M0 24V14.4C0 6.08 4.48 1.12 13.44 0l1.28 3.2C9.28 4.48 7.04 8 6.72 12H12v12H0zm18.56 0V14.4C18.56 6.08 23.04 1.12 32 0l1.28 3.2c-5.44 1.28-7.68 4.8-8 8.8h5.28v12H18.56z" /></svg>
          <blockquote className="text-[14px] md:text-[15px] xl:text-[16px] leading-[1.55] text-[#181512] italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t.quote}
          </blockquote>
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-[11px] md:text-[12px] font-semibold text-[#181512] uppercase tracking-[0.12em]">{t.name}</p>
          <p className="text-[10px] md:text-[11px] text-[#B8932A] mt-0.5 uppercase tracking-[0.1em] font-medium">{t.location}</p>
        </div>
      </div>
    </div>
  );
}
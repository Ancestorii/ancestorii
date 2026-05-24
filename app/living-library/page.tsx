import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Is a Living Library? | A New Way to Preserve Family Stories',
  description:
    'Discover what a living library is and how it differs from simple digital storage. Learn how stories, voices, and memories can grow over time in one intentional space.',
  alternates: {
    canonical: 'https://www.ancestorii.com/living-library',
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

function NumberedItem({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-5 md:gap-7 xl:gap-8">
      <span
        className="shrink-0 text-[28px] md:text-[34px] xl:text-[40px] 2xl:text-[46px] leading-none tracking-[-0.03em] text-[#C8A557]/40"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
      >
        {number}
      </span>
      <div>
        <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
          <strong className="text-[#181512]">{title}</strong><br />
          {body}
        </p>
      </div>
    </div>
  );
}

function ComparisonRow({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
      <div className="sm:w-1/2 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]/50 line-through decoration-[#3D3526]/20">
        {left}
      </div>
      <div className="sm:w-1/2 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#181512] font-medium">
        {right}
      </div>
    </div>
  );
}

export default function LivingLibraryPage() {
  return (
    <>
      <PublicNav />

      <main className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ━━━ HERO ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-24">

          <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
            <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
            <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
              Living Library
            </span>
          </div>

          <h1
            className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Not a vault.<br />
            <span className="italic text-[#A9782F]">A living thing.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              A living library is what happens when you stop treating family memories like files and start treating them like what they actually are. Stories. Voices. Context. The kind of detail that makes a photo worth looking at thirty years from now instead of just scrolling past it.
            </p>
            <p>
              It is not a backup. It is not a folder. It is a space that grows with your family, where every memory connects to the people and moments around it.
            </p>
          </Body>
        </div>

        {/* ━━━ STORAGE VS LIVING LIBRARY ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            The difference
          </span>

          <h2
            className="mt-4 mb-10 md:mb-14 xl:mb-16 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Storage keeps files.{' '}
            <span className="italic text-[#A9782F]">This keeps meaning.</span>
          </h2>

          <div className="space-y-6 md:space-y-7 xl:space-y-8">
            {/* Column headers */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 mb-2">
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#8A7F72] font-semibold">
                Traditional storage
              </div>
              <div className="sm:w-1/2 text-[12px] md:text-[13px] xl:text-[14px] tracking-[0.14em] uppercase text-[#B8932A] font-semibold">
                A living library
              </div>
            </div>

            <div className="border-t border-[#ECE5D8] pt-6 md:pt-7 xl:pt-8 space-y-5 md:space-y-6">
              <ComparisonRow left="Files sit in folders" right="Memories connect to people" />
              <ComparisonRow left="Photos have no context" right="Every photo has a story behind it" />
              <ComparisonRow left="One person uploads everything" right="Your whole family contributes" />
              <ComparisonRow left="You forget it exists" right="You want to come back to it" />
              <ComparisonRow left="Organised by date" right="Organised by meaning" />
              <ComparisonRow left="A backup of what happened" right="A record of why it mattered" />
            </div>
          </div>
        </div>

        {/* ━━━ WHAT MAKES IT LIVING ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            What makes it living
          </span>

          <h2
            className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            It grows with{' '}
            <span className="italic text-[#A9782F]">your family.</span>
          </h2>

          <div className="mt-10 md:mt-14 xl:mt-16 space-y-10 md:space-y-12 xl:space-y-14">
            <NumberedItem
              number="01"
              title="It is never finished."
              body="A living library does not have a deadline. You add a memory when it comes to you. A story after a phone call. A photo after a visit. It grows at your pace, on your terms, for as long as you want it to."
            />
            <NumberedItem
              number="02"
              title="It connects things."
              body="A photo links to a person. A person links to a timeline. A timeline tells a life story. Nothing sits alone. Everything has context, and that context is what makes it worth returning to."
            />
            <NumberedItem
              number="03"
              title="More than one person builds it."
              body="Your mum adds a recipe. Your brother uploads photos from a trip you forgot about. Your aunt fills in a name nobody else remembered. A living library is a shared act, not a solo project."
            />
            <NumberedItem
              number="04"
              title="It survives beyond a device."
              body="Phones break. Laptops get replaced. Social media accounts get abandoned. A living library is a permanent home for the things that matter. And if you want, you can turn it into a physical book you hold in your hands."
            />
          </div>
        </div>

        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]">
  <PullQuote>
    A folder stores what happened.{' '}
    <span className="italic text-[#A9782F]">A living library preserves why it mattered.</span>
  </PullQuote>
</div>

        {/* ━━━ WHO IS IT FOR ━━━ */}
        <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pb-16 md:pb-24">

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Who this is for
          </span>

          <h2
            className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            You already know{' '}
            <span className="italic text-[#A9782F]">if this is for you.</span>
          </h2>

          <div className="mt-10 md:mt-14 xl:mt-16 space-y-5 md:space-y-6 xl:space-y-7">
            {[
              'You have thousands of photos on your phone but no idea what half of them mean anymore.',
              'You have a parent or grandparent whose stories you have been meaning to record for years.',
              'You have lost someone and realised too late how much you did not write down.',
              `You want your children to know where they come from, in your words, not a search engine's.`,
`You have tried notebooks, cloud drives, shared albums, and none of them stuck.`,
            ].map((line, i) => (
              <div key={i} className="flex gap-4 md:gap-5">
                <span className="shrink-0 mt-[0.35em] w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#C8A557]" />
                <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
                  {line}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-14">
            <Body>
              <p>
                If any of that sounds familiar, a living library is not a nice idea for someday. It is the thing you have been looking for. You just did not know it had a name.
              </p>
              <p>
                Learn more about{' '}
                <Link href="/digital-legacy" className="underline underline-offset-4 decoration-[#C8A557]/40 hover:decoration-[#C8A557] transition">
                  building a digital legacy
                </Link>
                , or see{' '}
                <Link href="/how-it-works" className="underline underline-offset-4 decoration-[#C8A557]/40 hover:decoration-[#C8A557] transition">
                  how Ancestorii works
                </Link>.
              </p>
            </Body>
          </div>
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
                Start building something<br />
                <span className="italic text-[#C8A557]">your family can return to.</span>
              </p>
              <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
                One memory. That is all it takes to begin.
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
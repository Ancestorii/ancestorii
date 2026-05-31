import Link from 'next/link';

/* ─── Pull quote ─── */
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 md:my-16 xl:my-20 py-6 md:py-8 xl:py-10 border-l-[3px] border-[#B8932A] pl-6 md:pl-8 xl:pl-10 clear-both">
      <p className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[34px] 2xl:text-[38px] leading-[1.35] tracking-[-0.02em] text-[#181512]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
        {children}
      </p>
    </blockquote>
  );
}

/* ─── Body text wrapper ─── */
function Body({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 md:space-y-7 xl:space-y-8 text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
      {children}
    </div>
  );
}

/* ─── Rule card (for Our Stories rules) ─── */
function RuleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-6 md:pl-8 py-5 md:py-6 xl:py-7 pr-5 md:pr-8 border-l-[2px] border-[#B8932A]/40" style={{ background: 'linear-gradient(135deg, rgba(184,147,42,0.04) 0%, transparent 70%)' }}>
      <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
        <strong>{title}</strong>{' '}{children}
      </p>
    </div>
  );
}

/* ─── Feature card (for My Family features) ─── */
function FeatureCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative p-6 md:p-7 xl:p-8" style={{ background: 'rgba(184,147,42,0.03)', border: '1px solid rgba(184,147,42,0.12)' }}>
      <span className="text-[40px] md:text-[48px] xl:text-[56px] leading-none font-semibold text-[#B8932A]/10 absolute top-4 right-5 md:top-5 md:right-6 select-none" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {number}
      </span>
      <h4 className="text-[16px] md:text-[18px] xl:text-[20px] font-semibold text-[#181512] mb-3 md:mb-4 tracking-[-0.01em]">
        {title}
      </h4>
      <p className="text-[14px] md:text-[16px] xl:text-[17px] 2xl:text-[18px] leading-[1.8] text-[#3D3526]">
        {children}
      </p>
    </div>
  );
}

/* ─── Product card (for My Heirlooms) ─── */
function ProductCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative p-6 md:p-7 xl:p-8 flex flex-col" style={{ background: '#1A1612' }}>
      <div className="mb-4 md:mb-5" style={{ height: '2px', width: '2rem', background: 'linear-gradient(to right, #C8A557, transparent)' }} />
      <h4 className="text-[17px] md:text-[19px] xl:text-[21px] font-semibold text-white mb-3 md:mb-4 tracking-[-0.01em]">
        {title}
      </h4>
      <p className="text-[14px] md:text-[15px] xl:text-[16px] 2xl:text-[17px] leading-[1.8] text-white">
        {children}
      </p>
    </div>
  );
}

/* ─── Strike step (for three-strike policy) ─── */
function StrikeStep({ step, label, isLast, children }: { step: string; label: string; isLast?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 md:gap-6">
      <div className="flex flex-col items-center">
        <div
          className="w-9 h-9 md:w-10 md:h-10 xl:w-11 xl:h-11 rounded-full flex items-center justify-center text-[13px] md:text-[14px] font-semibold shrink-0"
          style={{
            background: step === '3' ? '#B8932A' : 'transparent',
            border: step === '3' ? 'none' : '1.5px solid rgba(184,147,42,0.4)',
            color: step === '3' ? '#1A1612' : '#B8932A',
          }}
        >
          {step}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-2" style={{ background: 'rgba(184,147,42,0.2)' }} />
        )}
      </div>
      <div className="pb-8 md:pb-10">
        <p className="text-[12px] md:text-[13px] tracking-[0.12em] uppercase text-[#B8932A] font-semibold mb-2">
          {label}
        </p>
        <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
          {children}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksContent() {
  return (
    <div className="w-full relative overflow-hidden" style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ━━━ HERO ━━━ */}
      <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-24">

        <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
          <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            How It Works
          </span>
        </div>

        <h1
          className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
        >
          Two sides.<br />
          <span className="italic text-[#A9782F]">One family.</span>
        </h1>

        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

        <Body>
          <p>
            Ancestorii is built around a simple idea. Some memories are meant to be shared with the world. Others are meant to stay in the family.
          </p>
          <p>
            So we gave you both. A public feed called <strong>Our Stories</strong>, where families share memories openly and anyone can read them. And a private side called <strong>My Family</strong>, where everything stays between the people you invite. Nobody else gets in.
          </p>
          <p>
            They work side by side, but they do very different things. Here is how.
          </p>
        </Body>
      </div>

      {/* ━━━ OUR STORIES ━━━ */}
      <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-8 md:pt-12 pb-16 md:pb-24">

        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
          Public
        </span>

        <h2
          className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
        >
          Our Stories
        </h2>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              This is the open side of Ancestorii. When you publish a story here, anyone on the platform can read it. They can react to it. They can leave a comment. They can share it with someone who needs to hear it.
            </p>
            <p>
              Think of it as a place for the stories you want to pass on beyond your own family. Your grandparents&rsquo; journey to a new country. The tradition your family kept alive for decades. The recipe that started arguments every Christmas. These are the memories that connect people across families, across cultures, across generations.
            </p>
            <p>
              You decide what goes public. Nothing is ever pushed there without your say.
            </p>
          </Body>
        </div>

        <PullQuote>
          This is not social media.{' '}
          <span className="italic text-[#A9782F]">It is a memory space with a door that stays open.</span>
        </PullQuote>

        <Body>
          <p>
            We stripped out everything that makes sharing exhausting on other platforms.
          </p>
        </Body>

        {/* ── Rules as cards ── */}
        <div className="mt-8 md:mt-10 xl:mt-12 space-y-4 md:space-y-5">
          <RuleCard title="There is no algorithm.">
            Stories appear in the order they are published. Nobody&rsquo;s memory gets buried because it did not perform well. Nobody&rsquo;s story gets boosted because it went viral. Every family gets the same treatment.
          </RuleCard>
          <RuleCard title="There are no follower counts.">
            You are not building an audience. You are not competing with anyone. There are no metrics, no vanity numbers, no pressure to perform. You share a memory because it matters to you, and that is enough.
          </RuleCard>
          <RuleCard title="There is no religion or politics.">
            This is a hard rule. Our Stories exists for memories only. Faith and political views are personal, and they belong in personal conversations. Not here. This space is for the stuff that brings families together, not the stuff that tears people apart.
          </RuleCard>
        </div>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              Just memories. A first day of school. A Sunday dinner tradition. The way your grandfather held his cup of tea. That is what this space is for. Nothing else.
            </p>
          </Body>
        </div>
      </div>

      {/* ━━━ OUR MEMORIES ━━━ */}
      <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-8 md:pt-12 pb-16 md:pb-24">

        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
          Private
        </span>

        <h2
          className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
        >
          My Family
        </h2>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              This is the closed side. Your family&rsquo;s private feed. When you write a memory here, only your family sees it. The photos you would never post anywhere. The voice your mum uses when she tells that story one more time. The details that only mean something to the people who were there.
            </p>
            <p>
              Only family members you invite can see what is inside. Nobody else can browse it, search for it, or stumble into it. There is no discovery feed for private content. There is no &ldquo;suggested families&rdquo; feature. The family feed is a locked room and the only people with a key are the ones you hand it to.
            </p>
          </Body>
        </div>

        <PullQuote>
          When a family knows a space is private, they speak differently.{' '}
          <span className="italic text-[#A9782F]">They tell the real story.</span>
        </PullQuote>

        <Body>
          <p>
            When you sign up, you write your first memory. A moment, a person, a feeling you do not want to lose. That becomes the first entry in your family&rsquo;s feed. From there, the library grows — not because you are building content, but because you are asking the right questions.
          </p>
        </Body>

        {/* ── Features as cards in a grid ── */}
        <div className="mt-8 md:mt-10 xl:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <FeatureCard number="01" title="The Private Feed">
            Every memory your family writes appears here — photos, text, voice notes. Same visual feel as the public feed, but locked to your family. No algorithm deciding what you see. No strangers reading your stories. Just the people you trust, sharing the moments that matter.
          </FeatureCard>
          <FeatureCard number="02" title="Question Prompts">
            Pick from dozens of curated questions across chapters like Growing Up, Holidays, Around the Table, and The Stories We Always Retell. Send a question to a family member. When they answer, their memory appears in your feed. They do not even need an account — they click the link, write their answer, and they are in.
          </FeatureCard>
          <FeatureCard number="03" title="Multiple Perspectives">
            When two people remember the same moment differently, both versions live on the same page as tabs. Nicole&rsquo;s Memory. Dante&rsquo;s Memory. Maria&rsquo;s Memory. Click a tab and the entire story changes — different words, different photos, different feelings about the same moment. That is what makes a family archive feel alive.
          </FeatureCard>
          <FeatureCard number="04" title="Invite &amp; Collaborate">
            Send a question or share a link. Family members join your library and start contributing — their own memories, their own photos, their reactions and comments on yours. Everyone adds their piece. The collection grows richer because no single person holds the whole story.
          </FeatureCard>
        </div>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              You also have albums to group memories by chapter — a wedding, a childhood home, a decade of Sunday mornings — and timelines to place a life in order, so your children do not have to guess what happened when or why it mattered.
            </p>
          </Body>
        </div>

        {/* ── MY HEIRLOOMS ── */}
        <div className="mt-16 md:mt-20 xl:mt-24 pt-10 md:pt-14 xl:pt-16 border-t border-[#ECE5D8]">

          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
            Physical
          </span>

          <h3
            className="mt-4 text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] xl:text-[60px] 2xl:text-[66px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            My Heirlooms
          </h3>

          <div className="mt-8 md:mt-10 xl:mt-12">
            <Body>
              <p>
                Digital memories are fragile. Platforms close. Devices break. Accounts get lost. My Heirlooms lets you turn your family&rsquo;s library into something real. Something you can hold, hang on a wall, and pass down.
              </p>
            </Body>
          </div>

          {/* ── Products as dark cards ── */}
          <div className="mt-8 md:mt-10 xl:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <ProductCard title="Memory Book">
              A printed, hardcover book built from your family&rsquo;s stories, photos, and timelines. You design it in our book editor, we print it at professional quality and deliver it to your door. Three tiers available, from a single chapter to a full legacy edition.
            </ProductCard>
            <ProductCard title="Canvas Print">
              A meaningful photo turned into a gallery quality canvas. The kind of image that belongs on a wall, not buried in a camera roll. Museum grade print on stretched canvas.
            </ProductCard>
            <ProductCard title="Acrylic Print">
              A photo printed behind polished acrylic glass. Vivid colour, clean edges, and the kind of weight that makes a memory feel permanent. High definition UV print with a contemporary finish.
            </ProductCard>
          </div>

          <div className="mt-8 md:mt-10 xl:mt-12">
            <Body>
              <p>
                Everything you create in My Heirlooms is built from the memories already in your private library. The physical product is the final step, not the starting point.
              </p>
            </Body>
          </div>
        </div>
      </div>

      {/* ━━━ COMMUNITY STANDARDS ━━━ */}
      <div className="w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-8 md:pt-12 pb-16 md:pb-24">

        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />

        <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">
          Standards
        </span>

        <h2
          className="mt-4 text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[68px] 2xl:text-[76px] leading-[0.95] tracking-[-0.03em] text-[#181512]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
        >
          Keeping the space{' '}
          <span className="italic text-[#A9782F]">safe.</span>
        </h2>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              Our Stories is a shared space. And shared spaces only work when everyone agrees on what belongs there.
            </p>
            <p>
              Every story published to the public feed is reviewed before it goes live. If it does not meet our standards, it does not appear. Simple as that.
            </p>
            <p>
              We review for religious or political content of any kind, hate speech, harassment, discriminatory language, spam, self promotion, commercial content, and anything that is not a genuine family memory. If it is not a memory, it does not belong.
            </p>
          </Body>
        </div>

        <PullQuote>
          A space for family memories only works{' '}
          <span className="italic text-[#A9782F]">if it stays that way.</span>
        </PullQuote>

        <Body>
          <p>
            If a published story breaks the rules, we follow a three strike policy.
          </p>
        </Body>

        {/* ── Three-strike policy as visual steps ── */}
        <div className="mt-8 md:mt-10 xl:mt-12">
          <StrikeStep step="1" label="First time">
            The story is removed and we send you an email explaining what happened and why. Everyone makes mistakes.
          </StrikeStep>
          <StrikeStep step="2" label="Second time">
            The story is removed, you get a final warning, and you are suspended from publishing to Our Stories for seven days.
          </StrikeStep>
          <StrikeStep step="3" label="Third time" isLast>
            You are permanently banned from Our Stories. You can no longer publish, comment, or interact with the public feed.
          </StrikeStep>
        </div>

        <div className="mt-4 md:mt-6 xl:mt-8 p-5 md:p-6 xl:p-7" style={{ background: 'rgba(184,147,42,0.04)', borderLeft: '2px solid rgba(184,147,42,0.25)' }}>
          <p className="text-[15px] md:text-[17px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px] leading-[1.85] text-[#3D3526]">
            <strong className="text-[#181512]">One thing that will never happen:</strong> your private library is never touched. Strikes only affect the public side. My Family is yours. We do not go near it.
          </p>
        </div>

        <div className="mt-8 md:mt-10 xl:mt-12">
          <Body>
            <p>
              We also have a report button on every story, so if something slips through, the community can flag it. When you open Our Stories, you should find exactly what you came for. Real memories from real families. Nothing else.
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
              Some memories are for everyone.<br />
              <span className="italic text-[#C8A557]">Some are just for your family.</span>
            </p>
            <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">
              Share stories with the world. Keep memories with your family. Build something that lasts.
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
    </div>
  );
}
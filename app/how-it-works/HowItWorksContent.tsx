import Link from 'next/link';

function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="border-t border-[#E8D9A8]" />
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <p className="text-sm tracking-[0.3em] uppercase font-semibold text-[#D4AF37]">
        {eyebrow}
      </p>
      <h2 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight">
        {title}
      </h2>
      <p className="mt-8 text-lg leading-relaxed max-w-3xl">
        {subtitle}
      </p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E8D9A8] px-4 py-2 text-sm">
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  body,
  points,
  tone = 'parchment',
}: {
  title: string;
  body: string;
  points: string[];
  tone?: 'parchment' | 'cream';
}) {
  const bg = tone === 'parchment' ? 'bg-[#F6F1E4]' : 'bg-[#FFF9EE]';
  return (
    <div className={`rounded-[2rem] border border-[#E8D9A8] ${bg} p-8 sm:p-10`}>
      <h3 className="font-serif text-2xl leading-tight">{title}</h3>
      <p className="mt-6 leading-relaxed">{body}</p>
      <ul className="mt-8 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3">
            <span className="text-[#D4AF37]">●</span>
            <span className="leading-relaxed">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailBlock({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  return (
    <div className="rounded-[2rem] border border-[#E8D9A8] bg-white p-8 sm:p-10">
      <h3 className="text-xl font-semibold">{heading}</h3>
      <p className="mt-6 leading-relaxed">{body}</p>
    </div>
  );
}

function FAQItem({
  q,
  a,
}: {
  q: string;
  a: React.ReactNode;
}) {
  return (
    <details className="rounded-[2rem] border border-[#E8D9A8] bg-white p-7 sm:p-8">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-6">
          <h3 className="text-lg font-semibold">{q}</h3>
          <span className="text-[#D4AF37]">+</span>
        </div>
      </summary>
      <div className="mt-6 leading-relaxed">
        {a}
      </div>
    </details>
  );
}

export default function HowItWorksContent() {
  return (
    <>
      {/* HERO */}
      <section className="bg-[#F6F1E4] border-b border-[#E8D9A8]">
        <div className="px-6 pt-14 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl">
              <p className="text-lg tracking-[0.25em] uppercase text-[#D4AF37]">
                How It Works
              </p>

              <h1 className="mt-6 font-serif text-[2.8rem] sm:text-[3.6rem] leading-tight">
                A living library for the people you love.
              </h1>

              <p className="mt-8 text-lg leading-relaxed max-w-3xl">
                Ancestorii is built for families who do not want their history scattered across phones,
                lost in old logins, or buried inside social platforms that were never designed for preservation.
                This is a private home for memory; structured, intentional, and made to last.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex justify-center items-center px-9 py-4 rounded-full bg-[#E6C26E] text-[#0F2040] font-semibold"
                >
                  Create your library
                </Link>
              </div>

              <div className="mt-20 border-t border-[#E8D9A8] pt-10">

  <h2 className="font-serif text-2xl sm:text-3xl leading-tight">
    What this page covers
  </h2>

  <ul className="mt-10 space-y-4 text-lg">
    <li className="flex gap-4">
      <span className="text-[#D4AF37]">●</span>
      <span>The Why</span>
    </li>
    <li className="flex gap-4">
      <span className="text-[#D4AF37]">●</span>
      <span>Inside the Library</span>
    </li>
    <li className="flex gap-4">
      <span className="text-[#D4AF37]">●</span>
      <span>The Process</span>
    </li>
    <li className="flex gap-4">
      <span className="text-[#D4AF37]">●</span>
      <span>Security & Continuity</span>
    </li>
    <li className="flex gap-4">
      <span className="text-[#D4AF37]">●</span>
      <span>Our Privacy Model</span>
    </li>
  </ul>

</div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* THE PROBLEM + THE PROMISE */}
      <section className="px-4 py-18">
        <SectionTitle
          eyebrow="The Why"
          title="Most places store files. Ancestorii preserves lives."
          subtitle="A photograph without a story becomes a mystery. A voice note without context becomes noise. We built Ancestorii to protect the meaning, not just the media."
        />

        <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-10 md:grid-cols-3">
          <DetailBlock
            heading="Memory needs context"
            body="The smallest details become priceless later: names, dates, places, the reason behind the photo, the feeling in the room."
          />
          <DetailBlock
            heading="Families are not feeds"
            body="There is no algorithm. No engagement loop. No pressure. Just a quiet place for what matters."
          />
          <DetailBlock
            heading="Legacy needs continuity"
            body="People change devices. Accounts get lost. Platforms disappear. Preservation is about reducing fragile points so your family can still access what you saved."
          />
        </div>
      </section>

      <Divider />

     {/* INSIDE THE PLATFORM */}
<section id="inside" className="relative px-6 py-28 bg-[#FFFDF6] overflow-hidden">
  <SectionTitle
    eyebrow="Inside the Library"
    title="Built on four foundations."
    subtitle="Everything inside Ancestorii exists for one reason: to protect meaning."
  />

  <div className="relative max-w-6xl mx-auto mt-24 grid grid-cols-[1fr_3fr] gap-x-16">

    {/* Vertical Line */}
    <div className="relative flex justify-center">
      <div className="w-[2px] h-full bg-[#E5C45C]" />
    </div>

    <div className="space-y-28">

      {/* TIMELINES */}
      <div className="relative">
        <h3 className="font-serif text-[2.4rem] sm:text-[3rem] leading-tight">
          A life needs structure.
          <br />
          <span className="italic text-[#C9AE4A]">Timelines.</span>
        </h3>

        <ul className="mt-10 space-y-4 text-lg">
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Place memories in chronological order.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Attach context to milestones.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Make a life readable for future generations.</span>
          </li>
        </ul>
      </div>

      {/* ALBUMS */}
      <div className="relative">
        <h3 className="font-serif text-[2.4rem] sm:text-[3rem] leading-tight">
          Chapters deserve order.
          <br />
          <span className="italic text-[#C9AE4A]">Albums.</span>
        </h3>

        <ul className="mt-10 space-y-4 text-lg">
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Group moments by theme or chapter.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Keep documents and photos together.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Turn collections into coherent records.</span>
          </li>
        </ul>
      </div>

      {/* CAPSULES */}
      <div className="relative">
        <h3 className="font-serif text-[2.4rem] sm:text-[3rem] leading-tight">
          Presence should remain.
          <br />
          <span className="italic text-[#C9AE4A]">Capsules.</span>
        </h3>

        <ul className="mt-10 space-y-4 text-lg">
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Record voice with tone and warmth.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Write reflections in full.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Preserve meaning with the memory.</span>
          </li>
        </ul>
      </div>

      {/* LOVED ONES */}
      <div className="relative">
        <h3 className="font-serif text-[2.4rem] sm:text-[3rem] leading-tight">
          Memory is shared.
          <br />
          <span className="italic text-[#C9AE4A]">Loved Ones.</span>
        </h3>

        <ul className="mt-10 space-y-4 text-lg">
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Invite trusted family members.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Add missing names and context.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-[#D4AF37]">●</span>
            <span>Preserve knowledge across generations.</span>
          </li>
        </ul>
      </div>

    </div>
  </div>
</section>
      <Divider />

      {/* HOW IT WORKS: STEPS (architectural + editorial) */}
      <section className="bg-[#F6F1E4] border-y border-[#E8D9A8]">
        <div className="px-6 py-24">
          <SectionTitle
            eyebrow="The Process"
            title="How families usually build their library"
            subtitle="Most people do not create a perfect archive in a weekend. They build a little at a time."
          />

          <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-10 md:grid-cols-2">
            <DetailBlock
              heading="1. Begin with one person"
              body="Start with a Timeline for someone central: a parent, grandparent, or yourself. Add a few milestones, a few photos, and one story that matters. The goal is not volume. The goal is a foundation."
            />
            <DetailBlock
              heading="2. Add an Album for a chapter"
              body="Choose a meaningful chapter: childhood home, wedding, family holidays, migration, Sunday dinners. Albums bring coherence fast. A small album with context is better than a thousand unlabelled images."
            />
            <DetailBlock
              heading="3. Create a Capsule"
              body="Record a voice memory or write a reflection. Capsules are where people feel the emotional weight of what they are building. This is often the first moment where the library becomes more than storage."
            />
            <DetailBlock
              heading="4. Invite one loved one"
              body="Invite someone who holds knowledge you don’t. Ask for names, dates, and stories behind certain photos. This turns the library into a shared act of preservation rather than a solo project."
            />
          </div>

          <div className="max-w-6xl mx-auto px-6 mt-16">
            <div className="rounded-[2rem] border border-[#E8D9A8] bg-[#FFF9EE] p-10">
              <h3 className="font-serif text-2xl">The quiet truth</h3>
              <p className="mt-6 leading-relaxed max-w-4xl">
                Families often wait too long because preservation feels overwhelming.
                Start small. Build with intention.
                The library becomes powerful because it accumulates meaning.
              </p>
              <div className="mt-10">
                <Link
                  href="/signup"
                  className="inline-flex justify-center items-center px-9 py-4 rounded-full bg-[#E6C26E] text-[#0F2040] font-semibold"
                >
                  Begin your library
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Divider />

      {/* SECURITY + CONTINUITY (deep, explicit) */}
      <section className="px-6 py-24">
        <SectionTitle
          eyebrow="Security & Continuity"
          title="What happens if you stop paying"
          subtitle="We do not believe your family history should be held hostage. If you downgrade or stop paying, you can still enter your library. You keep access to what you created. The difference is capacity."
        />

        <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-10 md:grid-cols-3">
          <DetailBlock
            heading="You keep access"
            body="You can still sign in and view your library. Your memories remain yours. Your family should be able to return to what they’ve preserved without fear."
          />
          <DetailBlock
            heading="Creation limits apply"
            body="If you are over the free plan limits, you won’t be able to create new memories until you upgrade again. This protects fairness while still protecting continuity."
          />
          <DetailBlock
            heading="Nothing is deleted"
            body="Stopping payment does not mean your history disappears. Your library remains intact. This is not a product designed around anxiety. It is designed around preservation."
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-12 md:grid-cols-2 items-stretch">
          <FeatureCard
            title="Your archive is not a subscription trick"
            body="A family archive should not behave like entertainment. The purpose is long-term care. Our model is designed so that your history remains accessible even if your plan changes."
            points={[
              'Access remains, creation adjusts to plan limits.',
              'We aim for long-term trust, not short-term pressure.',
              'The archive should feel stable, not rented.',
              'Preservation must be calm; not transactional fear.',
            ]}
            tone="parchment"
          />
          <FeatureCard
            title="Annual physical archive option"
            body="We are developing an annual physical archive option — a printed record of your year’s additions — so your family can hold a tangible copy of your memories."
            points={[
              'A physical record is resilient in a way digital cannot be.',
              'Printed memory becomes part of family tradition.',
              'A yearly archive helps you reflect, not just store.',
              'Your library can exist both digitally and physically.',
            ]}
            tone="cream"
          />
        </div>
      </section>

      <Divider />

      {/* PRIVACY MODEL (sell it hard, clearly) */}
      <section className="bg-[#F6F1E4] border-y border-[#E8D9A8]">
        <div className="px-6 py-24">
          <SectionTitle
            eyebrow="Our Privacy Model"
            title="Built without the incentives that ruin trust"
            subtitle="Most platforms are funded by attention and advertising. That changes how they behave. Ancestorii is built for families who want a private space where the goal is preservation, not performance."
          />

          <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-10 md:grid-cols-2">
            <DetailBlock
              heading="No public feeds"
              body="There is no “post to the world.” Your library is private. It is for your family. Preservation is intimate, not performative."
            />
            <DetailBlock
              heading="No advertising"
              body="Advertising introduces incentives that do not belong in a family archive. Ancestorii is not built to monetise attention."
            />
            <DetailBlock
              heading="No sale of personal data"
              body="Your family history should not become a dataset. The library exists to protect memory, not extract value from it."
            />
            <DetailBlock
              heading="Designed for long-term care"
              body="Every structural decision is made with continuity in mind: clarity, ownership, access, and a calm relationship with the archive."
            />
          </div>

          <div className="max-w-6xl mx-auto px-6 mt-16">
            <div className="rounded-[2rem] border border-[#E8D9A8] bg-[#FFF9EE] p-10">
              <h3 className="font-serif text-2xl">What privacy feels like</h3>
              <p className="mt-6 leading-relaxed max-w-4xl">
                Privacy is not a feature. It is the atmosphere.
                When a family knows a space is private, they speak differently.
                They record the voice note. They write the real story. They preserve the truth without fear of it becoming content.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ (deep, not timid) */}
      <section className="px-6 py-24">
        <SectionTitle
          eyebrow="Questions"
          title="Clear answers, no evasiveness"
          subtitle="Preservation requires trust. Here are direct answers to the questions families actually ask before they begin."
        />

        <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-8 md:grid-cols-2">
          <FAQItem
            q="Do I need a card to start?"
            a={
              <p>
                No. You can create your library and begin preserving memories without adding a card.
                Upgrade later only if you need more space.
              </p>
            }
          />
          <FAQItem
            q="If I cancel, do I lose my memories?"
            a={
              <p>
                No. You keep access to your library. If you are above the free plan limits,
                you won’t be able to add new content until you upgrade again — but your existing archive remains.
              </p>
            }
          />
          <FAQItem
            q="Is this public? Can strangers see my family?"
            a={
              <p>
                No. Ancestorii is private by default. There is no public feed.
                Your library is for the people you choose.
              </p>
            }
          />
          <FAQItem
            q="What’s the difference between a Timeline and an Album?"
            a={
              <div className="space-y-4">
                <p>
                  A Timeline follows a person through time. It’s a life story structure.
                </p>
                <p>
                  An Album groups memories by theme or chapter: a home, a wedding, a period of life.
                </p>
                <p>
                  Families often use both: a Timeline for the person, Albums for the chapters that shaped them.
                </p>
              </div>
            }
          />
          <FAQItem
            q="What is a Capsule, really?"
            a={
              <div className="space-y-4">
                <p>
                  A Capsule is a preserved message: voice or written memory.
                  It is designed to hold the story intact, with the emotional tone preserved.
                </p>
                <p>
                  Many families use Capsules for the things they never want to lose: advice, love, perspective, family truths.
                </p>
              </div>
            }
          />
          <FAQItem
            q="Can other family members add memories too?"
            a={
              <p>
                Yes. You can invite loved ones so the archive becomes shared.
                Different generations hold different pieces of the story — inviting them prevents those pieces from disappearing.
              </p>
            }
          />
        </div>
      </section>

      <Divider />

      {/* FINAL CTA */}
      <section className="bg-[#F6F1E4] border-t border-[#E8D9A8]">
        <div className="px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[2rem] border border-[#E8D9A8] bg-[#FFF9EE] p-10 sm:p-12">
              <p className="text-xs tracking-[0.25em] uppercase text-[#D4AF37]">
                Begin
              </p>
              <h2 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight">
                Start with one person. One story. One moment worth keeping.
              </h2>
              <p className="mt-8 text-lg leading-relaxed max-w-3xl">
                You do not need to do everything today. A library is built over time.
                The important thing is to begin while the stories are still here to be told.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex justify-center items-center px-10 py-4 rounded-full bg-[#E6C26E] text-[#0F2040] font-semibold"
                >
                  Create your library
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex justify-center items-center px-10 py-4 rounded-full border border-[#D4AF37] text-[#0F2040] font-semibold"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
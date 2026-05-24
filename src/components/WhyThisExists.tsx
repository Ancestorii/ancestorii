'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

/* ─── Inline photo (floats with text) ─── */
function InlinePhoto({
  src,
  alt,
  caption,
  float = 'right',
  rotate = 'right',
}: {
  src: string;
  alt: string;
  caption: string;
  float?: 'left' | 'right';
  rotate?: 'left' | 'right' | 'none';
}) {
  const deg = rotate === 'left' ? '-2deg' : rotate === 'right' ? '2deg' : '0deg';
  const floatClass = float === 'left'
    ? 'sm:float-left sm:mr-8 md:mr-10 lg:mr-12 sm:ml-0'
    : 'sm:float-right sm:ml-8 md:ml-10 lg:ml-12 sm:mr-0';

  return (
    <div className={`w-full sm:w-[48%] lg:w-[42%] xl:w-[40%] mb-6 sm:mb-4 ${floatClass}`} style={{ transform: `rotate(${deg})` }}>
      <div className="relative">
        <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-[#e3dccb]" />
        <div className="relative bg-white p-2 md:p-2.5 shadow-sm">
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
            <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, 45vw" loading="lazy" className="object-cover" />
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-center text-[11px] md:text-[12px] xl:text-[13px] italic text-[#8A7F72]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {caption}
      </p>
    </div>
  );
}

/* ─── Centred photo break ─── */
function CentrePhoto({
  src,
  alt,
  caption,
  rotate = 'left',
}: {
  src: string;
  alt: string;
  caption: string;
  rotate?: 'left' | 'right' | 'none';
}) {
  const deg = rotate === 'left' ? '-1.5deg' : rotate === 'right' ? '1.5deg' : '0deg';
  return (
    <div className="my-14 md:my-20 xl:my-24 flex justify-center">
      <div className="w-full max-w-[88%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] xl:max-w-[50%]" style={{ transform: `rotate(${deg})` }}>
        <div className="relative">
          <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-[#e3dccb]" />
          <div className="relative bg-white p-2.5 md:p-3 shadow-sm">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
              <Image src={src} alt={alt} fill sizes="(max-width: 640px) 88vw, 55vw" loading="lazy" className="object-cover" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[12px] md:text-[13px] xl:text-[14px] italic text-[#8A7F72]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {caption}
        </p>
      </div>
    </div>
  );
}

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

/* ─── Share button ─── */
function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = 'https://www.ancestorii.com/why-this-exists';
  const text = 'The story behind Ancestorii — why one person decided to build a place where families can share the moments that matter.';

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Our Roots — Why Ancestorii Exists', text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className="group inline-flex items-center gap-2.5 px-5 py-2.5 xl:px-6 xl:py-3 border border-[#E0D6C8] text-[12px] xl:text-[13px] font-medium text-[#4A4030] transition-all duration-200 hover:border-[#B8932A] hover:text-[#B8932A] active:scale-[0.97]"
      style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200 group-hover:stroke-[#B8932A]">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Link copied' : 'Share this story'}
    </button>
  );
}

/* ─── OPTION C: Letter Format — Full Width ─── */
export default function WhyThisExists() {
  return (
    <section className="w-full relative overflow-hidden" style={{ background: '#FFFDF8' }}>

      {/* Content — percentage padding so it scales with screen */}
      <div
        className="relative w-full px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%] pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-20 md:pb-32 xl:pb-40"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >

        {/* Overline */}
        <div className="flex items-center gap-2.5 mb-5 md:mb-6 xl:mb-8">
          <div className="h-px w-5 xl:w-6 bg-[#B8932A]" />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Our Roots</span>
        </div>

        {/* Headline */}
        <h1 className="text-[36px] sm:text-[46px] md:text-[56px] lg:text-[66px] xl:text-[78px] 2xl:text-[90px] leading-[0.95] tracking-[-0.03em] text-[#181512] mb-4 md:mb-5 xl:mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          I did not build this<br />
          <span className="italic text-[#A9782F]">for everyone.</span>
        </h1>

        {/* Byline */}
        <p className="text-[13px] md:text-[14px] xl:text-[15px] 2xl:text-[16px] text-[#8A7F72] mb-8 md:mb-10 xl:mb-12">
          Written by Dante Leon, Founder of Ancestorii
        </p>

        {/* Gold rule */}
        <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

        {/* ─── Body ─── */}
        <Body>
          <p>
            I built this because I was scared of forgetting.
          </p>

          <p>
            Not the big things. You remember birthdays and weddings and holidays. I was scared of losing the small stuff. The way my grandmother used to hum when she was cooking. The way she would describe the village she grew up in, always with the same faraway look, always adding a detail she had never mentioned before. The sound of my mum laughing at her own jokes before she even gets to the punchline.
          </p>

          <p>
            Those moments are not written down anywhere. They do not exist in a photo album or a cloud folder or a social media post. They live in people's heads, and when those people are gone, the moments go with them. Quietly. Without anyone noticing until it is too late.
          </p>

          <p>
            That thought sat with me for a long time. It would come back to me at the strangest moments. During a phone call with my mum when she would mention something I had completely forgotten. At a family gathering when someone would start a story and the whole room would go quiet, leaning in, because everyone knew this was a good one.
          </p>
        </Body>

        {/* First photo floats right */}
        <div className="mt-10 md:mt-14 xl:mt-16 overflow-hidden">
          <InlinePhoto src="/outdoor.jpg" alt="Dante posing outdoors" caption="Me, pretending I was too cool to smile · July 2010" float="right" rotate="right" />

          <Body>
            <p>
              I grew up in a house full of stories. My family talked a lot. Around the dinner table, on car journeys, at every gathering that went on too long. There was always someone telling a story about something that happened years ago, and everyone would laugh or argue about whether that was really how it went. Someone would say "no, that is not what happened at all" and then tell their version, which was completely different but somehow just as true.
            </p>

            <p>
              But none of it was ever captured. Not the voices. Not the details. Not the way my grandmother described the recipe she never once measured but always got right, or the way she would wave her hand dismissively when you asked her how much of something to add, as if the question itself was ridiculous. We had photos, sure. Boxes of them, folders on phones, thousands sitting in cloud storage that nobody ever opens. But a photo only shows you what something looked like. It does not tell you what it felt like. It does not tell you the story behind it.
          </p>

            <p>
              A photo of my grandmother in her kitchen tells you nothing about the smell of that kitchen, or the sound of oil crackling in the pan, or the fact that she would sing under her breath while she cooked and pretend she was not singing when you pointed it out.
            </p>
          </Body>
        </div>

        <PullQuote>
          A photo tells you what someone looked like.{' '}
          <span className="italic text-[#A9782F]">It does not tell you who they were.</span>
        </PullQuote>

        <div className="overflow-hidden">
          <InlinePhoto src="/snow.jpg" alt="Dante and his sister in the snow" caption="She still says she won the snowball fight · March 2010" float="left" rotate="left" />

          <Body>
            <p>
              I kept thinking about that. About how every family has this invisible archive of moments that are slowly disappearing. Recipes that only one person knows. Stories that only get told when a certain aunt visits. Voices that you will one day only hear in your memory, and even that will start to fade.
            </p>

            <p>
              And I kept thinking, someone should build a place for all of this. Not a social media page where it gets buried under ads and algorithms. Not a notes app where it sits forgotten in a list. Not a shared Google Drive where files go to die. Something designed specifically for the things that families carry but never write down. Something that treats those moments with the weight they deserve.
            </p>

            <p>
              I looked for something like that. I looked for a long time. I found apps that store photos. I found apps that build family trees. I found apps that let you record audio. But I could not find a single place that brought all of it together. A place where you could write the story, attach the photo, record the voice, and know that it was all going to be there in ten, twenty, fifty years. A place that was not trying to sell your attention to advertisers or bury your memories behind a paywall.
            </p>

            <p>
              So I decided to build it myself.
            </p>
          </Body>
        </div>

        <Body>
          <p>
            I called it Ancestorii. Ancestors and story, blended into one word. The double "i" at the end was not a stylistic choice. It stands for two people. The one telling the story and the one receiving it. Because memory does not survive alone. It only survives in the handoff — from a grandmother to a grandchild, from a father to a son, from the person who lived it to the person who will carry it forward.
          </p>
        </Body>

        <PullQuote>
          Ancestors + Story = Ancestorii. The double "i" is the handoff —{' '}
          <span className="italic text-[#A9782F]">the moment a story stops belonging to one person and starts belonging to a family.</span>
        </PullQuote>

        <CentrePhoto src="/garden.jpg" alt="Dante and his sister in the garden" caption="Me and my sister in the garden · Mum's favourite photo of us · May 2013" rotate="left" />

        <Body>
          <p>
            I am 27 years old. I work full time as an aircraft mechanic for British Airways. I am not a Silicon Valley founder with a pitch deck and a trust fund. I do not have a team of engineers or investors writing cheques. I work shifts, four days on, four days off, and on my days off I build Ancestorii. Every feature, every page, every word you are reading right now was built by one person, on a laptop, in between maintaining aircraft and walking my dog.
          </p>

          <p>
            I tell you this not because it makes for a good story, but because I want you to understand something. This was not built to chase a trend or fill a gap in the market. This was not born out of a brainstorming session or a whiteboard full of sticky notes. This was built because I genuinely could not find anything like it, and I could not stop thinking about how much we lose when we do not write things down.
          </p>
        </Body>

        <PullQuote>
          I could not stop thinking about how much we lose{' '}
          <span className="italic text-[#A9782F]">when we do not write things down.</span>
        </PullQuote>

        <div className="overflow-hidden">
          <InlinePhoto src="/family.jpg" alt="Dante and his mum sitting on the floor" caption="Me and my mum · The woman behind everything · May 2011" float="right" rotate="right" />

          <Body>
            <p>
              Think about your own family for a second. Think about the person who always tells the best stories. The one who remembers everything. The one who cooks that dish that nobody else can quite get right, no matter how many times they try. The one whose laugh you can hear in your head right now, even if you have not seen them in months.
            </p>

            <p>
              Now imagine all of that just gone. Not because something dramatic happened, but because nobody ever thought to write it down. Nobody pressed record. Nobody said, "Tell me that story again, slowly, so I can keep it." Nobody took two minutes to type out the recipe, or describe the way the kitchen smelled on a Sunday afternoon, or explain why that one photograph on the mantelpiece means so much.
            </p>

            <p>
              That is what happens in most families. Not out of carelessness, but out of the quiet assumption that there will always be more time. That the person who knows the story will always be there to tell it again. Until one day they are not.
            </p>
          </Body>
        </div>

        <Body>
          <p>
            That is what Ancestorii is for.
          </p>

          <p>
            It is a place where you can share the story behind the photo. Where you can record your grandmother's voice telling that story one more time. Where you can write down the recipe that has been in your family for three generations but only exists in someone's head. Where you can describe what Christmas morning actually felt like in your house, not the version you post online, but the real one. The messy, loud, beautiful, chaotic real one.
          </p>

          <p>
            It is a place where your children, and their children, can come back one day and understand not just what your family looked like, but what your family was actually like. The inside jokes. The traditions that made no sense to anyone else. The arguments that became legendary. The quiet moments that mattered more than anyone realised at the time.
          </p>
        </Body>

        <CentrePhoto src="/sister.jpg" alt="A childhood memory" caption="A childhood memory · the kind of moment that disappears if nobody writes it down" rotate="right" />

        <Body>
          <p>
            I did not build this for millions of users. I built this for the person who has been meaning to write things down but never has. For the family that has a hundred stories but nowhere to put them. For the person who lost a grandparent last year and realised, too late, how much went with them. For the person who picks up their phone to call someone who is no longer there, just because they heard a song or smelled something that brought it all back.
          </p>

          <p>
            If that is you, this is for you.
          </p>

          <p>
            Every family has moments worth sharing. Not with the whole internet. Not for likes or followers. But with the people who were there, and the people who will come after. The ones who will one day ask, "What was she like?" or "How did we end up with that tradition?" or "Why does this recipe taste different when anyone else makes it?"
          </p>

          <p>
            That is why Ancestorii exists. It exists because I believe the most important stories in the world are not the ones that make the news. They are the ones told around kitchen tables, on long drives, and at family gatherings that nobody wants to leave. They are the ones that start with "Do you remember when..." and end with everyone laughing so hard that someone has to leave the room.
          </p>
        </Body>

        <PullQuote>
          The most important stories in the world are not the ones that make the news.{' '}
          <span className="italic text-[#A9782F]">They are the ones told around kitchen tables.</span>
        </PullQuote>

        <Body>
          <p>
            I am going to keep building this. I am going to keep making it better. I am going to keep adding features that make it easier to capture the things that matter, and I am going to keep fighting for the idea that your family's story is worth more than a folder of photos that nobody opens.
          </p>

          <p>
            And I hope that one day, when someone in your family asks "Do you remember that story about..." the answer will not be silence. It will not be "I think so, but I cannot quite remember how it went." It will be, "Yes. It is all here. Let me show you."
          </p>

          <p>
            That is all I wanted to build. A place where nothing gets lost.
          </p>
        </Body>

        {/* Sign off */}
        <div className="mt-16 md:mt-20 xl:mt-24 pt-8 md:pt-10 xl:pt-12 border-t border-[#ECE5D8] clear-both flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[18px] md:text-[20px] xl:text-[24px] 2xl:text-[26px] text-[#181512] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Dante Leon
            </p>
            <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#8A7F72]">Founder, Ancestorii</p>
          </div>
          <ShareButton />
        </div>

        {/* CTA */}
        <div className="mt-14 md:mt-20 xl:mt-24 flex justify-center">
          <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
            <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
              Every family has a story{' '}<span className="italic text-[#C8A557]">worth sharing.</span>
            </p>
            <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed text-center">Two minutes. Your words. A memory that lives on.</p>
            <Link href="/signup" prefetch className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] text-center transition hover:opacity-90" style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}>
              START FOR FREE
            </Link>
            <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em] text-center">Free forever · No credit card · Takes 2 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
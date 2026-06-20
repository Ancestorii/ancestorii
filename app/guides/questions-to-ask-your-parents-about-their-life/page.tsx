import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Questions to Ask Your Parents About Their Life | Ancestorii',
  description:
    'More than sixty questions to ask your parents and grandparents about their lives, grouped by theme, plus how to have the conversation before the stories are gone.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/questions-to-ask-your-parents-about-their-life',
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

function QuestionSet({ title, questions }: { title: string; questions: string[] }) {
  return (
    <div className="py-10 md:py-12 xl:py-14 border-t border-[#ECE5D8]">
      <h3
        className="text-[22px] md:text-[28px] xl:text-[34px] leading-[1.1] tracking-[-0.02em] text-[#181512] mb-6 md:mb-8"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
      >
        {title}
      </h3>
      <ul className="space-y-3 md:space-y-4">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-4">
            <span className="shrink-0 mt-[0.55em] w-1.5 h-1.5 rounded-full bg-[#C8A557]" />
            <p className="text-[15px] md:text-[17px] xl:text-[19px] leading-[1.7] text-[#3D3526]">{q}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SETS = [
  {
    title: 'Childhood and the early years',
    questions: [
      'Where did you grow up, and what was the house like?',
      'What is your earliest memory?',
      'Who were your friends, and what did you do together?',
      'What were your parents like when you were small?',
      'Was there a place you loved to go as a child?',
      'What did a normal day look like when you were ten?',
    ],
  },
  {
    title: 'Family and where we come from',
    questions: [
      'Where did our family originally come from?',
      'What do you remember about your grandparents?',
      'Are there any family stories that got passed down to you?',
      'What was your mother like? What was your father like?',
      'Is there a relative you wish I had been able to meet?',
      'What traditions did your family keep, and where did they come from?',
    ],
  },
  {
    title: 'Love and the people who mattered',
    questions: [
      'How did you and Mum or Dad meet?',
      'What did you think the first time you saw them?',
      'What was your wedding day actually like?',
      'Who was your best friend over the years?',
      'What does a good marriage take, in your experience?',
      'Is there someone who shaped the person you became?',
    ],
  },
  {
    title: 'Work, money, and the world changing',
    questions: [
      'What was your first job, and what did it pay?',
      'What did you want to be when you were young?',
      'What is the hardest you ever worked?',
      'How has the world changed most in your lifetime?',
      'What did you worry about at my age?',
      'Was there a moment that changed the direction of your life?',
    ],
  },
  {
    title: 'Lessons and looking back',
    questions: [
      'What are you proudest of?',
      'What would you do differently if you could?',
      'What is the best advice you were ever given?',
      'What do you know now that you wish you had known at thirty?',
      'What do you want your grandchildren to remember about you?',
      'When have you been happiest?',
    ],
  },
];

export default function QuestionsToAskParentsPage() {
  return (
    <>
      <Script id="article-schema-questions-parents" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: 'Questions to ask your parents about their life',
          description: 'More than sixty questions to ask your parents and grandparents about their lives, grouped by theme, plus how to have the conversation.',
          author: { '@type': 'Organization', name: 'Ancestorii' },
          publisher: { '@type': 'Organization', name: 'Ancestorii', logo: { '@type': 'ImageObject', url: 'https://www.ancestorii.com/logo.png' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.ancestorii.com/guides/questions-to-ask-your-parents-about-their-life' },
          datePublished: '2026-06-20', dateModified: '2026-06-20',
        })}
      </Script>

      <Script id="breadcrumb-schema-questions-parents" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ancestorii.com/' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.ancestorii.com/guides' },
            { '@type': 'ListItem', position: 3, name: 'Questions to Ask Your Parents About Their Life', item: 'https://www.ancestorii.com/guides/questions-to-ask-your-parents-about-their-life' },
          ],
        })}
      </Script>

      <Script id="howto-schema-questions-parents" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to ask your parents about their life',
          description: 'A simple way to have the conversation and keep the answers, before the stories are gone.',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Pick one theme, not all of them', text: 'Do not try to cover a whole life in one sitting. Choose one area, such as childhood, and let the conversation wander from there.' },
            { '@type': 'HowToStep', position: 2, name: 'Ask open questions', text: 'Ask questions that cannot be answered with yes or no. The best ones begin with what, how, or why, and invite a story rather than a fact.' },
            { '@type': 'HowToStep', position: 3, name: 'Record it, do not interrupt it', text: 'Use a voice recording so you can listen rather than scribble. The way someone tells a story matters as much as the story itself.' },
            { '@type': 'HowToStep', position: 4, name: 'Write it down somewhere that lasts', text: 'Save the answers somewhere intentional and private, so the whole family can find them in years to come rather than losing them in a phone.' },
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
            Questions to ask<br />
            <span className="italic text-[#A9782F]">your parents.</span>
          </h1>

          <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', width: '10rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <Body>
            <p>
              There is a particular kind of regret that arrives too late. It is the realisation that the person who knew the answers is no longer here to ask. The name of the village. The story behind the photograph. The reason the family left in the first place.
            </p>
            <p>
              Most of us mean to ask. We assume there will be time. And then one ordinary day there is not. The questions below exist so that you ask while you still can, and so that the answers do not disappear with the person who held them.
            </p>
          </Body>

          <PullQuote>
            The questions are easy.{' '}
            <span className="italic text-[#A9782F]">It is the asking we keep putting off.</span>
          </PullQuote>

          {/* WHY IT MATTERS */}
          <div className="mt-4 md:mt-8">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
            <h2 className="text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Why these questions <span className="italic text-[#A9782F]">matter.</span>
            </h2>
            <div className="mt-8 md:mt-10 xl:mt-12">
              <Body>
                <p>
                  Your parents are not a list of dates. They were children once, frightened and hopeful and unsure, long before they were anyone’s mother or father. The stories that made them are the stories that, in part, made you.
                </p>
                <p>
                  Ask the right question and something shifts. A parent who never talks about the past suddenly does. You learn things you were never told. And the next generation inherits not just names on a tree, but the voices and feelings behind them.
                </p>
              </Body>
            </div>
          </div>

          {/* QUESTION SETS */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
            <h2 className="mb-4 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              More than sixty <span className="italic text-[#A9782F]">to begin with.</span>
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#3D3526]/60 mb-6">Grouped by theme. Start anywhere. One good question is enough for an afternoon.</p>

            {SETS.map((set, i) => (
              <QuestionSet key={i} title={set.title} questions={set.questions} />
            ))}
            <div className="border-t border-[#ECE5D8]" />
          </div>

          {/* HOW TO HAVE THE CONVERSATION */}
          <div className="mt-16 md:mt-20 xl:mt-24">
            <div className="mb-10 md:mb-14 xl:mb-16" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.4), transparent 60%)' }} />
            <h2 className="mb-12 md:mb-16 xl:mb-20 text-[clamp(32px,6vw,76px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              How to actually <span className="italic text-[#A9782F]">have it.</span>
            </h2>
            <div className="space-y-12 md:space-y-16 xl:space-y-20">
              <Step number="01" title="Pick one theme, not all of them.">
                <p>Do not try to cover a whole life in one sitting. Choose one area, sit down with a cup of tea, and let the conversation wander from there. The tangents are usually where the best stories hide.</p>
              </Step>
              <Step number="02" title="Ask open questions.">
                <p>Ask questions that cannot be answered with yes or no. The best ones begin with what, how, or why, and invite a story rather than a fact. If an answer is short, simply ask what happened next.</p>
              </Step>
              <Step number="03" title="Record it. Do not interrupt it.">
                <p>Use a voice recording so you can listen properly instead of scribbling. The way your mother laughs telling a story, the pause before your father answers, all of that is worth keeping too.</p>
              </Step>
              <Step number="04" title="Put the answers somewhere that lasts.">
                <p>A voice note buried in a phone is one lost handset away from gone. Save the stories somewhere intentional and private, where the whole family can return to them for generations.</p>
              </Step>
            </div>
          </div>

          <PullQuote>
            You are not interviewing them.{' '}
            <span className="italic text-[#A9782F]">You are making sure they are remembered.</span>
          </PullQuote>

          <Body>
            <p>
              Ancestorii gives every story a home. Record the answer in your parent’s own voice, add the photograph it belongs with, and keep it in a private family space that only the people you invite can see. Years from now, your children will be able to hear their grandparents tell it themselves.
            </p>
          </Body>

          {/* CTA */}
          <div className="mt-20 md:mt-28 xl:mt-32 flex justify-center">
            <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14" style={{ background: '#1A1612' }}>
              <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3 text-center" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                Ask the question today.<br /><span className="italic text-[#C8A557]">Keep the answer forever.</span>
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

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StoreBadges from '@/components/StoreBadges';
import QuestionMarquee, { type MarqueeQuestion } from './QuestionMarquee';
import styles from './landing.module.css';

const QUESTIONS = [
  [
    'How did you meet Grandad?',
    'What was your first job?',
    'What did Christmas look like when you were small?',
    'Who taught you to cook?',
    'What was the best day of your life?',
    'Where did you grow up?',
  ],
  [
    'What do you wish you had known at twenty?',
    'What song takes you straight back?',
    'What were your parents like?',
    'What made you laugh the hardest?',
    'What are you most proud of?',
    'What should we never forget?',
  ],
];

const PALETTE = ['#FF2D87', '#2B4BFF', '#FF7A1A', '#12D3AC'];
// Ink on pink, orange and aqua; white only on blue.
const DARK_TEXT = [true, false, true, true];

// Same colour rotation as the design: each row starts two colours further on.
const ROWS: MarqueeQuestion[][] = QUESTIONS.map((row, r) =>
  row.map((text, i) => {
    const ci = (i + r * 2) % 4;
    return { text, color: PALETTE[ci], fg: DARK_TEXT[ci] ? '#0A0A0F' : '#FFFFFF' };
  })
);

// Sending a question is the app's own feature: the sender picks or writes one, the relative
// answers it in the app (see app/q/[code]) and the sender is emailed when it's answered
// (supabase/functions/prompt-answered-email).
export default function LandingQuestions() {
  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <h2 className={`${styles.h2} ${styles.headTitle} ${styles.questionsTitle}`}>
          Not sure where to start?{' '}
          <span className={styles.questionsAccent}>Send them a question.</span>
        </h2>
        <p className={styles.questionsLead}>
          Pick one of ours or write your own in the Ancestorii app, and send it to Mum, Grandad or
          anyone in the family. They answer on their phone, and you get an email when they do.
        </p>
      </div>

      <QuestionMarquee rows={ROWS} />

      <div className={`${styles.wrap} ${styles.questionsMore}`}>
        <StoreBadges theme="light" className={styles.questionsBadges} />
        <Link
          href="/guides/questions-to-ask-your-parents-about-their-life"
          className={styles.btnGhost}
        >
          More questions to ask <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

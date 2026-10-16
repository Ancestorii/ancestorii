import Link from 'next/link';
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
const DARK_TEXT = [false, false, true, true];

// Same colour rotation as the design: each row starts two colours further on.
const ROWS: MarqueeQuestion[][] = QUESTIONS.map((row, r) =>
  row.map((text, i) => {
    const ci = (i + r * 2) % 4;
    return { text, color: PALETTE[ci], fg: DARK_TEXT[ci] ? '#0A0A0F' : '#FFFFFF' };
  })
);

export default function LandingQuestions() {
  return (
    <section className={styles.questionsSection}>
      <div className={styles.wrap}>
        <h2 className={`${styles.h2} ${styles.questionsTitle}`}>
          Not sure where to start?{' '}
          <span className={styles.questionsAccent}>Start with a question.</span>
        </h2>
      </div>

      <QuestionMarquee rows={ROWS} />

      <div className={styles.questionsMore}>
        <Link
          href="/guides/questions-to-ask-your-parents-about-their-life"
          className={styles.btnGhost}
        >
          See more questions to ask <span className={styles.arrowGlyph}>→</span>
        </Link>
      </div>
    </section>
  );
}

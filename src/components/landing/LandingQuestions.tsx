import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import StoreBadges from '@/components/StoreBadges';
import Fold from './Fold';
import QuestionMarquee, { type MarqueeQuestion } from './QuestionMarquee';
import styles from './landing.module.css';
import q from './questions.module.css';

// Twelve of the 46 questions in the app's library, word for word (memory_prompts). Between them
// they cover all 10 chapters.
const QUESTIONS = [
  [
    'Picture Sunday dinner when you were growing up. What was it like?',
    'Take yourself back to school for a second. What kind of kid were you?',
    'There’s always a song that brings someone straight to mind. Which one, and who?',
    'Every family came from somewhere before here. Do you know where ours started?',
    'You never quite forget the first proper job. What was yours?',
    'Every family’s got something that would completely baffle an outsider. What’s ours?',
  ],
  [
    'There’s usually one thing that still makes everyone laugh years later. What happened?',
    'If you could sit down with yourself at twenty, what would you say?',
    'There’s usually one love story in a family worth holding onto. Whose is ours?',
    'Tell us something about this family that would surprise most people.',
    'Most families have a recipe that’s been quietly handed down. Do we have one?',
    'Before life happened, you had a plan. What did you tell people you wanted to be?',
  ],
];

// The library's chapters, in its own order (memory_prompt_chapters).
const CHAPTERS = [
  'Growing Up',
  'Holidays & Traditions',
  'Around the Table',
  'Love & Relationships',
  'Life Lessons',
  'The Stories We Retell',
  'Work & Purpose',
  'Adventures & Travel',
  'Only You Would Know',
  'Music & Hobbies',
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


// Sending a question is the app's own feature: the sender picks one of the library's questions in
// the app, the relative answers it in the app (see app/q/[code]) and the sender is emailed when
// it's answered (supabase/functions/prompt-answered-email). A question sent to someone already in
// the family gets one in-app reminder after 24 hours (send_due_prompt_nudges); one sent by link
// carries an invite instead and gets no reminder.
export default function LandingQuestions() {
  return (
    <section id="questions" className={styles.section}>
      <div className={styles.wrap}>
        <div className={q.tags}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} style={{ '--dot': 'var(--c1)' } as CSSProperties} />
            Questions
          </span>
        </div>
        <h2 className={`${styles.h2} ${styles.headTitle} ${styles.questionsTitle}`}>
          Not sure where to start?{' '}
          <span className={styles.questionsAccent}>Send them a question.</span>
        </h2>
        <p className={styles.questionsLead}>
          <span className={styles.leadFull}>
            Pick one of 46 ready-made questions in the Ancestorii app and send it to Mum, Grandad or
            anyone in the family. They answer on their phone, in their own words, and it lands in My
            Family. You get an email when they do.
          </span>
          <span className={styles.leadShort}>
            Send one of 46 questions to Mum, Grandad or anyone. They answer on their phone, and it
            lands in My Family.
          </span>
        </p>
      </div>

      <QuestionMarquee rows={ROWS} />

      <div className={`${styles.wrap} ${q.after}`}>
        <Fold label="The 10 chapters and how it works">
        <p className={q.chaptersLabel}>The 10 chapters</p>
        <ul className={q.chapters}>
          {CHAPTERS.map((chapter) => (
            <li key={chapter}>{chapter}</li>
          ))}
        </ul>
        {/* One span per note, so the bold lead-in runs on into its sentence beside the dot. */}
        <div className={q.notes}>
          <p className={q.note} style={{ '--dot': 'var(--c0)' } as CSSProperties}>
            <span>
              <strong>No answer after a day?</strong> Family members already on Ancestorii get one
              gentle reminder in the app, and sending a question by link can invite someone new
              into the family.
            </span>
          </p>
          <p className={q.note} style={{ '--dot': 'var(--c3)' } as CSSProperties}>
            <span>
              <strong>Stuck for words yourself?</strong> Story Assistance on the website asks
              questions and suggests a first line or a caption. You choose what to keep, and you
              can switch it off.
            </span>
          </p>
        </div>
        </Fold>
      </div>

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

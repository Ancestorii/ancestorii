import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { FanCard } from './familyCards';
import styles from './cardRow.module.css';

// The landing hero's photo and quote cards, laid flat: a tilted row (CardRow) or two cards
// either side of the page's own content (CardStage). Purely decorative, so hidden from
// assistive tech; each card bobs gently, never with reduced motion.

function MiniCard({ card, index }: { card: FanCard; index: number }) {
  const vars = {
    '--card': card.color,
    '--tilt': `${card.tilt}deg`,
    '--delay': `${index * -1.7}s`,
  } as CSSProperties;

  if (card.kind === 'photo') {
    return (
      <div className={`${styles.card} ${styles.photo}`} style={vars}>
        <div className={styles.photoInner}>
          <Image src={card.src} alt="" fill sizes="240px" className={styles.img} />
          <span className={styles.chip}>
            <span className={styles.chipDot} />
            <span className={styles.chipText}>{card.label}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.quote}`} style={{ ...vars, '--fg': card.fg } as CSSProperties}>
      <div className={styles.quoteMark}>“</div>
      <div className={styles.quoteText}>{card.text}</div>
      <div className={styles.quoteBy}>
        <span className={styles.quoteInitial}>{card.who[0]}</span>
        <span className={styles.quoteName}>{card.who}</span>
      </div>
    </div>
  );
}

/** A centred row of tilted cards that runs off both edges on narrow screens, like the hero ring. */
export function CardRow({ cards }: { cards: FanCard[] }) {
  return (
    <div className={styles.row} aria-hidden="true">
      {cards.map((card, i) => (
        <MiniCard key={card.kind === 'photo' ? card.src : card.text} card={card} index={i} />
      ))}
    </div>
  );
}

/** The page's own card in front, with a hero card tucked behind it on each side (wide screens). */
export function CardStage({ sides, children }: { sides: [FanCard, FanCard]; children: ReactNode }) {
  return (
    <div className={styles.stage}>
      <div className={`${styles.side} ${styles.sideLeft}`} aria-hidden="true">
        <MiniCard card={sides[0]} index={0} />
      </div>
      <div className={styles.center}>{children}</div>
      <div className={`${styles.side} ${styles.sideRight}`} aria-hidden="true">
        <MiniCard card={sides[1]} index={2} />
      </div>
    </div>
  );
}

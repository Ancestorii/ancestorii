'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Logo } from '@/components/landing/LandingBits';
import { jakarta } from '@/components/landing/fonts';
import landing from '@/components/landing/landing.module.css';
import { LOGIN_CARDS, SIGNUP_CARDS, type AuthCard } from './authCards';
import styles from './auth.module.css';

/**
 * Frame for Log In, Sign Up and the other account screens: logo, the form (children),
 * the "same account as the app" line, and the floating hero cards beside it.
 */
export default function AuthShell({
  children,
  variant = 'login',
  cards,
}: {
  children: ReactNode;
  variant?: 'login' | 'signup';
  cards?: AuthCard[];
}) {
  const clusterRef = useRef<HTMLDivElement>(null);
  const list = cards ?? (variant === 'signup' ? SIGNUP_CARDS : LOGIN_CARDS);

  // Each card bobs gently on its own sine wave (never with reduced motion): translateY(sin(t·sp + p)·a).
  // It runs as a Web Animation on the compositor (ease-in-out-sine between -a and +a), so it costs no
  // main-thread work per frame, and it pauses while the cards are off screen (phones show them below the form).
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anims = Array.from(cluster.querySelectorAll<HTMLElement>('[data-float]')).map((el) => {
      const [a, sp, p] = (el.dataset.float ?? '0,0,0').split(',').map(Number);
      const half = (Math.PI / sp) * 1000; // ms from the lowest point to the highest
      const anim = el.animate([{ transform: `translateY(${-a}px)` }, { transform: `translateY(${a}px)` }], {
        duration: half,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
      });
      // Start at phase p: the animation is at -a when sp·t + p = -π/2.
      anim.currentTime = (((p + Math.PI / 2) / sp) * 1000) % (2 * half);
      return anim;
    });
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      anims.forEach((anim) => (entry.isIntersecting ? anim.play() : anim.pause()));
    });
    // The cluster itself is a zero-size anchor; watch the column the cards fill.
    io.observe(cluster.parentElement ?? cluster);
    return () => {
      io.disconnect();
      anims.forEach((anim) => anim.cancel());
    };
  }, []);

  return (
    <div className={`${jakarta.variable} ${landing.page}`}>
      <div className={`${styles.row} ${variant === 'signup' ? styles.signup : styles.login}`}>
        <div className={`${styles.glow} ${styles.glowPink}`} aria-hidden="true" />
        <div className={`${styles.glow} ${styles.glowBlue}`} aria-hidden="true" />

        <div className={styles.formCol}>
          <div className={styles.logoRow}>
            <Logo href="/" />
          </div>
          <main className={styles.formMiddle}>
            <div className={styles.formBox}>{children}</div>
          </main>
          <div className={styles.footnote}>
            Same account as the app. &copy; {new Date().getFullYear()} Ancestorii
          </div>
        </div>

        <div className={styles.cardsCol} aria-hidden="true">
          <div ref={clusterRef} className={styles.cluster}>
            {list.map((card) => (
              <div
                key={card.kind === 'photo' ? card.src : card.text}
                className={styles.cardPos}
                style={{
                  left: card.x,
                  top: card.y,
                  zIndex: card.z,
                  transform: `rotate(${card.rotate}deg)`,
                }}
              >
                {card.kind === 'photo' ? (
                  <div
                    data-float={card.float.join(',')}
                    className={styles.photoCard}
                    style={{ width: card.w, height: card.h, '--card': card.color } as CSSProperties}
                  >
                    <div className={styles.photoCardInner}>
                      <Image src={card.src} alt="" fill sizes="520px" className={styles.photoImg} />
                      <span className={styles.photoLabel}>{card.label}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    data-float={card.float.join(',')}
                    className={styles.quoteCard}
                    style={{ width: card.w, height: card.h, '--card': card.color, '--fg': card.fg } as CSSProperties}
                  >
                    <div className={styles.quoteMark}>“</div>
                    <div className={styles.quoteText}>{card.text}</div>
                    <div className={styles.quoteBy}>
                      <span className={styles.quoteInitial}>{card.who[0]}</span>
                      <span className={styles.quoteName}>{card.who}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

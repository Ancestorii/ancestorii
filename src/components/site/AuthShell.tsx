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

  // Each card bobs gently on its own sine wave (never with reduced motion).
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = Array.from(cluster.querySelectorAll<HTMLElement>('[data-float]'));
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - t0) / 1000;
      els.forEach((el) => {
        const [a, sp, p] = (el.dataset.float ?? '0,0,0').split(',').map(Number);
        el.style.transform = `translateY(${(Math.sin(t * sp + p) * a).toFixed(2)}px)`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
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
                      <Image src={card.src} alt="" fill sizes="300px" className={styles.photoImg} />
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

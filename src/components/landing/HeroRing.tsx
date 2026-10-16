'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './landing.module.css';

export type RingCard =
  | { kind: 'photo'; label: string; src: string; color: string }
  | { kind: 'quote'; text: string; who: string; color: string; fg: string };

/**
 * The hero's curved wall of family photos and quotes. The cards sit on the inside
 * of a circle, drift slowly, pause while hovered and lean with the pointer.
 * Ported from the Claude Design file's ring script (same maths and timings).
 */
export default function HeroRing({ cards }: { cards: RingCard[] }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const view = viewRef.current;
    const ring = ringRef.current;
    if (!view || !ring) return;

    const cardEls = Array.from(ring.querySelectorAll<HTMLElement>('[data-card]'));
    const quoteEls = Array.from(ring.querySelectorAll<HTMLElement>('[data-qtext]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let STEP = 21;
    let R = 700;
    let VIS = 62;
    let offset = 0;
    let speed = reduce ? 0 : 1;
    let hover = false;
    let visible = true;
    let raf = 0;
    let resizeRaf = 0;
    let last = performance.now();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const size = () => {
      const w = view.clientWidth || 1200;
      const CW = Math.round(Math.max(170, Math.min(250, w * 0.2)));
      // Same as the design up to 1920px; wider screens get a wider ring so it still fills the width.
      R = Math.max(420, Math.min(w * 0.5, 760 + Math.max(0, w - 1920) * 0.85));
      STEP = (2 * Math.atan((CW + 26) / 2 / R) * 180) / Math.PI;
      VIS = Math.min(62, Math.max(30, (Math.atan((w * 0.62) / R) * 180) / Math.PI));
      const CH = Math.round(CW * 1.32);
      const top = Math.round(CH / 2 + 24);
      cardEls.forEach((el) => {
        el.style.width = `${CW}px`;
        el.style.height = `${CH}px`;
      });
      quoteEls.forEach((el) => {
        el.style.fontSize = `${Math.round(CW * 0.105)}px`;
      });
      ring.style.top = `${top}px`;
      view.style.perspectiveOrigin = `50% ${top}px`;
      view.style.height = `${CH + 100}px`;
    };

    const place = () => {
      ring.style.transform = `translateZ(${R - 330}px) rotateX(${(-3 - mouse.y * 3).toFixed(2)}deg) rotateY(${(mouse.x * -6).toFixed(2)}deg)`;
      const n = cardEls.length;
      const span = Math.max(n * STEP, 2 * VIS + 30);
      cardEls.forEach((el, i) => {
        let a = ((i - (n - 1) / 2) * STEP - offset) % span;
        if (a > span / 2) a -= span;
        if (a < -span / 2) a += span;
        const abs = Math.abs(a);
        const op = abs < VIS ? 1 : Math.max(0, 1 - (abs - VIS) / 14);
        el.style.transform = `translate(-50%,-50%) rotateY(${a.toFixed(3)}deg) translateZ(${-R}px)`;
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op <= 0 ? 'hidden' : 'visible';
      });
    };

    // The loop only runs while the ring is on screen (and never with reduced motion).
    const tick = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += ((hover ? 0 : 1) - speed) * 0.04;
      offset += dt * 4.2 * speed;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      place();
    };
    const start = () => {
      if (reduce || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onEnter = () => {
      hover = true;
    };
    const onLeave = () => {
      hover = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    view.addEventListener('pointerenter', onEnter);
    view.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(view);

    // Resizing changes the view's own height, so do it on the next frame
    // rather than inside the observer callback.
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        size();
        place();
      });
    });
    ro.observe(view);

    size();
    place();
    view.dataset.ready = 'true';
    start();

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      view.removeEventListener('pointerenter', onEnter);
      view.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={viewRef} className={styles.ringView} aria-hidden="true">
      <div ref={ringRef} className={styles.ring}>
        {cards.map((card, i) => (
          <div
            key={i}
            data-card={i}
            className={styles.ringCard}
            style={
              {
                '--card': card.color,
                '--fg': card.kind === 'quote' ? card.fg : '#FFFFFF',
              } as CSSProperties
            }
          >
            {card.kind === 'photo' ? (
              <div className={styles.photoCard}>
                <div className={styles.photoCardInner}>
                  <Image
                    src={card.src}
                    alt=""
                    fill
                    sizes="480px"
                    loading="eager"
                    draggable={false}
                    className={styles.coverImg}
                  />
                  <div className={styles.chipRow}>
                    <span className={styles.chip}>
                      <span className={styles.chipDot} />
                      <span className={styles.chipText}>{card.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.quoteCard}>
                <div className={styles.quoteMark}>“</div>
                <div data-qtext="" className={styles.quoteText}>
                  {card.text}
                </div>
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
  );
}

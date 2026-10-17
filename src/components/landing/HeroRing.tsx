'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './landing.module.css';

export type RingCard =
  | { kind: 'photo'; label: string; src: string; color: string }
  | { kind: 'quote'; text: string; who: string; color: string; fg: string };

const SPEED = 4.2; // degrees per second, as in the design
const EDGE = 14; // degrees over which a card fades out past the visible arc

/**
 * The hero's curved wall of family photos and quotes. The cards sit on the inside
 * of a circle, drift slowly, pause while hovered and lean with the pointer.
 * Ported from the Claude Design file's ring script (same maths and timings), but the
 * drift runs as Web Animations on the compositor, so it stays smooth while the page
 * is busy (loading, scrolling, opening the menu) and costs no main-thread work per frame.
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
    const n = cardEls.length;

    let STEP = 21;
    let R = 700;
    let VIS = 62;
    let span = 0;
    let duration = 0; // ms for one card to cross the whole span
    let anims: Animation[] = [];
    let gaps: number[] = []; // each card's currentTime minus card 0's
    let baseTime = 0; // currentTime given to card 0 when the animations were (re)built
    let baseOffset = 0; // degrees already travelled at that moment
    let rate = 1;
    let target = 1;
    let rateRaf = 0;
    let visible = true;
    let resizeRaf = 0;
    let tiltRaf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const size = () => {
      const w = view.clientWidth || 1200;
      const CW = Math.round(Math.max(170, Math.min(250, w * 0.2)));
      // Same as the design up to 1920px; wider screens get a wider ring so it still fills the width.
      R = Math.max(420, Math.min(w * 0.5, 760 + Math.max(0, w - 1920) * 0.85));
      STEP = (2 * Math.atan((CW + 26) / 2 / R) * 180) / Math.PI;
      VIS = Math.min(62, Math.max(30, (Math.atan((w * 0.62) / R) * 180) / Math.PI));
      span = Math.max(n * STEP, 2 * VIS + 30);
      duration = (span / SPEED) * 1000;
      const CH = Math.round(CW * 1.32);
      const top = Math.round(CH / 2 + 24);
      cardEls.forEach((el) => {
        el.style.width = `${CW}px`;
        el.style.height = `${CH}px`;
        el.style.left = `${-CW / 2}px`;
        el.style.top = `${-CH / 2}px`;
      });
      quoteEls.forEach((el) => {
        el.style.fontSize = `${Math.round(CW * 0.105)}px`;
      });
      ring.style.top = `${top}px`;
      view.style.perspectiveOrigin = `50% ${top}px`;
      view.style.height = `${CH + 100}px`;
    };

    const tilt = () => {
      ring.style.transform = `translateZ(${R - 330}px) rotateX(${(-3 - mouse.y * 3).toFixed(2)}deg) rotateY(${(mouse.x * -6).toFixed(2)}deg)`;
    };

    // Angle of card i once the ring has travelled `offset` degrees, wrapped into ±span/2.
    const angleOf = (i: number, offset: number) => {
      let a = ((i - (n - 1) / 2) * STEP - offset) % span;
      if (a > span / 2) a -= span;
      if (a < -span / 2) a += span;
      return a;
    };
    const opacityAt = (a: number) => {
      const abs = Math.abs(a);
      return abs < VIS ? 1 : Math.max(0, 1 - (abs - VIS) / EDGE);
    };
    const pose = (a: number) => `rotateY(${a.toFixed(3)}deg) translateZ(${-R}px)`;

    const travelled = () => {
      const t = anims[0]?.currentTime;
      return typeof t === 'number' ? baseOffset + ((t - baseTime) / 1000) * SPEED : baseOffset;
    };

    // One linear sweep from +span/2 to -span/2 per card, with the fade-out written in as
    // keyframes at the exact angles where the original script faded each card.
    const build = (offset: number) => {
      anims.forEach((a) => a.cancel());
      anims = [];
      const fracAt = (deg: number) => (span / 2 - deg) / span;
      const stops = [span / 2, VIS + EDGE, VIS, -VIS, -(VIS + EDGE), -span / 2];
      const keyframes = stops.map((deg) => ({ offset: fracAt(deg), transform: pose(deg), opacity: opacityAt(deg) }));
      cardEls.forEach((el, i) => {
        const a0 = angleOf(i, offset);
        if (reduce) {
          el.style.transform = pose(a0);
          el.style.opacity = String(opacityAt(a0));
          return;
        }
        const anim = el.animate(keyframes, { duration, iterations: Infinity, easing: 'linear' });
        anim.currentTime = fracAt(a0) * duration;
        anim.playbackRate = rate;
        anims.push(anim);
      });
      baseOffset = offset;
      baseTime = (anims[0]?.currentTime as number) ?? 0;
      gaps = anims.map((a) => ((a.currentTime as number) ?? 0) - baseTime);
      sync();
    };

    // Pause while off screen; otherwise run at the current hover rate.
    const sync = () => {
      anims.forEach((a) => {
        if (visible && a.playState !== 'running') a.play();
        if (!visible && a.playState === 'running') a.pause();
      });
    };

    // Ease the drift to a stop on hover and back up after, like the original (≈0.4s).
    const easeRate = () => {
      cancelAnimationFrame(rateRaf);
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        rate += (target - rate) * (1 - Math.pow(0.96, dt * 60));
        if (Math.abs(target - rate) < 0.01) rate = target;
        anims.forEach((a) => a.updatePlaybackRate(rate));
        if (rate !== target) {
          rateRaf = requestAnimationFrame(step);
          return;
        }
        // Rate changes land per animation; re-align the cards so they never drift apart.
        const t0 = anims[0]?.currentTime;
        if (typeof t0 !== 'number') return;
        anims.forEach((a, i) => {
          const want = t0 + gaps[i];
          if (typeof a.currentTime === 'number' && Math.abs(a.currentTime - want) > 1) a.currentTime = want;
        });
      };
      rateRaf = requestAnimationFrame(step);
    };

    // The pointer lean only animates while it is catching up with the pointer.
    const followPointer = () => {
      if (tiltRaf) return;
      const step = () => {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        tilt();
        if (Math.abs(mouse.tx - mouse.x) + Math.abs(mouse.ty - mouse.y) > 0.002) {
          tiltRaf = requestAnimationFrame(step);
        } else {
          tiltRaf = 0;
        }
      };
      tiltRaf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType === 'touch' || !visible) return;
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      followPointer();
    };
    // Mouse only: a finger passing over the ring while scrolling shouldn't slow it down.
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target = 0;
      easeRate();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target = 1;
      easeRate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    view.addEventListener('pointerenter', onEnter);
    view.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(view);

    // Resizing changes the geometry: rebuild from where the ring has got to.
    let lastWidth = view.clientWidth;
    const ro = new ResizeObserver(() => {
      if (view.clientWidth === lastWidth) return;
      lastWidth = view.clientWidth;
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const offset = travelled();
        size();
        tilt();
        build(offset);
      });
    });
    ro.observe(view);

    size();
    tilt();
    build(0);
    view.dataset.ready = 'true';

    return () => {
      cancelAnimationFrame(rateRaf);
      cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(tiltRaf);
      anims.forEach((a) => a.cancel());
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
                    // The landscape photos are cropped to fill portrait cards, so each is drawn about
                    // twice the card's width (a 250px card shows a ~480px-wide photo).
                    sizes="(max-width: 599px) 250px, (max-width: 850px) 320px, (max-width: 1250px) 40vw, 480px"
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

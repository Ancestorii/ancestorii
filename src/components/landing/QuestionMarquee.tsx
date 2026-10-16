'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './landing.module.css';

export type MarqueeQuestion = { text: string; color: string; fg: string };

/**
 * Two rows of question pills drifting in opposite directions. A row eases to a stop
 * while the pointer is over it. Each row renders its questions twice so the loop is seamless.
 */
export default function QuestionMarquee({ rows }: { rows: MarqueeQuestion[][] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const tracks = Array.from(root.querySelectorAll<HTMLElement>('[data-track]'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = tracks.map(() => ({ x: 0, speed: reduce ? 0 : 1, hover: false, period: 0 }));

    // One loop = distance from the first pill to the first pill of the repeated set.
    const measure = () => {
      tracks.forEach((track, i) => {
        const half = track.children.length / 2;
        const first = track.children[0] as HTMLElement | undefined;
        const repeat = track.children[half] as HTMLElement | undefined;
        state[i].period = first && repeat ? repeat.offsetLeft - first.offsetLeft : 0;
      });
    };

    const listeners = tracks.map((track, i) => {
      const enter = () => {
        state[i].hover = true;
      };
      const leave = () => {
        state[i].hover = false;
      };
      track.addEventListener('pointerenter', enter);
      track.addEventListener('pointerleave', leave);
      return () => {
        track.removeEventListener('pointerenter', enter);
        track.removeEventListener('pointerleave', leave);
      };
    });

    const ro = new ResizeObserver(measure);
    tracks.forEach((track) => ro.observe(track));
    measure();

    // The loop only runs while the rows are on screen (and never with reduced motion).
    let visible = true;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tracks.forEach((track, i) => {
        const s = state[i];
        if (!s.period) return;
        s.speed += ((s.hover ? 0 : 1) - s.speed) * 0.06;
        s.x = (s.x + dt * 38 * s.speed) % s.period;
        const x = i % 2 ? -s.period + s.x : -s.x;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      });
    };
    const start = () => {
      if (reduce || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(root);
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      listeners.forEach((off) => off());
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.marquee}>
      {rows.map((row, r) => (
        <div key={r} className={styles.marqueeRow}>
          <div
            data-track=""
            className={`${styles.marqueeTrack} ${r % 2 ? styles.marqueeTrackReverse : ''}`}
          >
            {[...row, ...row].map((q, i) => (
              <span
                key={i}
                className={styles.question}
                style={{ '--card': q.color, '--fg': q.fg } as CSSProperties}
                aria-hidden={i >= row.length ? true : undefined}
              >
                {q.text}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

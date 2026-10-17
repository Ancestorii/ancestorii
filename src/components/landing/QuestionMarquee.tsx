'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import styles from './landing.module.css';

export type MarqueeQuestion = { text: string; color: string; fg: string };

const SPEED = 38; // px per second, as in the design
const STILL = '(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)';

/**
 * Two rows of question pills drifting in opposite directions. A row eases to a stop
 * while the pointer is over it. Each row renders its questions twice so the loop is seamless.
 * The drift runs as Web Animations on the compositor, so it costs no main-thread work per frame.
 */
export default function QuestionMarquee({ rows }: { rows: MarqueeQuestion[][] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Touch screens get the still, wrapped rows too: two endlessly moving rows this wide (each
    // about 3,500px of pills) were what made phones and tablets drop frames while scrolling past.
    // Followed live, so a screen that switches (a 2-in-1, or device emulation) never keeps a
    // drift running under the wrapped layout.
    const still = window.matchMedia(STILL);
    let stop: (() => void) | null = null;
    const apply = () => {
      if (still.matches) {
        stop?.();
        stop = null;
      } else if (!stop) {
        stop = drift(root);
      }
    };
    apply();
    still.addEventListener('change', apply);
    return () => {
      still.removeEventListener('change', apply);
      stop?.();
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

// Starts the two rows drifting and returns a function that stops them.
function drift(root: HTMLElement): () => void {
  const tracks = Array.from(root.querySelectorAll<HTMLElement>('[data-track]'));
  const state = tracks.map(() => ({ anim: null as Animation | null, period: 0, rate: 1, target: 1, raf: 0 }));
  let visible = true;

  // Pause while off screen.
  const sync = () => {
    state.forEach(({ anim }) => {
      if (!anim) return;
      if (visible && anim.playState !== 'running') anim.play();
      if (!visible && anim.playState === 'running') anim.pause();
    });
  };

  // One loop = distance from the first pill to the first pill of the repeated set.
  const build = () => {
    tracks.forEach((track, i) => {
      const s = state[i];
      const half = track.children.length / 2;
      const first = track.children[0] as HTMLElement | undefined;
      const repeat = track.children[half] as HTMLElement | undefined;
      const period = first && repeat ? repeat.offsetLeft - first.offsetLeft : 0;
      if (!period || period === s.period) return;
      // Keep the row where it is when the loop length changes.
      const progress = s.anim && typeof s.anim.currentTime === 'number' ? (s.anim.currentTime % (s.period / SPEED * 1000)) / (s.period / SPEED * 1000) : 0;
      s.anim?.cancel();
      s.period = period;
      const from = i % 2 ? -period : 0;
      const to = i % 2 ? 0 : -period;
      const duration = (period / SPEED) * 1000;
      s.anim = track.animate(
        [{ transform: `translate3d(${from}px,0,0)` }, { transform: `translate3d(${to}px,0,0)` }],
        { duration, iterations: Infinity, easing: 'linear' }
      );
      s.anim.currentTime = progress * duration;
      s.anim.playbackRate = s.rate;
    });
    sync();
  };

  // Ease a row to a stop on hover and back up after, like the original (≈0.3s).
  const ease = (i: number) => {
    const s = state[i];
    cancelAnimationFrame(s.raf);
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      s.rate += (s.target - s.rate) * (1 - Math.pow(0.94, dt * 60));
      if (Math.abs(s.target - s.rate) < 0.01) s.rate = s.target;
      s.anim?.updatePlaybackRate(s.rate);
      if (s.rate !== s.target) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };

  const listeners = tracks.map((track, i) => {
    // Mouse only: a finger passing over a row while scrolling shouldn't stop it.
    const enter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      state[i].target = 0;
      ease(i);
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      state[i].target = 1;
      ease(i);
    };
    track.addEventListener('pointerenter', enter);
    track.addEventListener('pointerleave', leave);
    return () => {
      track.removeEventListener('pointerenter', enter);
      track.removeEventListener('pointerleave', leave);
    };
  });

  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(root);

  const ro = new ResizeObserver(build);
  tracks.forEach((track) => ro.observe(track));
  build();

  return () => {
    state.forEach((s) => {
      cancelAnimationFrame(s.raf);
      s.anim?.cancel();
    });
    io.disconnect();
    ro.disconnect();
    listeners.forEach((off) => off());
  };
}

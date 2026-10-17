'use client';

// Story Assistance for the public story editor (/stories/create, /stories/<slug>/edit).
// Same props, steps, dragging and assist calls (the shared useAssistance hook) as
// @/components/StoryAssistanceCard, drawn in the landing page's style. The dashboard
// keeps using that original component, so it is left untouched.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { X, Minus, Maximize2, Feather, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAssistance } from '@/hooks/use-assistance';
import type { AssistOption, StoryAssistanceCardProps } from '@/components/StoryAssistanceCard';
import styles from './assist.module.css';

type Step = 'welcome' | 'options' | 'suggestion';

// Option tiles take the landing colours in turn (ink text on aqua and orange).
const OPTION_TILES: CSSProperties[] = [
  { '--tile': 'var(--c0)' } as CSSProperties,
  { '--tile': 'var(--c1)' } as CSSProperties,
  { '--tile': 'var(--c3)', '--tile-fg': 'var(--ink)' } as CSSProperties,
  { '--tile': 'var(--c2)', '--tile-fg': 'var(--ink)' } as CSSProperties,
];

export default function StoryAssistanceCard({
  welcomeHeading,
  welcomeBody,
  entityName,
  options,
  assistContext,
  familyId,
  assistanceEnabled = true,
  apiEndpoint,
}: StoryAssistanceCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [step, setStep] = useState<Step>('welcome');
  const [selectedOption, setSelectedOption] = useState<AssistOption | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Draggable
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const { suggestion, isLoading, error, assist, clear } = useAssistance();

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Drag handlers (desktop only) ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [isMobile, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // ── Helper: minimize and reset position ──
  const handleMinimize = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setMinimized(true);
  }, []);

  // ── Actions ──
  const handleSelectOption = async (option: AssistOption) => {
    setSelectedOption(option);
    setStep('suggestion');
    clear();
    await assist(option.assistType, assistContext, familyId, apiEndpoint);
  };

  const handleRetry = () => {
    if (!selectedOption) return;
    clear();
    assist(selectedOption.assistType, assistContext, familyId, apiEndpoint);
  };

  const handleBack = () => {
    if (step === 'suggestion') {
      setStep('options');
      setSelectedOption(null);
      clear();
    } else if (step === 'options') {
      setStep('welcome');
    }
  };

  if (dismissed || !assistanceEnabled) return null;

  // ── MINIMIZED STATE (desktop only) ──
  if (minimized && !isMobile) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.dock}
          style={{
            bottom: `calc(24px - ${position.y}px)`,
            right: `calc(24px - ${position.x}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            dragStartRef.current = {
              x: e.clientX,
              y: e.clientY,
              posX: position.x,
              posY: position.y,
            };
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            const dx = Math.abs(e.clientX - dragStartRef.current.x);
            const dy = Math.abs(e.clientY - dragStartRef.current.y);
            if (dx < 5 && dy < 5) {
              setPosition({ x: 0, y: 0 });
              setMinimized(false);
            }
          }}
        >
          <div className={styles.dockInner}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              onMouseDown={(e) => e.stopPropagation()}
              className={styles.close}
              aria-label="Close"
            >
              <X size={12} strokeWidth={3} aria-hidden="true" />
            </button>
            {/* Mouse clicks open it through the drag handlers above; this adds the keyboard. */}
            <div
              className={styles.pill}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPosition({ x: 0, y: 0 });
                  setMinimized(false);
                }
              }}
            >
              <span className={styles.tile}>
                <Feather size={17} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className={styles.pillTitle}>Story Assistance</span>
              <span className={styles.pillNote}>Here if you need me.</span>
            </div>
          </div>
        </motion.div>
      </MotionConfig>
    );
  }

  // ── MOBILE: compact card ──
  if (isMobile) {
    if (minimized) {
      return (
        <MotionConfig reducedMotion="user">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.mDock}
          >
            <div className={styles.dockInner}>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className={styles.close}
                aria-label="Close"
              >
                <X size={12} strokeWidth={3} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMinimized(false)}
                className={styles.mPill}
              >
                <span className={`${styles.tile} ${styles.tileSm}`}>
                  <Feather size={15} strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span>Story Assistance</span>
                <Maximize2 size={14} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </MotionConfig>
      );
    }

    return (
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={step === 'welcome' ? styles.mWelcome : styles.mSheet}
          >
            <div className={styles.surface}>
              {step === 'welcome' ? (
                <div>
                  <div className={styles.mHead}>
                    <div className={styles.mHeadTitle}>
                      <span className={`${styles.tile} ${styles.tileSm}`}>
                        <Feather size={15} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      <p className={styles.label}>Story Assistance</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      className={styles.ctrl}
                      aria-label="Close"
                    >
                      <X size={16} strokeWidth={2.6} aria-hidden="true" />
                    </button>
                  </div>

                  <p className={styles.mQuestion}>Need help remembering?</p>

                  <div className={styles.mButtons}>
                    <button
                      type="button"
                      onClick={() => setStep('options')}
                      className={styles.primary}
                    >
                      Yes please
                    </button>
                    <button
                      type="button"
                      onClick={handleMinimize}
                      className={styles.textBtn}
                    >
                      No thanks, I&apos;ll write on my own
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={styles.sheetHead}>
                    <div className={styles.mHeadTitle}>
                      <span className={styles.tile}>
                        <Feather size={16} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      <p className={styles.label}>Story Assistance</p>
                    </div>
                    <div className={styles.ctrls}>
                      <button
                        type="button"
                        onClick={handleMinimize}
                        className={styles.ctrl}
                        aria-label="Minimise"
                      >
                        <Minus size={16} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className={styles.ctrl}
                        aria-label="Close"
                      >
                        <X size={16} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <CardContent
                    step={step}
                    entityName={entityName}
                    welcomeHeading={welcomeHeading}
                    welcomeBody={welcomeBody}
                    options={options}
                    selectedOption={selectedOption}
                    suggestion={suggestion}
                    isLoading={isLoading}
                    error={error}
                    onStart={() => setStep('options')}
                    onSelectOption={handleSelectOption}
                    onBack={handleBack}
                    onDismiss={handleMinimize}
                    onRetry={handleRetry}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    );
  }

  // ── DESKTOP: draggable floating card ──
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onMouseDown={handleMouseDown}
          className={styles.desk}
          style={{
            bottom: `calc(24px - ${position.y}px)`,
            right: `calc(24px - ${position.x}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div className={styles.deskCard}>
            {/* Control buttons */}
            <div className={`${styles.ctrls} ${styles.deskCtrls}`}>
              <button
                type="button"
                onClick={handleMinimize}
                className={styles.ctrl}
                title="Minimise"
                aria-label="Minimise"
              >
                <Minus size={16} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className={styles.ctrl}
                title="Close"
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </div>

            <CardContent
              step={step}
              entityName={entityName}
              welcomeHeading={welcomeHeading}
              welcomeBody={welcomeBody}
              options={options}
              selectedOption={selectedOption}
              suggestion={suggestion}
              isLoading={isLoading}
              error={error}
              onStart={() => setStep('options')}
              onSelectOption={handleSelectOption}
              onBack={handleBack}
              onDismiss={handleMinimize}
              onRetry={handleRetry}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

// ── Shared content rendered inside both mobile and desktop shells ──

function CardContent({
  step,
  entityName,
  welcomeHeading,
  welcomeBody,
  options,
  selectedOption,
  suggestion,
  isLoading,
  error,
  onStart,
  onSelectOption,
  onBack,
  onDismiss,
  onRetry,
}: {
  step: Step;
  entityName: string;
  welcomeHeading: React.ReactNode;
  welcomeBody: string;
  options: AssistOption[];
  selectedOption: AssistOption | null;
  suggestion: string;
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
  onSelectOption: (option: AssistOption) => void;
  onBack: () => void;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  const selectedIndex = selectedOption
    ? Math.max(0, options.findIndex((o) => o.key === selectedOption.key))
    : 0;

  return (
    <div className={styles.content}>
      <AnimatePresence mode="wait">
        {/* ── STEP 1: Welcome ── */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.welcomeHead}>
              <span className={styles.tile}>
                <Feather size={17} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <p className={styles.label}>Story Assistance</p>
            </div>

            <h3 className={styles.heading}>{welcomeHeading}</h3>

            <p className={styles.body}>{welcomeBody}</p>

            <button type="button" onClick={onStart} className={styles.primary}>
              Help me remember
              <span className={styles.primaryTile} aria-hidden="true">
                <ChevronRight size={18} strokeWidth={2.8} />
              </span>
            </button>

            <button type="button" onClick={onDismiss} className={styles.textBtn}>
              No thanks, I&apos;ll write on my own
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Options ── */}
        {step === 'options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <button type="button" onClick={onBack} className={styles.back}>
              <ArrowLeft size={15} strokeWidth={2.6} aria-hidden="true" />
              Back
            </button>

            <h3 className={styles.subheading}>Where would you like to start?</h3>

            <p className={styles.lead}>
              Pick a section and we&apos;ll help you find the words.
            </p>

            <div className={styles.options}>
              {options.map((option, i) => (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => onSelectOption(option)}
                  className={styles.option}
                >
                  <span
                    className={styles.optionTile}
                    style={OPTION_TILES[i % OPTION_TILES.length]}
                    aria-hidden="true"
                  >
                    {option.icon}
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{option.label}</span>
                    <span className={styles.optionDesc}>{option.description}</span>
                  </span>
                  <ChevronRight
                    size={18}
                    strokeWidth={2.6}
                    className={styles.optionChevron}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Suggestion ── */}
        {step === 'suggestion' && (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <button type="button" onClick={onBack} className={styles.back}>
              <ArrowLeft size={15} strokeWidth={2.6} aria-hidden="true" />
              Choose a different section
            </button>

            {selectedOption && (
              <div className={styles.selected}>
                <span
                  className={styles.optionTile}
                  style={OPTION_TILES[selectedIndex % OPTION_TILES.length]}
                  aria-hidden="true"
                >
                  {selectedOption.icon}
                </span>
                <h3 className={styles.subheading}>{selectedOption.label}</h3>
              </div>
            )}

            {isLoading && (
              <div className={styles.loading}>
                <Loader2 size={28} strokeWidth={2.6} className={styles.spin} aria-hidden="true" />
                <p className={styles.loadingText}>Thinking about {entityName}...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p className={styles.errorText}>{error}</p>
                <button type="button" onClick={onRetry} className={styles.retry}>
                  Try again
                </button>
              </div>
            )}

            {suggestion && !isLoading && (
              <>
                <div className={styles.suggestion}>
                  {suggestion.split('\n\n').filter(Boolean).map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    const isQuestion = trimmed.endsWith('?') && trimmed.length < 120;

                    return (
                      <div key={idx}>
                        {idx > 0 && isQuestion && (
                          <div className={styles.divider} aria-hidden="true">
                            <span className={styles.dividerDot} />
                          </div>
                        )}
                        {isQuestion ? (
                          <p className={styles.question}>{trimmed}</p>
                        ) : (
                          <p className={styles.para}>{trimmed}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className={styles.hint}>
                  Use this as a starting point. Scroll down to the{' '}
                  <span className={styles.hintStrong}>{selectedOption?.label}</span>{' '}
                  section and write it in your own words.
                </p>

                <div className={styles.actions}>
                  <button type="button" onClick={onRetry} className={styles.actionLine}>
                    Try another
                  </button>
                  <button type="button" onClick={onBack} className={styles.actionInk}>
                    Different section
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

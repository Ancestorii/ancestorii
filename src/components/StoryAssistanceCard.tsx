'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { X, Minus, Maximize2, Feather, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAssistance, useWritingAssistanceEnabled } from '@/hooks/use-assistance';
import { ui, Btn, IconBtn, Spinner, Tag, tone, jsMotion } from '@/components/dashboard/ui/AppBits';
import s from './StoryAssistanceCard.module.css';

// ── Generic types: each page provides its own options ──

export type AssistOption = {
  key: string;
  label: string;
  icon: string;
  description: string;
  assistType: string;
};

export interface StoryAssistanceCardProps {
  /** The welcome heading: use the person/entity name */
  welcomeHeading: React.ReactNode;
  /** Short welcome body text */
  welcomeBody: string;
  /** The name used in loading state ("Thinking about {entityName}...") */
  entityName: string;
  /** Selectable options shown in step 2 */
  options: AssistOption[];
  /** Context passed to the assist API for every request */
  assistContext: Record<string, unknown>;
  /** Optional family ID for access check */
  familyId?: string;
  /**
   * Profiles.writing_assistance_enabled. false hides the card; true or omitted is still checked
   * against the profile once (the assist routes answer 403 when it is off).
   */
  assistanceEnabled?: boolean;
  /** Optional API endpoint override (default: /api/ai/assist) */
  apiEndpoint?: string;
}

type Step = 'welcome' | 'options' | 'suggestion';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// The card's colour is blue (its tag dot and the feather tile).
const BLUE = 'var(--c1)';

// The options' numbered markers take the four colours in turn, with the text colour that
// reads on each (ink on pink, orange and aqua; white on blue).
const markerStyle = (i: number) => {
  const t = tone(i);
  return { '--tile': t.bg, '--tile-fg': t.fg } as CSSProperties;
};

export default function StoryAssistanceCard({
  welcomeHeading,
  welcomeBody,
  entityName,
  options,
  assistContext,
  familyId,
  assistanceEnabled,
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

  // null while the profile is being read: the card waits rather than show and then vanish
  const enabled = useWritingAssistanceEnabled(assistanceEnabled);

  // On a short screen the card scrolls inside itself: each step starts at its top (the next step
  // used to come in part-way down, its Back button and heading out of sight above).
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToTop = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

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

  if (dismissed || enabled !== true) return null;

  // ── MINIMIZED STATE (desktop only) ──
  if (minimized && !isMobile) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          {...jsMotion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cx('fixed z-[150]', s.float)}
          style={{
            bottom: `calc(var(--sa-bottom) - ${position.y}px)`,
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
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              onMouseDown={(e) => e.stopPropagation()}
              className={s.closeDot}
              aria-label="Close"
              title="Close"
            >
              <X size={12} strokeWidth={3} aria-hidden="true" />
            </button>
            {/* A mouse opens it through the drag handlers above; Enter or Space opens it from the keyboard. */}
            <div
              className={s.pill}
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
              <span className={s.tile} aria-hidden="true">
                <Feather size={17} strokeWidth={2.4} />
              </span>
              <span className={s.pillTitle}>Story Assistance</span>
              <span className={s.pillNote}>Here if you need me.</span>
            </div>
          </div>
        </motion.div>
      </MotionConfig>
    );
  }

  // ── MOBILE: compact card above the phone navigation ──
  if (isMobile) {
    if (minimized) {
      return (
        <MotionConfig reducedMotion="user">
          <motion.div
            {...jsMotion}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cx('fixed z-[150]', s.float, s.mDock)}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className={s.closeDot}
                aria-label="Close"
              >
                <X size={12} strokeWidth={3} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMinimized(false)}
                className={s.mPill}
              >
                <span className={cx(s.tile, s.tileSm)} aria-hidden="true">
                  <Feather size={15} strokeWidth={2.4} />
                </span>
                <span>Story Assistance</span>
                <Maximize2 size={15} strokeWidth={2.4} aria-hidden="true" />
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
            {...jsMotion}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cx('fixed z-[150]', s.float, step === 'welcome' ? s.mWelcome : s.mSheet)}
            role="complementary"
            aria-label="Story Assistance"
          >
            <div ref={scrollRef} className={s.surface}>
              {step === 'welcome' ? (
                <div className={s.mWelcomeInner}>
                  <div className={s.head}>
                    <Tag dot={BLUE}>Story Assistance</Tag>
                    <IconBtn label="Close" size="sm" ghost onClick={() => setDismissed(true)}>
                      <X size={18} strokeWidth={2.4} aria-hidden="true" />
                    </IconBtn>
                  </div>

                  <p className={s.mQuestion}>Need help remembering?</p>

                  <div className={s.mButtons}>
                    <Btn size="sm" block onClick={() => setStep('options')}>
                      Yes please
                    </Btn>
                    <Btn size="sm" variant="ghost" block onClick={handleMinimize} className="whitespace-normal">
                      No thanks, I&apos;ll write on my own
                    </Btn>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={cx(s.head, s.sheetHead)}>
                    <Tag dot={BLUE}>Story Assistance</Tag>
                    <div className={s.ctrls}>
                      <IconBtn label="Minimise" size="sm" onClick={handleMinimize}>
                        <Minus size={17} strokeWidth={2.4} aria-hidden="true" />
                      </IconBtn>
                      <IconBtn label="Close" size="sm" onClick={() => setDismissed(true)}>
                        <X size={17} strokeWidth={2.4} aria-hidden="true" />
                      </IconBtn>
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
                    onStepShown={scrollToTop}
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
          {...jsMotion}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onMouseDown={handleMouseDown}
          className={cx('fixed z-[150]', s.float, s.desk)}
          style={{
            bottom: `calc(var(--sa-bottom) - ${position.y}px)`,
            right: `calc(24px - ${position.x}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          role="complementary"
          aria-label="Story Assistance"
        >
          <div ref={scrollRef} className={s.deskCard}>
            {/* Header: the tag, then the minimise and close buttons */}
            <div className={cx(s.head, s.deskHead)}>
              <Tag dot={BLUE}>Story Assistance</Tag>
              <div className={s.ctrls}>
                <IconBtn label="Minimise" size="sm" onClick={handleMinimize}>
                  <Minus size={17} strokeWidth={2.4} aria-hidden="true" />
                </IconBtn>
                <IconBtn label="Close" size="sm" onClick={() => setDismissed(true)}>
                  <X size={17} strokeWidth={2.4} aria-hidden="true" />
                </IconBtn>
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
              onStepShown={scrollToTop}
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
  onStepShown,
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
  /** The last step has faded out: the card's scroller goes back to its top for the next one. */
  onStepShown?: () => void;
}) {
  // The chosen option keeps the colour it had in the list.
  const selectedIndex = selectedOption
    ? Math.max(0, options.findIndex((o) => o.key === selectedOption.key))
    : 0;

  return (
    <div className={s.content}>
      <AnimatePresence mode="wait" onExitComplete={onStepShown}>
        {/* ── STEP 1: Welcome ── */}
        {step === 'welcome' && (
          <motion.div
            {...jsMotion}
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className={s.heading}>{welcomeHeading}</h3>

            <p className={s.body}>{welcomeBody}</p>

            <Btn
              block
              onClick={onStart}
              tile={<ChevronRight size={18} strokeWidth={2.6} />}
              className="mt-5"
            >
              Help me remember
            </Btn>

            <Btn variant="ghost" block onClick={onDismiss} className="mt-1.5 whitespace-normal">
              No thanks, I&apos;ll write on my own
            </Btn>
          </motion.div>
        )}

        {/* ── STEP 2: Options ── */}
        {step === 'options' && (
          <motion.div
            {...jsMotion}
            key="options"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Btn
              variant="soft"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />}
              className={s.back}
            >
              Back
            </Btn>

            <h3 className={s.subheading}>Where would you like to start?</h3>

            <p className={s.lead}>Pick a section and we&apos;ll help you find the words.</p>

            <div className={s.options}>
              {options.map((option, i) => (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => onSelectOption(option)}
                  className={cx(ui.option, s.option)}
                >
                  <span className={s.marker} style={markerStyle(i)} aria-hidden="true">
                    {option.icon}
                  </span>
                  <span className={s.optionText}>
                    <span className={s.optionTitle}>{option.label}</span>
                    <span className={s.optionDesc}>{option.description}</span>
                  </span>
                  <ChevronRight size={18} strokeWidth={2.4} className={s.optionChevron} aria-hidden="true" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Suggestion ── */}
        {step === 'suggestion' && (
          <motion.div
            {...jsMotion}
            key="suggestion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Btn
              variant="soft"
              size="sm"
              onClick={onBack}
              icon={<ArrowLeft size={16} strokeWidth={2.4} aria-hidden="true" />}
              className={s.back}
            >
              Choose a different section
            </Btn>

            {selectedOption && (
              <div className={s.selected}>
                <span className={s.marker} style={markerStyle(selectedIndex)} aria-hidden="true">
                  {selectedOption.icon}
                </span>
                <h3 className={s.subheading}>{selectedOption.label}</h3>
              </div>
            )}

            {isLoading && (
              <div className={s.loading} role="status">
                <Spinner size={26} className={s.spin} />
                <p className={s.loadingText}>Thinking about {entityName}...</p>
              </div>
            )}

            {error && (
              <div>
                <p className={cx(ui.noticeError, s.errorText)}>{error}</p>
                <Btn size="sm" onClick={onRetry} className="mt-3">
                  Try again
                </Btn>
              </div>
            )}

            {suggestion && !isLoading && (
              <>
                <div className={s.suggestion}>
                  {suggestion.split('\n\n').filter(Boolean).map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    const isQuestion = trimmed.endsWith('?') && trimmed.length < 120;

                    return (
                      <div key={idx}>
                        {idx > 0 && isQuestion && (
                          <div className={s.divider} aria-hidden="true">
                            <span className={s.dividerDot} />
                          </div>
                        )}
                        {isQuestion ? (
                          <p className={s.question}>{trimmed}</p>
                        ) : (
                          <p className={s.para}>{trimmed}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className={s.hint}>
                  Use this as a starting point. Scroll down to the{' '}
                  <span className={s.hintStrong}>{selectedOption?.label}</span>{' '}
                  section and write it in your own words.
                </p>

                <div className={s.actions}>
                  <Btn variant="soft" onClick={onRetry}>
                    Try another
                  </Btn>
                  <Btn onClick={onBack}>
                    Different section
                  </Btn>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

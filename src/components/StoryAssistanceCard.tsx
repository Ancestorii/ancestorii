'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2, Feather, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAssistance } from '@/hooks/use-assistance';

// ── Generic types — each page provides its own options ──

export type AssistOption = {
  key: string;
  label: string;
  icon: string;
  description: string;
  assistType: string;
};

export interface StoryAssistanceCardProps {
  /** The welcome heading — use the person/entity name */
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
  /** Whether writing assistance is enabled (from user profile) */
  assistanceEnabled?: boolean;
}

type Step = 'welcome' | 'options' | 'suggestion';

export default function StoryAssistanceCard({
  welcomeHeading,
  welcomeBody,
  entityName,
  options,
  assistContext,
  familyId,
  assistanceEnabled = true,
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
    await assist(option.assistType, assistContext, familyId);
  };

  const handleRetry = () => {
    if (!selectedOption) return;
    clear();
    assist(selectedOption.assistType, assistContext, familyId);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed z-[150]"
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
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#9B8E7D] hover:text-[#6F6255] hover:bg-[#F5F0E8] transition shadow-sm"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
          <div
            className="flex items-center gap-2.5 rounded-[14px] px-4 py-3 transition hover:scale-[1.02] select-none"
            style={{
              background: 'linear-gradient(135deg, #FFFDF8, #FAF5EB)',
              border: '1.5px solid rgba(200,165,87,0.5)',
              boxShadow: '0 8px 28px rgba(22,18,12,0.18), 0 0 20px rgba(200,165,87,0.15), 0 2px 6px rgba(22,18,12,0.1)',
            }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F5EDD8] text-[#A9782F]">
              <Feather size={14} strokeWidth={1.6} />
            </div>
            <span className="text-[13px] font-semibold text-[#17120E]">Story Assistance</span>
            <span className="text-[12px] text-[#6F6255] ml-0.5">— here if you need me</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── MOBILE: compact card at top ──
  if (isMobile) {
    if (minimized) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-3 right-3 z-[150]"
        >
          <div className="relative">
            <button
              onClick={() => setDismissed(true)}
              className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#9B8E7D] hover:text-[#6F6255] hover:bg-[#F5F0E8] transition shadow-sm"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setMinimized(false)}
              className="flex items-center gap-1.5 rounded-[10px] px-3 py-2"
              style={{
                background: 'linear-gradient(135deg, #FFFDF8, #FAF5EB)',
                border: '1.5px solid rgba(200,165,87,0.5)',
                boxShadow: '0 8px 28px rgba(22,18,12,0.18), 0 0 20px rgba(200,165,87,0.15), 0 2px 6px rgba(22,18,12,0.1)',
              }}
            >
              <Feather size={11} strokeWidth={1.6} className="text-[#B8924A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#17120E]">Story Assistance</span>
              <Maximize2 size={11} className="text-[#9B8E7D]" />
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed z-[150] ${step === 'welcome' ? 'bottom-3 right-3 w-[200px]' : 'inset-3 bottom-[70px]'}`}
        >
          <div
            className="rounded-[16px] overflow-hidden overflow-y-auto"
            data-lenis-prevent
            style={{
              maxHeight: 'calc(100vh - 80px)',
              background: 'linear-gradient(180deg, rgba(255,253,248,0.97) 0%, rgba(250,245,235,0.97) 100%)',
              border: '1px solid rgba(200,165,87,0.3)',
              boxShadow: '0 12px 40px rgba(22,18,12,0.2), 0 0 20px rgba(200,165,87,0.1)',
            }}
          >
            {step === 'welcome' ? (
              <div className="px-3 py-3">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Feather size={11} strokeWidth={1.6} className="text-[#B8924A]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B8924A]">
                      Story Assistance
                    </p>
                  </div>
                  <button
                    onClick={() => setDismissed(true)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#9B8E7D]"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>

                <p
                  className="text-[13px] font-semibold text-[#17120E] leading-[1.3]"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  Need help remembering?
                </p>

                <div className="mt-2.5 flex flex-col gap-1.5">
                  <button
                    onClick={() => setStep('options')}
                    className="h-[32px] rounded-[8px] bg-[#C8A557] text-[11px] font-semibold text-white transition hover:bg-[#B8924A]"
                  >
                    Yes please
                  </button>
                  <button
                    onClick={handleMinimize}
                    className="h-[32px] rounded-[8px] text-[11px] font-semibold text-[#9B8E7D] transition hover:text-[#6F6255]"
                  >
                    No thanks, I'll write on my own
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F5EDD8] text-[#A9782F]">
                      <Feather size={13} strokeWidth={1.6} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8924A]">
                      Story Assistance
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleMinimize}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5EDD8] text-[#9B8E7D]"
                    >
                      <Minus size={13} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setDismissed(true)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5EDD8] text-[#9B8E7D]"
                    >
                      <X size={13} strokeWidth={2} />
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
    );
  }

  // ── DESKTOP: draggable floating card ──
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        onMouseDown={handleMouseDown}
        className="fixed z-[150] sa-card-width"
        style={{
          bottom: `calc(24px - ${position.y}px)`,
          right: `calc(24px - ${position.x}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-[2px] rounded-[26px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(200,165,87,0.4), rgba(200,165,87,0.1), rgba(200,165,87,0.3))',
            filter: 'blur(1px)',
          }}
        />

        {/* Card body */}
        <div
          className="relative rounded-[24px] overflow-hidden sa-card-inner" data-lenis-prevent
          style={{
            background: 'linear-gradient(180deg, rgba(255,253,248,0.95) 0%, rgba(250,245,235,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(200,165,87,0.25)',
            boxShadow: '0 24px 80px rgba(22,18,12,0.18), 0 0 60px rgba(200,165,87,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {/* Shine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 100%)',
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, rgba(200,165,87,0.6), rgba(212,175,55,0.8), rgba(200,165,87,0.6))',
            }}
          />

          {/* Control buttons */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <button
              onClick={handleMinimize}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5EDD8] text-[#9B8E7D] transition hover:bg-[#EAD8B8] hover:text-[#6F6255]"
              title="Minimise"
            >
              <Minus size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5EDD8] text-[#9B8E7D] transition hover:bg-[#EAD8B8] hover:text-[#6F6255]"
              title="Close"
            >
              <X size={14} strokeWidth={2} />
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

        {/* Responsive sizing */}
        <style jsx global>{`
          .sa-card-width {
            width: 380px;
          }
          .sa-card-inner {
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }
          .sa-card-inner::-webkit-scrollbar {
            width: 4px;
          }
          .sa-card-inner::-webkit-scrollbar-track {
            background: transparent;
          }
          .sa-card-inner::-webkit-scrollbar-thumb {
            background: rgba(200,165,87,0.3);
            border-radius: 4px;
          }

          @media (min-width: 768px) {
            .sa-card-width { width: 400px; }
          }
          @media (min-width: 1024px) {
            .sa-card-width { width: 420px; }
          }
          @media (min-width: 1280px) {
            .sa-card-width { width: 440px; }
          }
          @media (min-width: 1536px) {
            .sa-card-width { width: 480px; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
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
  return (
    <div className="relative sa-card-padding">
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
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-[10px] bg-[#F5EDD8] text-[#A9782F]">
                <Feather size={16} strokeWidth={1.6} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#B8924A]">
                Story Assistance
              </p>
            </div>

            <h3
              className="sa-heading text-[#17120E] pr-14"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              {welcomeHeading}
            </h3>

            <p className="mt-3 sa-body text-[#6F6255]">
              {welcomeBody}
            </p>

            <button
              onClick={onStart}
              className="mt-5 w-full flex items-center justify-center gap-2 sa-button-height rounded-[12px] bg-[#C8A557] sa-button-text font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
            >
              Help me remember
              <ChevronRight size={16} />
            </button>

            <button
              onClick={onDismiss}
              className="mt-2.5 w-full text-center sa-dismiss-text text-[#9B8E7D] transition hover:text-[#6F6255]"
            >
              No thanks, I'll write on my own
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
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9B8E7D] transition hover:text-[#6F6255] mb-4"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <h3
              className="sa-subheading text-[#17120E]"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              Where would you like to start?
            </h3>

            <p className="mt-2 text-[13px] leading-[1.6] text-[#6F6255]">
              Pick a section and we'll help you find the words.
            </p>

            <div className="mt-4 space-y-2">
              {options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => onSelectOption(option)}
                  className="w-full flex items-center gap-3.5 rounded-[14px] border border-[#EAD8B8] bg-[#FFFDF9] sa-option-padding text-left transition hover:border-[#C8A557] hover:shadow-[0_4px_16px_rgba(184,146,74,0.12)] group"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F5EDD8] text-[12px] font-bold tracking-[0.06em] text-[#A9782F]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="sa-option-title font-semibold text-[#17120E] group-hover:text-[#A9782F] transition">
                      {option.label}
                    </p>
                    <p className="sa-option-desc text-[#9B8E7D] leading-[1.5]">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[#C8A557] flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
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
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9B8E7D] transition hover:text-[#6F6255] mb-4"
            >
              <ArrowLeft size={14} />
              Choose a different section
            </button>

            {selectedOption && (
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#F5EDD8] text-[12px] font-bold tracking-[0.06em] text-[#A9782F]" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>{selectedOption.icon}</span>
                <h3
                  className="sa-subheading text-[#17120E]"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {selectedOption.label}
                </h3>
              </div>
            )}

            {isLoading && (
              <div className="py-10 flex flex-col items-center gap-3">
                <Loader2 size={26} className="text-[#C8A557] animate-spin" />
                <p className="text-[13px] text-[#9B8E7D] italic">
                  Thinking about {entityName}...
                </p>
              </div>
            )}

            {error && (
              <div className="py-6">
                <p className="text-[13px] text-[#9B8E7D]">{error}</p>
                <button
                  onClick={onRetry}
                  className="mt-3 text-[13px] font-semibold text-[#B8924A] hover:text-[#A9782F] transition"
                >
                  Try again
                </button>
              </div>
            )}

            {suggestion && !isLoading && (
              <>
                <div className="rounded-[14px] border border-[#EAD8B8] bg-[#FFFDF9] sa-suggestion-padding space-y-4" data-lenis-prevent>
                  {suggestion.split('\n\n').filter(Boolean).map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    const isQuestion = trimmed.endsWith('?') && trimmed.length < 120;

                    return (
                      <div key={idx}>
                        {idx > 0 && isQuestion && (
                          <div className="mb-4 mt-1 flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#EAD8B8] to-transparent" />
                            <div className="h-1.5 w-1.5 rounded-full bg-[#C8A557]" />
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-[#EAD8B8] to-transparent" />
                          </div>
                        )}
                        {isQuestion ? (
                          <p
                            className="text-[15px] sm:text-[16px] font-semibold text-[#17120E] leading-[1.3]"
                            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                          >
                            {trimmed}
                          </p>
                        ) : (
                          <p
                            className="mt-1.5 sa-suggestion-text text-[#3d3830]"
                            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                          >
                            {trimmed}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-[12px] sm:text-[13px] text-[#9B8E7D] leading-[1.6]">
                  Use this as a starting point. Scroll down to the{' '}
                  <span className="font-semibold text-[#6F6255]">{selectedOption?.label}</span>{' '}
                  section and write it in your own words.
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={onRetry}
                    className="flex-1 sa-action-height rounded-[10px] border border-[#DCC7A4] bg-white sa-action-text font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
                  >
                    Try another
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 sa-action-height rounded-[10px] bg-[#C8A557] sa-action-text font-semibold text-white shadow-[0_4px_12px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
                  >
                    Different section
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive typography & spacing ── */}
      <style jsx global>{`
        .sa-card-padding   { padding: 20px; }
        .sa-heading        { font-size: 20px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
        .sa-subheading     { font-size: 18px; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em; }
        .sa-body           { font-size: 14px; line-height: 1.7; }
        .sa-button-height  { height: 44px; }
        .sa-button-text    { font-size: 14px; }
        .sa-dismiss-text   { font-size: 13px; }
        .sa-option-padding { padding: 12px 14px; }
        .sa-option-icon    { font-size: 20px; }
        .sa-option-title   { font-size: 14px; }
        .sa-option-desc    { font-size: 12px; }
        .sa-suggestion-padding { padding: 16px; }
        .sa-suggestion-text    { font-size: 14px; line-height: 1.8; }
        .sa-action-height  { height: 40px; }
        .sa-action-text    { font-size: 13px; }

        @media (min-width: 768px) {
          .sa-card-padding   { padding: 24px; }
          .sa-heading        { font-size: 22px; }
          .sa-subheading     { font-size: 20px; }
          .sa-body           { font-size: 15px; }
          .sa-button-height  { height: 48px; }
          .sa-button-text    { font-size: 14px; }
          .sa-option-padding { padding: 14px 16px; }
          .sa-option-icon    { font-size: 22px; }
          .sa-option-title   { font-size: 15px; }
          .sa-option-desc    { font-size: 13px; }
          .sa-suggestion-padding { padding: 20px; }
          .sa-suggestion-text    { font-size: 15px; line-height: 1.85; }
          .sa-action-height  { height: 42px; }
        }

        @media (min-width: 1024px) {
          .sa-card-padding   { padding: 26px; }
          .sa-heading        { font-size: 24px; }
          .sa-body           { font-size: 15px; line-height: 1.75; }
          .sa-suggestion-text { font-size: 15px; }
        }

        @media (min-width: 1280px) {
          .sa-card-padding   { padding: 28px; }
          .sa-heading        { font-size: 26px; }
          .sa-subheading     { font-size: 22px; }
          .sa-body           { font-size: 16px; }
          .sa-button-height  { height: 50px; }
          .sa-button-text    { font-size: 15px; }
          .sa-option-padding { padding: 16px 18px; }
          .sa-option-title   { font-size: 16px; }
          .sa-option-desc    { font-size: 13px; }
          .sa-suggestion-padding { padding: 22px; }
          .sa-suggestion-text    { font-size: 16px; line-height: 1.9; }
          .sa-action-height  { height: 44px; }
          .sa-action-text    { font-size: 14px; }
        }

        @media (min-width: 1536px) {
          .sa-card-padding   { padding: 32px; }
          .sa-heading        { font-size: 28px; }
          .sa-subheading     { font-size: 24px; }
          .sa-body           { font-size: 16px; line-height: 1.8; }
          .sa-button-height  { height: 52px; }
          .sa-button-text    { font-size: 15px; }
          .sa-option-padding { padding: 18px 20px; }
          .sa-option-icon    { font-size: 24px; }
          .sa-option-title   { font-size: 16px; }
          .sa-option-desc    { font-size: 14px; line-height: 1.6; }
          .sa-suggestion-padding { padding: 26px; }
          .sa-suggestion-text    { font-size: 17px; line-height: 1.9; }
          .sa-action-height  { height: 46px; }
          .sa-action-text    { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
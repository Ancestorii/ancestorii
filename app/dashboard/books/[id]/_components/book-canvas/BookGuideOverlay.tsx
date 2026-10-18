'use client';

import { useId, useState, type ReactNode } from 'react';
import { ArrowRight, Book, Check, ImagePlus, LayoutTemplate, SquarePlus, Type, X, type LucideIcon } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, Tag, tone, useDialog } from '@/components/dashboard/ui/AppBits';
import chrome from './bookChrome.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const STEPS: { number: string; title: string; body: ReactNode; Icon: LucideIcon }[] = [
  {
    number: '01',
    title: 'Upload your photos',
    body: "Go to Media and upload photos. They'll appear in your library ready to place.",
    Icon: ImagePlus,
  },
  {
    number: '02',
    title: 'Choose a page layout',
    body: 'Go to Layout and pick a style: Portrait, Landscape, Duo, Grid, or Feature. Each page can be different.',
    Icon: LayoutTemplate,
  },
  {
    number: '03',
    title: 'Place photos on pages',
    body: 'Click a photo in your library, then click an empty slot on any page to place it.',
    Icon: SquarePlus,
  },
  {
    number: '04',
    title: 'Add headings & comments',
    body: 'Type directly on the page. Use the Text tab to toggle headings and comments on or off per page.',
    Icon: Type,
  },
  {
    number: '05',
    title: 'Design your cover',
    body: 'Navigate to Cover and pick Classic, Full Bleed, or Trio. Add a title, subtitle, and cover image.',
    Icon: Book,
  },
  {
    number: '06',
    title: 'Preview & order',
    body: "Hit Preview to check your book. When you're happy, Order Book to send it to print.",
    Icon: Check,
  },
];

export default function BookGuideOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const titleId = useId();
  // Escape closes it, Tab stays inside, focus returns to the guide card that opened it.
  const panelRef = useDialog<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className={chrome.guideWrap}>
      <div
        className={cx(ui.scrim, 'scrim-blur')}
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'guideBackdropIn 0.25s ease both' }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, chrome.guidePanel)}
        style={{ animation: 'guidePanelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div className={ui.sheetHeader}>
          <div className="min-w-0">
            <Tag dot="var(--c2)">Getting Started</Tag>
            <h2 id={titleId} className={cx(ui.sheetTitle, 'mt-3')}>
              Build your memory book
            </h2>

            <div className={chrome.guideDots}>
              {STEPS.map((step, i) => {
                const active = i === activeStep;
                const done = i < activeStep;
                return (
                  <button
                    key={step.number}
                    type="button"
                    className={chrome.guideDot}
                    onClick={() => setActiveStep(i)}
                    aria-label={`Step ${i + 1}: ${step.title}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span
                      aria-hidden="true"
                      style={{ background: active || done ? tone(i).bg : 'rgba(10, 10, 15, 0.14)' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <IconBtn label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={cx(ui.sheetBody, 'pt-2')}>
          <div className={chrome.steps}>
            {STEPS.map((step, i) => {
              const active = i === activeStep;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  aria-current={active ? 'step' : undefined}
                  className={cx(ui.option, chrome.step, active && ui.optionActive, active && chrome.stepActive)}
                >
                  <span className={chrome.stepNum} aria-hidden="true">
                    {step.number}
                  </span>

                  {active && <IconTile Icon={step.Icon} tone={tone(i)} />}

                  <span className={chrome.stepText}>
                    <span className={chrome.stepTitle}>{step.title}</span>
                    {active && <span className={chrome.stepBody}>{step.body}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={cx(ui.sheetFooter, chrome.guideFooter)}>
          <Btn
            variant="soft"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
          >
            Previous
          </Btn>

          {activeStep < STEPS.length - 1 ? (
            <Btn onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              Next
            </Btn>
          ) : (
            <Btn onClick={onClose} tile={<ArrowRight size={18} strokeWidth={2.4} />}>
              Start Building
            </Btn>
          )}
        </div>
      </div>

      <style>{`
        @keyframes guideBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes guidePanelIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

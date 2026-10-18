import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { jakarta } from '@/components/landing/fonts';
import ui from './app.module.css';

// The app kit: the inside of the platform (dashboard, onboarding) in the landing page's look.
// Classes live in app.module.css (read its header for the rules); these are the pieces every
// page repeats. Everything here expects to sit inside the .app root (the dashboard shell sets it).

export { ui };
export { useDialog } from './useDialog';

/** Root class for anything rendered outside the dashboard shell: a portal, an onboarding page. */
export const appRoot = `${jakarta.variable} ${ui.app}`;

/**
 * The four colours in the landing's order, each with the text colour that reads on it
 * (ink on pink, orange and aqua; white on blue). Cycle them with `tone(i)` for lists.
 */
export const TONES = [
  { key: 'pink', bg: 'var(--c0)', fg: 'var(--ink)' },
  { key: 'blue', bg: 'var(--c1)', fg: '#fff' },
  { key: 'orange', bg: 'var(--c2)', fg: 'var(--ink)' },
  { key: 'aqua', bg: 'var(--c3)', fg: 'var(--ink)' },
] as const;

export type Tone = (typeof TONES)[number];
export type ToneKey = Tone['key'];

export const tone = (i: number): Tone => TONES[((i % 4) + 4) % 4];
export const toneByKey = (key: ToneKey): Tone => TONES.find((t) => t.key === key) ?? TONES[0];

/** A stable colour for a name or id, so the same person keeps the same colour everywhere. */
export function toneFor(seed: string | null | undefined): Tone {
  let h = 0;
  for (const ch of seed ?? '') h = (h * 31 + ch.charCodeAt(0)) | 0;
  return tone(Math.abs(h));
}

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** Ink pill with a round coloured dot. */
export function Eyebrow({ children, dot = 'var(--c0)' }: { children: ReactNode; dot?: string }) {
  return (
    <span className={ui.eyebrow} style={{ '--dot': dot } as CSSProperties}>
      {children}
    </span>
  );
}

/** Small uppercase label with a round dot before it. */
export function Tag({ children, dot = 'var(--c0)', className }: { children: ReactNode; dot?: string; className?: string }) {
  return (
    <span className={cx(ui.tag, className)} style={{ '--dot': dot } as CSSProperties}>
      {children}
    </span>
  );
}

/** Coloured words inside a heading: pink (heading sizes only), blue (any size) or the gradient. */
export function Accent({ children, tone: t = 'pink' }: { children: ReactNode; tone?: 'pink' | 'blue' | 'gradient' }) {
  const cls = t === 'gradient' ? ui.gradientText : t === 'blue' ? ui.accentBlue : ui.accentPink;
  return <span className={cls}>{children}</span>;
}

/**
 * Top of a dashboard page: eyebrow, a big 800-weight title, meta chips, a lead, and the
 * page's actions on the right (under the text on phones). A soft pink and blue glow sits
 * behind it, like the landing hero (turn off with glow={false}).
 */
export function PageHeader({
  title,
  eyebrow,
  eyebrowDot,
  lead,
  meta,
  actions,
  size = 'lg',
  glow = true,
  className,
  children,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  eyebrowDot?: string;
  lead?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  size?: 'lg' | 'md';
  glow?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cx(ui.header, className)}>
      {glow && <div className={ui.headerGlow} aria-hidden="true" />}
      {eyebrow && (
        <div className={ui.headerTop}>
          <Eyebrow dot={eyebrowDot}>{eyebrow}</Eyebrow>
        </div>
      )}
      <div className={ui.headerRow}>
        <div className={ui.headerText}>
          <h1 className={cx(ui.title, size === 'md' && ui.titleMd)}>{title}</h1>
          {meta && <div className={ui.meta}>{meta}</div>}
          {lead && <p className={ui.lead}>{lead}</p>}
        </div>
        {actions && <div className={ui.headerActions}>{actions}</div>}
      </div>
      {children}
    </header>
  );
}

/** A section's heading row: optional tag, the title, a lead, and an action on the right. */
export function SectionHead({
  title,
  tag,
  tagDot,
  lead,
  action,
  id,
  as: As = 'h2',
  className,
  titleClassName,
}: {
  title: ReactNode;
  tag?: ReactNode;
  tagDot?: string;
  lead?: ReactNode;
  action?: ReactNode;
  id?: string;
  as?: 'h2' | 'h3';
  className?: string;
  /** Extra classes for the heading itself (a Tailwind utility here wins over the kit). */
  titleClassName?: string;
}) {
  return (
    <div className={cx(ui.sectionHead, className)}>
      <div className={ui.sectionHeadText}>
        {tag && (
          <div className="mb-3">
            <Tag dot={tagDot}>{tag}</Tag>
          </div>
        )}
        <As id={id} className={cx(ui.h2, titleClassName)}>
          {title}
        </As>
        {lead && <p className={ui.sectionLead}>{lead}</p>}
      </div>
      {action}
    </div>
  );
}

type BtnVariant = 'primary' | 'outline' | 'soft' | 'ghost' | 'danger' | 'dangerSoft' | 'light';
type BtnSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<BtnVariant, string> = {
  primary: ui.btnPrimary,
  outline: ui.btnOutline,
  soft: ui.btnSoft,
  ghost: ui.btnGhost,
  danger: ui.btnDanger,
  dangerSoft: ui.btnDangerSoft,
  light: ui.btnLight,
};

/** Class string for a button or a link that looks like one (for elements Btn can't wrap). */
export function btnClass({
  variant = 'primary',
  size = 'md',
  tiled = false,
  block = false,
  className,
}: { variant?: BtnVariant; size?: BtnSize; tiled?: boolean; block?: boolean; className?: string } = {}) {
  return cx(
    ui.btn,
    VARIANT[variant],
    size === 'sm' && ui.btnSm,
    size === 'lg' && ui.btnLg,
    tiled && ui.btnTiled,
    block && ui.btnBlock,
    className
  );
}

type BtnProps = {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  /** An icon in the pink-to-orange tile on the right (the landing's arrow button). Primary only. */
  tile?: ReactNode;
  /** An icon before the label. */
  icon?: ReactNode;
  block?: boolean;
  /** Renders a Next <Link> instead of a <button>. */
  href?: string;
  prefetch?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

/**
 * The app's button. variant: primary (ink), outline (2px ink), soft (hairline), ghost,
 * danger (solid red), dangerSoft, light (white, for ink or colour grounds).
 * `tile` puts an icon in the gradient tile on the right: use it for a page's main action.
 */
export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  tile,
  icon,
  block,
  href,
  prefetch,
  className,
  type = 'button',
  ...rest
}: BtnProps) {
  const cls = btnClass({ variant, size, tiled: !!tile, block, className });
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {tile && (
        <span className={ui.btnTile} aria-hidden="true">
          {tile}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} prefetch={prefetch} className={cls} onClick={rest.onClick as never}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...rest}>
      {content}
    </button>
  );
}

type IconBtnProps = {
  label: string;
  children: ReactNode;
  size?: 'sm' | 'md';
  ghost?: boolean;
  active?: boolean;
  onPhoto?: boolean;
  /** Red, for a delete. */
  danger?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

/** Square icon button with an accessible name. Forwards its ref (a menu can hand focus back). */
export const IconBtn = forwardRef<HTMLButtonElement, IconBtnProps>(function IconBtn(
  { label, children, size = 'md', ghost = false, active = false, onPhoto = false, danger = false, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        ui.iconBtn,
        size === 'sm' && ui.iconBtnSm,
        ghost && ui.iconBtnGhost,
        active && ui.iconBtnActive,
        onPhoto && ui.iconBtnOnPhoto,
        danger && ui.iconBtnDanger,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

/** Solid colour icon tile. */
export function IconTile({
  Icon,
  tone: t = TONES[0],
  size = 'md',
  className,
}: {
  Icon: LucideIcon;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const px = size === 'lg' ? 28 : size === 'sm' ? 18 : 22;
  return (
    <span
      className={cx(ui.iconTile, size === 'lg' && ui.iconTileLg, size === 'sm' && ui.iconTileSm, className)}
      style={{ '--tile': t.bg, '--tile-fg': t.key === 'blue' || t.key === 'pink' ? '#fff' : 'var(--ink)' } as CSSProperties}
      aria-hidden="true"
    >
      <Icon size={px} strokeWidth={2.4} />
    </span>
  );
}

/** Empty state: a colour tile, a title, a line and actions, centred in a white card. */
export function EmptyState({
  Icon,
  tone: t,
  title,
  text,
  children,
  className,
}: {
  Icon: LucideIcon;
  tone?: Tone;
  title: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(ui.empty, className)}>
      <IconTile Icon={Icon} tone={t} size="lg" />
      <h2 className={ui.emptyTitle}>{title}</h2>
      {text && <p className={ui.emptyText}>{text}</p>}
      {children && <div className={ui.emptyActions}>{children}</div>}
    </div>
  );
}

/** Loading state: three pulsing brand dots and a label. `compact` drops the half-screen
 *  height, for use inside a dialog or a card. */
export function AppLoader({
  label = 'Loading',
  compact = false,
  className,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cx(ui.loader, compact && ui.loaderCompact, className)} role="status" aria-live="polite">
      <div className={ui.loaderDots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className={ui.loaderLabel}>{label}</p>
    </div>
  );
}

/**
 * Round avatar with a coloured ring; falls back to the first letter on the ring's colour.
 * Pass `children` (e.g. a next/image with fill) to draw the photo yourself instead of `src`.
 */
export function Avatar({
  src,
  name,
  size = 48,
  ring,
  plain = false,
  className,
  children,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  /** Ring colour; defaults to a stable colour for the name. */
  ring?: Tone;
  plain?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const t = ring ?? toneFor(name);
  const initial = (name ?? '').trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={cx(ui.avatar, plain && ui.avatarPlain, className)}
      style={{ '--size': `${size}px`, '--ring': t.bg, color: t.fg } as CSSProperties}
    >
      {children ??
        (src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name ? `${name}` : ''} />
        ) : (
          <span aria-hidden="true">{initial}</span>
        ))}
    </span>
  );
}

/** Small busy ring in the current text colour (in a Btn while it works, or an icon tile). */
export function Spinner({ size = 18, label, className }: { size?: number; label?: string; className?: string }) {
  return (
    <span
      className={cx(ui.spinner, className)}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

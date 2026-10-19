'use client';
import { safeToast as toast } from '@/lib/safeToast';

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Book,
  CreditCard,
  Frame,
  Gem,
  Gift,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Trash2,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import {
  ui,
  Accent,
  AppLoader,
  Btn,
  EmptyState,
  IconTile,
  PageHeader,
  SectionHead,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import s from './orders.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Order = {
  id: string;
  book_id: string;
  tier_name: string;
  price_amount: number;
  price_currency: string;
  status: string;
  payment_status: string;
  prodigi_status: string | null;
  prodigi_tracking_url: string | null;
  shipping_name: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  amount_charged?: number | null;
  shipping_amount?: number | null;
  shipping_method?: string | null;
  reward_code?: string | null;
  book_title?: string;
};

type CanvasOrder = {
  id: string;
  canvas_id: string;
  tier_name: string;
  price_amount: number;
  price_currency: string;
  status: string;
  payment_status: string;
  prodigi_status: string | null;
  prodigi_tracking_url: string | null;
  shipping_name: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  amount_charged?: number | null;
  shipping_amount?: number | null;
  shipping_method?: string | null;
  reward_code?: string | null;
  canvas_title?: string;
};

type AcrylicOrder = {
  id: string;
  acrylic_id: string;
  tier_name: string;
  price_amount: number;
  price_currency: string;
  status: string;
  payment_status: string;
  prodigi_status: string | null;
  prodigi_tracking_url: string | null;
  shipping_name: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  amount_charged?: number | null;
  shipping_amount?: number | null;
  shipping_method?: string | null;
  reward_code?: string | null;
  acrylic_title?: string;
};

// The fields every card shows (book, canvas and acrylic orders all have them).
type OrderFields = {
  id: string;
  tier_name: string;
  price_amount: number;
  price_currency: string;
  status: string;
  payment_status: string;
  prodigi_tracking_url: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  amount_charged?: number | null;
  shipping_amount?: number | null;
  shipping_method?: string | null;
  reward_code?: string | null;
};

// Each status's words, and its dot coloured by meaning: ink placed, orange in production,
// blue shipped, aqua delivered, pink a problem or cancelled.
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  created: { label: 'Awaiting Payment', dot: 'var(--ink)' },
  paid: { label: 'Payment Received', dot: 'var(--ink)' },
  generating_pdf: { label: 'Preparing Your Book', dot: 'var(--c2)' },
  generating_image: { label: 'Preparing Your Print', dot: 'var(--c2)' },
  submitting: { label: 'Sending to Printer', dot: 'var(--c2)' },
  printing: { label: 'Printing', dot: 'var(--c2)' },
  shipped: { label: 'Shipped', dot: 'var(--c1)' },
  delivered: { label: 'Delivered', dot: 'var(--c3)' },
  cancelled: { label: 'Cancelled', dot: 'var(--c0)' },
  error: { label: 'Issue: contact support', dot: 'var(--c0)' },
};

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

export default function OrdersPage() {
  const supabase = getBrowserClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [canvasOrders, setCanvasOrders] = useState<CanvasOrder[]>([]);
  const [acrylicOrders, setAcrylicOrders] = useState<AcrylicOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'book' | 'canvas' | 'acrylic'>('book');
  const [deleting, setDeleting] = useState(false);

  // Escape cancels the delete question, Tab stays inside it.
  const confirmRef = useDialog<HTMLDivElement>(!!deleteTarget, () => setDeleteTarget(null));
  const confirmTitleId = useId();
  const confirmTextId = useId();

  useEffect(() => {
    (async () => {
      try {
        // The uid comes from the local session (no round trip); row security is the real check
        // (each order table lets a person read only the rows with their own user_id).
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        // ── The three order tables, together (they used to load one after another, each
        // followed by its own title lookup: seven round trips in a row) ──
        const [bookRes, canvasRes, acrylicRes] = await Promise.all([
          supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('canvas_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('acrylic_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);

        const loadErr = bookRes.error || canvasRes.error || acrylicRes.error;
        if (loadErr) {
          console.error('Failed to load orders:', loadErr);
          toast.error("Some of your orders couldn't be loaded. Please refresh.");
        }

        const orderRows = bookRes.data || [];
        const canvasRows = canvasRes.data || [];
        const acrylicRows = acrylicRes.data || [];

        // ── The products' titles: one batched lookup per table, all three together. A product
        // that has gone (a deleted book, say) simply falls back to its kind's name. ──
        const bookIds = [...new Set(orderRows.map((o: any) => o.book_id))];
        const canvasIds = [...new Set(canvasRows.map((o: any) => o.canvas_id))];
        const acrylicIds = [...new Set(acrylicRows.map((o: any) => o.acrylic_id))];

        const [books, canvases, acrylics] = await Promise.all([
          bookIds.length > 0 ? supabase.from('memory_books').select('id, title').in('id', bookIds) : null,
          canvasIds.length > 0 ? supabase.from('memory_canvases').select('id, title').in('id', canvasIds) : null,
          acrylicIds.length > 0 ? supabase.from('acrylic_prints').select('id, title').in('id', acrylicIds) : null,
        ]);

        const titleMap = new Map<string, string>((books?.data || []).map((b: any) => [b.id, b.title]));
        const canvasTitleMap = new Map<string, string>((canvases?.data || []).map((c: any) => [c.id, c.title]));
        const acrylicTitleMap = new Map<string, string>((acrylics?.data || []).map((a: any) => [a.id, a.title]));

        setOrders(
          orderRows.map((o: any) => ({
            ...o,
            book_title: titleMap.get(o.book_id) || 'Memory Book',
          }))
        );
        setCanvasOrders(
          canvasRows.map((o: any) => ({
            ...o,
            canvas_title: canvasTitleMap.get(o.canvas_id) || 'Memory Canvas',
          }))
        );
        setAcrylicOrders(
          acrylicRows.map((o: any) => ({
            ...o,
            acrylic_title: acrylicTitleMap.get(o.acrylic_id) || 'Acrylic Print',
          }))
        );
      } catch (err) {
        console.error('Failed to load orders:', err);
        toast.error("Your orders couldn't be loaded. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Not yet';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalOrders = orders.length + canvasOrders.length + acrylicOrders.length;

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <PageHeader
          eyebrow="Orders"
          eyebrowDot="var(--c2)"
          title={
            <>
              My <Accent>Orders</Accent>
            </>
          }
          lead="Track your orders from payment to your doorstep."
        />

        {/* Loading: in the section's place, as on the other list pages */}
        {loading && (
          <section className={ui.section} aria-label="Your orders">
            <AppLoader label="Loading your orders" />
          </section>
        )}

        {/* Empty state */}
        {!loading && totalOrders === 0 && (
          <section className={ui.section} aria-label="Your orders">
            <EmptyState
              Icon={ShoppingBag}
              tone={toneByKey('orange')}
              title="No orders yet"
              text="When you order a product, it will appear here."
            />
          </section>
        )}

        {/* Book orders */}
        {!loading && orders.length > 0 && (
          <OrderSection id="orders-books-title" label="Memory Books" count={orders.length}>
            {orders.map((order) => (
              <li key={order.id} className="min-w-0">
                <OrderCard
                  order={order}
                  title={order.book_title}
                  Icon={Book}
                  trackLabel="Track Your Book"
                  formatDate={formatDate}
                  onDelete={() => { setDeleteTarget(order.id); setDeleteType('book'); }}
                />
              </li>
            ))}
          </OrderSection>
        )}

        {/* Canvas orders */}
        {!loading && canvasOrders.length > 0 && (
          <OrderSection id="orders-canvases-title" label="Memory Canvases" count={canvasOrders.length}>
            {canvasOrders.map((order) => (
              <li key={order.id} className="min-w-0">
                <OrderCard
                  order={order}
                  title={order.canvas_title}
                  Icon={Frame}
                  trackLabel="Track Your Canvas"
                  formatDate={formatDate}
                  onDelete={() => { setDeleteTarget(order.id); setDeleteType('canvas'); }}
                />
              </li>
            ))}
          </OrderSection>
        )}

        {/* Acrylic orders */}
        {!loading && acrylicOrders.length > 0 && (
          <OrderSection id="orders-acrylics-title" label="Acrylic Prints" count={acrylicOrders.length}>
            {acrylicOrders.map((order) => (
              <li key={order.id} className="min-w-0">
                <OrderCard
                  order={order}
                  title={order.acrylic_title}
                  Icon={Gem}
                  trackLabel="Track Your Print"
                  formatDate={formatDate}
                  onDelete={() => { setDeleteTarget(order.id); setDeleteType('acrylic'); }}
                />
              </li>
            ))}
          </OrderSection>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className={cx(ui.scrim, ui.fadeIn, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            ref={confirmRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmTitleId}
            aria-describedby={confirmTextId}
            className={cx(ui.sheet, ui.confirm, ui.popIn)}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={confirmTitleId} className={ui.confirmTitle}>
              Delete this order?
            </h2>
            <p id={confirmTextId} className={ui.confirmText}>
              This order will be permanently deleted. This action cannot be undone.
            </p>

            <div className={ui.confirmActions}>
              <Btn variant="soft" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Btn>

              <Btn
                variant="danger"
                disabled={deleting}
                aria-busy={deleting || undefined}
                onClick={async () => {
                  // One delete at a time: a second click would run again and report "couldn't
                  // be removed" for a row the first click had already taken.
                  if (deleting) return;
                  setDeleting(true);
                  try {
                    const table =
                      deleteType === 'canvas' ? 'canvas_orders'
                        : deleteType === 'acrylic' ? 'acrylic_orders'
                        : 'orders';

                    // select('id') shows whether a row really went: these tables have no delete
                    // policy yet, so the delete removed nothing and the card came back on reload.
                    const { data: removed, error } = await supabase
                      .from(table)
                      .delete()
                      .eq('id', deleteTarget)
                      .select('id');

                    if (error) throw error;
                    if (!removed || removed.length === 0) {
                      toast.error("This order couldn't be removed.");
                      return;
                    }

                    if (deleteType === 'canvas') {
                      setCanvasOrders((prev) => prev.filter((o) => o.id !== deleteTarget));
                    } else if (deleteType === 'acrylic') {
                      setAcrylicOrders((prev) => prev.filter((o) => o.id !== deleteTarget));
                    } else {
                      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget));
                    }
                  } catch (err) {
                    console.error('Failed to delete order:', err);
                    toast.error("This order couldn't be removed.");
                  } finally {
                    setDeleting(false);
                    setDeleteTarget(null);
                  }
                }}
              >
                Delete forever
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── One product's orders: a heading with the count, then the cards ──
// (columns follow the space beside the sidebar: 1 on phones, 2 from tablets up)
function OrderSection({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className={ui.section} aria-labelledby={id}>
      <SectionHead
        id={id}
        title={label}
        action={
          <span className={ui.chip}>
            {count} {count === 1 ? 'order' : 'orders'}
          </span>
        }
      />
      <div className="@container">
        <ul role="list" className="grid grid-cols-1 gap-5 @xl:grid-cols-2">
          {children}
        </ul>
      </div>
    </section>
  );
}

// ── One order (book, canvas or acrylic): the same card for all three ──
function OrderCard({
  order,
  title,
  Icon,
  trackLabel,
  formatDate,
  onDelete,
}: {
  order: OrderFields;
  title?: string;
  Icon: LucideIcon;
  trackLabel: string;
  formatDate: (iso: string | null) => string;
  onDelete: () => void;
}) {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.error;
  // Never offer to delete a paid order: "error" and "cancelled" can follow a payment (fulfilment
  // failed, or the printer cancelled), and that record is what a refund or a reprint is traced from.
  // Only an unpaid order that used no reward code can be removed (the database policy says the same).
  const canDelete =
    order.payment_status !== 'paid' &&
    !order.reward_code &&
    (order.status === 'created' || order.status === 'error' || order.status === 'cancelled');
  const hasFacts = !!(order.shipping_method || order.shipping_city || order.paid_at || order.shipped_at);
  const titleId = `order-${order.id}-title`;

  return (
    <article className={cx(ui.card, s.card)} aria-labelledby={titleId}>
      <div className={s.body}>
        {/* Top row: the product's tile, the status */}
        <div className={s.top}>
          <IconTile Icon={Icon} tone={toneByKey('orange')} />
          <span
            className={cx(ui.chip, ui.chipDot)}
            style={{ '--dot': statusInfo.dot } as CSSProperties}
          >
            <span className={ui.srOnly}>Status: </span>
            {statusInfo.label}
          </span>
        </div>

        <h3 id={titleId} className={s.title}>
          {title}
        </h3>
        <div className={s.meta}>
          <span className={cx(ui.chip, ui.chipSm, s.wrapChip)}>{order.tier_name}</span>
          <span>Ordered {formatDate(order.created_at)}</span>
        </div>

        {/* Progress bar */}
        <OrderProgress status={order.status} />

        {/* Shipping and dates */}
        {hasFacts && (
          <ul role="list" className={s.facts}>
            <ShippingLine order={order} />

            {order.shipping_city && (
              <li className={s.fact}>
                <MapPin size={16} strokeWidth={2.2} aria-hidden="true" />
                <span>
                  Shipping to{' '}
                  <strong>
                    {order.shipping_city}, {order.shipping_country}
                  </strong>
                </span>
              </li>
            )}

            {order.paid_at && (
              <li className={s.fact}>
                <CreditCard size={16} strokeWidth={2.2} aria-hidden="true" />
                <span>Paid {formatDate(order.paid_at)}</span>
              </li>
            )}

            {order.shipped_at && (
              <li className={s.fact}>
                <PackageCheck size={16} strokeWidth={2.2} aria-hidden="true" />
                <span>Shipped {formatDate(order.shipped_at)}</span>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Amount paid, then the tracking link and delete */}
      <div className={s.footer}>
        <PaidTotal order={order} />

        {(order.prodigi_tracking_url || canDelete) && (
          <div className={s.actions}>
            {order.prodigi_tracking_url && (
              <a
                href={order.prodigi_tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(ui.textLink, s.trackLink)}
              >
                {trackLabel}
                <ArrowUpRight size={16} strokeWidth={2.6} aria-hidden="true" />
                <span className={ui.srOnly}> (opens in a new tab)</span>
              </a>
            )}
            {canDelete && (
              <Btn
                variant="dangerSoft"
                size="sm"
                onClick={onDelete}
                aria-haspopup="dialog"
                icon={<Trash2 size={16} strokeWidth={2.4} aria-hidden="true" />}
              >
                Delete order
              </Btn>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Amount paid + reward (shared across book/canvas/acrylic cards) ──
function PaidTotal({
  order,
}: {
  order: {
    price_currency: string;
    price_amount: number;
    amount_charged?: number | null;
    reward_code?: string | null;
  };
}) {
  const sym = CURRENCY_SYMBOL[order.price_currency] || '£';
  // amount_charged is what the customer actually paid (after any reward discount,
  // incl. shipping). Falls back to the list price for orders placed before this shipped.
  const paid = order.amount_charged ?? order.price_amount;

  return (
    <div className={s.total}>
      <span className={s.totalValue}>
        {sym}{Number(paid).toFixed(2)}
      </span>
      {order.reward_code && (
        <span className={cx(ui.chip, ui.chipSm, s.wrapChip)}>
          <Gift size={14} strokeWidth={2.4} aria-hidden="true" />
          Reward {order.reward_code}
        </span>
      )}
    </div>
  );
}

// ── Shipping method + its cost (shared across book/canvas/acrylic cards) ──
function ShippingLine({
  order,
}: {
  order: {
    price_currency: string;
    shipping_amount?: number | null;
    shipping_method?: string | null;
  };
}) {
  const sym = CURRENCY_SYMBOL[order.price_currency] || '£';
  if (!order.shipping_method) return null;

  return (
    <li className={s.fact}>
      <Truck size={16} strokeWidth={2.2} aria-hidden="true" />
      <span>
        {order.shipping_method} shipping
        {order.shipping_amount != null
          ? ` ${sym}${Number(order.shipping_amount).toFixed(2)}`
          : ''}
      </span>
    </li>
  );
}

// The colour of the dot for where an order is now: the same as its status chip's.
const currentDot = (status: string) => (STATUS_CONFIG[status] || STATUS_CONFIG.error).dot;

// ── Progress Steps ──
function OrderProgress({ status }: { status: string }) {
  const steps = ['paid', 'printing', 'shipped', 'delivered'];
  const labels = ['Paid', 'Printing', 'Shipped', 'Delivered'];

  const currentIndex = steps.indexOf(status);
  const activeIndex = currentIndex >= 0 ? currentIndex : status === 'generating_pdf' || status === 'generating_image' || status === 'submitting' ? 0 : -1;

  if (status === 'cancelled' || status === 'error' || status === 'created') {
    return null;
  }

  return (
    <ol
      className={s.track}
      aria-label="Order progress"
      style={{ '--dot': currentDot(status) } as CSSProperties}
    >
      {steps.map((step, i) => {
        const isComplete = i <= activeIndex;
        const isCurrent = i === activeIndex;

        return (
          <li
            key={step}
            className={s.step}
            data-state={isCurrent ? 'current' : isComplete ? 'done' : 'todo'}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {/* Dot */}
            <span className={s.dotRow} aria-hidden="true">
              <span className={s.dot} />
            </span>

            {/* Label below dot */}
            <span className={s.stepLabel}>{labels[i]}</span>
          </li>
        );
      })}
    </ol>
  );
}

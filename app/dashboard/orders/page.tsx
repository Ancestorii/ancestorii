'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { inter } from '@/lib/fonts';

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
  book_title?: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  created: { label: 'Awaiting Payment', color: '#7A6520', bg: '#FFF8E7' },
  paid: { label: 'Payment Received', color: '#1A6B3C', bg: '#EDFFF4' },
  generating_pdf: { label: 'Preparing Your Book', color: '#B8860B', bg: '#FFF8E7' },
  submitting: { label: 'Sending to Printer', color: '#B8860B', bg: '#FFF8E7' },
  printing: { label: 'Printing', color: '#B8860B', bg: '#FFF8E7' },
  shipped: { label: 'Shipped', color: '#1A6B3C', bg: '#EDFFF4' },
  delivered: { label: 'Delivered', color: '#1A6B3C', bg: '#EDFFF4' },
  cancelled: { label: 'Cancelled', color: '#8B2020', bg: '#FFF0F0' },
  error: { label: 'Issue — Contact Support', color: '#8B2020', bg: '#FFF0F0' },
};

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

export default function OrdersPage() {
  const supabase = getBrowserClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: orderRows, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch book titles
        const bookIds = [...new Set((orderRows || []).map((o: any) => o.book_id))];
        let titleMap = new Map<string, string>();

        if (bookIds.length > 0) {
          const { data: books } = await supabase
            .from('memory_books')
            .select('id, title')
            .in('id', bookIds);

          titleMap = new Map((books || []).map((b: any) => [b.id, b.title]));
        }

        const enriched = (orderRows || []).map((o: any) => ({
          ...o,
          book_title: titleMap.get(o.book_id) || 'Memory Book',
        }));

        setOrders(enriched);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FEFAF3 40%, #FAF7ED 100%)',
        fontFamily: inter.style.fontFamily,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#1A1714',
              letterSpacing: '-0.03em',
              marginBottom: 8,
            }}
          >
            My Orders
          </h1>
          <p style={{ fontSize: 14, color: '#6B6358' }}>
            Track your memory book orders from payment to your doorstep.
          </p>
          <div
            style={{
              width: 40,
              height: 3,
              background: '#d4af37',
              borderRadius: 2,
              marginTop: 16,
            }}
          />
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              fontSize: 14,
              color: '#A39B8F',
              fontStyle: 'italic',
            }}
          >
            Loading your orders…
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: '#FBF6EA',
                border: '1.5px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M12 3v18" />
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1714', marginBottom: 6 }}>
              No orders yet
            </p>
            <p style={{ fontSize: 13, color: '#A39B8F' }}>
              When you order a memory book, it will appear here.
            </p>
          </div>
        )}

        {/* Order cards */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => {
              const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.error;

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E4DC',
                    borderRadius: 16,
                    padding: '24px 28px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#1A1714',
                          letterSpacing: '-0.02em',
                          marginBottom: 4,
                        }}
                      >
                        {order.book_title}
                      </h3>
                      <p style={{ fontSize: 12, color: '#A39B8F' }}>
                        {order.tier_name} · Ordered {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: '5px 14px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        color: statusInfo.color,
                        background: statusInfo.bg,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 20 }}>
                    <OrderProgress status={order.status} />
                  </div>

                  {/* Details row */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 24,
                      fontSize: 13,
                      color: '#6B6358',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#1A1714' }}>
                        {CURRENCY_SYMBOL[order.price_currency] || '£'}
                        {Number(order.price_amount).toFixed(2)}
                      </span>
                    </div>

                    {order.shipping_city && (
                      <div>
                        Shipping to{' '}
                        <span style={{ fontWeight: 600, color: '#1A1714' }}>
                          {order.shipping_city}, {order.shipping_country}
                        </span>
                      </div>
                    )}

                    {order.paid_at && (
                      <div>
                        Paid {formatDate(order.paid_at)}
                      </div>
                    )}

                    {order.shipped_at && (
                      <div>
                        Shipped {formatDate(order.shipped_at)}
                      </div>
                    )}
                  </div>

                  {/* Tracking link */}
                  {order.prodigi_tracking_url && (
                    <div style={{ marginTop: 16 }}>
                      <a
                        href={order.prodigi_tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#B8860B',
                          textDecoration: 'none',
                        }}
                      >
                        Track Your Book
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="#B8860B"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    </div>
                  )}
                  {(order.status === 'created' || order.status === 'error' || order.status === 'cancelled') && (
  <div style={{ marginTop: 16 }}>
    <button
      onClick={() => setDeleteTarget(order.id)}
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#8B2020',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      Delete order
    </button>
  </div>
)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {deleteTarget && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(26, 23, 20, 0.45)',
      backdropFilter: 'blur(6px)',
    }}
    onClick={() => setDeleteTarget(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '90%',
        maxWidth: 380,
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '32px 28px 28px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        border: '1px solid #E8E4DC',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: '#FFF0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <svg width="22" height="22" fill="none" stroke="#8B2020" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </div>

      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1A1714',
          textAlign: 'center',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}
      >
        Delete this order?
      </h3>

      <p
        style={{
          fontSize: 13,
          color: '#6B6358',
          textAlign: 'center',
          lineHeight: 1.5,
          marginBottom: 28,
        }}
      >
        This order will be permanently deleted. This action cannot be undone.
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => setDeleteTarget(null)}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 12,
            border: '1.5px solid #E8E4DC',
            background: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            color: '#1A1714',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', deleteTarget);

              if (error) throw error;
              setOrders((prev) => prev.filter((o) => o.id !== deleteTarget));
            } catch (err) {
              console.error('Failed to delete order:', err);
            } finally {
              setDeleteTarget(null);
            }
          }}
          style={{
            flex: 1,
            padding: '12px 0',
            borderRadius: 12,
            border: 'none',
            background: '#8B2020',
            fontSize: 13,
            fontWeight: 700,
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          Delete forever
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// ── Progress Steps ──
function OrderProgress({ status }: { status: string }) {
  const steps = ['paid', 'printing', 'shipped', 'delivered'];
  const labels = ['Paid', 'Printing', 'Shipped', 'Delivered'];

  const currentIndex = steps.indexOf(status);
  const activeIndex = currentIndex >= 0 ? currentIndex : status === 'generating_pdf' || status === 'submitting' ? 0 : -1;

  if (status === 'cancelled' || status === 'error' || status === 'created') {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((step, i) => {
        const isComplete = i <= activeIndex;
        const isCurrent = i === activeIndex;

        return (
          <div
            key={step}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Dot */}
            <div
              style={{
                width: isCurrent ? 12 : 8,
                height: isCurrent ? 12 : 8,
                borderRadius: 99,
                background: isComplete ? '#d4af37' : '#E8E4DC',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isCurrent ? '0 0 0 4px rgba(212, 175, 55, 0.15)' : 'none',
              }}
            />

            {/* Label below dot */}
            <div
              style={{
                position: 'absolute',
                marginTop: 32,
                fontSize: 10,
                fontWeight: 600,
                color: isComplete ? '#B8860B' : '#A39B8F',
                whiteSpace: 'nowrap',
              }}
            >
              {labels[i]}
            </div>

            {/* Line */}
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < activeIndex ? '#d4af37' : '#E8E4DC',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
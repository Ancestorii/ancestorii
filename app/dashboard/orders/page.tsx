'use client';

import ComingSoon from "@/components/ComingSoon";

const ORDERS_ENABLED = false;

export default function OrdersPage() {
  if (!ORDERS_ENABLED) {
    return <ComingSoon title="Orders" />;
  }

  return (
    <div>
      {/* future orders UI */}
    </div>
  );
}
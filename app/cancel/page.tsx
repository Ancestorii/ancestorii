import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import { Accent, ArrowLink, PageHero } from "@/components/site/SiteBits";
import { CardRow } from "@/components/site/utility/CardRow";
import { ROW_CARDS } from "@/components/site/utility/familyCards";
import landing from "@/components/landing/landing.module.css";

// A Stripe return page. No checkout points here any more (each cancel_url goes back to the page
// the order started from), so it serves old links: static, not indexed, one way onwards.
export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "No charges were made. You can choose a plan anytime.",
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  return (
    <SiteShell>
      <PageHero
        title={
          <>
            Payment <Accent>cancelled</Accent>
          </>
        }
        lead={<>No charges were made. You can choose a plan anytime.</>}
      >
        {/* Ink button with the arrow tile, like the landing hero's main button. */}
        <ArrowLink href="/dashboard/plans" prefetch={false} className={landing.btnShadow}>
          Back to plans
        </ArrowLink>
      </PageHero>

      <CardRow cards={ROW_CARDS} />
    </SiteShell>
  );
}

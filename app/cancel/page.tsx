"use client";

import { useRouter } from "next/navigation";
import SiteShell from "@/components/site/SiteShell";
import { Accent, ArrowButton, PageHero } from "@/components/site/SiteBits";
import { CardRow } from "@/components/site/utility/CardRow";
import { ROW_CARDS } from "@/components/site/utility/familyCards";
import landing from "@/components/landing/landing.module.css";

export default function CancelPage() {
  const router = useRouter();

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
        <ArrowButton onClick={() => router.push("/signup")} className={landing.btnShadow}>
          Back to plans
        </ArrowButton>
      </PageHero>

      <CardRow cards={ROW_CARDS} />
    </SiteShell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import SiteShell from "@/components/site/SiteShell";
import { Accent, PageHero } from "@/components/site/SiteBits";
import { CardRow } from "@/components/site/utility/CardRow";
import { ROW_CARDS } from "@/components/site/utility/familyCards";
import landing from "@/components/landing/landing.module.css";
import styles from "./cancel.module.css";

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
        <button
          onClick={() => router.push("/signup")}
          className={`${landing.btnPrimary} ${landing.btnShadow} ${styles.button}`}
        >
          Back to plans
          <span className={landing.arrowTile} aria-hidden="true">
            →
          </span>
        </button>
      </PageHero>

      <CardRow cards={ROW_CARDS} />
    </SiteShell>
  );
}

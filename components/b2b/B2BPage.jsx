"use client";

import B2BHero from "./B2BHero";
import B2BBenefitsGrid from "./B2BBenefitsGrid";
import B2BProcessSteps from "./B2BProcessSteps";
import B2BCtaBanner from "./B2BCtaBanner";

export default function B2BPage() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <B2BHero />
      <B2BBenefitsGrid />
      <B2BProcessSteps />
      <B2BCtaBanner />
    </div>
  );
}


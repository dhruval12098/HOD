"use client";

import SectionEyebrow from "./SectionEyebrow";
import ButtonGold from "./ButtonGold";
import ButtonGhostGold from "./ButtonGhostGold";

export default function B2BCtaBanner() {
  return (
    <section
      id="b2b-cta"
      className="py-[110px] px-5 sm:px-7 lg:px-[52px] max-md:py-[70px] relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #14120D 0%, #1C1A14 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(184,146,42,0.15), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(184,146,42,0.10), transparent 50%)",
        }}
      />

      <div className="max-w-[1100px] mx-auto text-center relative z-10">
        <SectionEyebrow>Start Partnership</SectionEyebrow>
        <h2
          className="font-serif font-light tracking-[0.02em] text-[#FBF9F5] leading-[1.05] mt-5"
          style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}
        >
          Ready to Source at Scale?
        </h2>
        <p className="text-[12px] font-light tracking-[0.12em] text-[#A09580] leading-[1.9] max-w-[740px] mx-auto mt-5">
          Tell us what you need and we will respond with availability, pricing, certification options,
          and timelines within 24 hours.
        </p>

        <div className="flex gap-[18px] justify-center flex-wrap mt-10 max-md:flex-col max-md:items-stretch">
          <ButtonGold href="https://wa.me/919328536178?text=Hi%2C%20I%27d%20like%20to%20start%20a%20B2B%20partnership%20with%20House%20of%20Diams">
            Start Partnership
          </ButtonGold>
          <ButtonGhostGold href="mailto:info@houseofdiams.com?subject=B2B%20Partnership%20Enquiry">
            Email Us
          </ButtonGhostGold>
        </div>
      </div>
    </section>
  );
}


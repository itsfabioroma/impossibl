"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactLenis from "lenis/react";
import StaggeredText from "@/components/react-bits/staggered-text";
import { ScrollTextReveal } from "@/components/ui/skiper-ui/skiper31";
import { RollingText } from "@/components/ui/skiper-ui/skiper27";
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28";

export default function DashaPage() {
  return (
    <ReactLenis root>

      {/* section 1 — hero */}
      <section className="relative flex h-screen w-full items-center justify-center bg-white">

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-widest text-[#1d1d1f]/40">
            scroll down
          </span>
          <div className="h-12 w-px bg-gradient-to-b from-[#1d1d1f]/40 to-transparent" />
        </motion.div>

        <StaggeredText
          text="Dasha."
          segmentBy="chars"
          direction="top"
          delay={100}
          duration={0.8}
          blur={true}
          staggerDirection="forward"
          className="font-[900] text-[clamp(3rem,10vw,8rem)] uppercase leading-none tracking-tighter text-[#1d1d1f]"
        />
      </section>

      {/* section 2 — scroll text reveal */}
      <ScrollTextReveal text="or should I say Sacha?" />

      {/* section 3 — rolling text pyramid */}
      <section className="flex w-full flex-col items-center justify-center bg-white py-32">
        <p className="mb-6 font-serif text-lg italic tracking-wide text-[#1d1d1f]/50">
          dear Москва friend,
        </p>
        <RollingText text="YOU" speed={0.05} duration={4} />
        <RollingText text="WANTED" speed={0.05} duration={4} />
        <RollingText text="A SURPRISE" speed={0.05} duration={4} />
      </section>

      {/* section 4 — perspective text scroll */}
      <Skiper28 />

    </ReactLenis>
  );
}

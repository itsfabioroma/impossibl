"use client";

import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ReactLenis from "lenis/react";
import StaggeredText from "@/components/react-bits/staggered-text";
import { ScrollTextReveal } from "@/components/ui/skiper-ui/skiper31";
import { RollingText } from "@/components/ui/skiper-ui/skiper27";
import { Skiper28 } from "@/components/ui/skiper-ui/skiper28";
import { Skiper44 } from "@/components/ui/skiper-ui/skiper44";
import { Skiper62 } from "@/components/ui/skiper-ui/skiper62";
import RadialLiquid from "@/components/react-bits/radial-liquid";
import { Skiper72 } from "@/components/ui/skiper-ui/skiper72";
import { Skiper84 } from "@/components/ui/skiper-ui/skiper84";

function CurtainSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // clip-path reveals from top to bottom: 0% scroll = nothing visible, 100% = fully revealed
  const clipProgress = useTransform(scrollYProgress, [0.3, 0.8], [0, 100]);

  return (
    <div ref={ref} className="relative h-[300vh]">
      {/* plasma — stays fixed behind */}
      <div className="sticky top-0 z-0 flex h-screen w-full items-center justify-center overflow-hidden bg-white">
        <RadialLiquid
          width="100%"
          height="100%"
          color1="#ffffff"
          color2="#000000"
          color3="#000000"
          backgroundColor="#ffffff"
          speed={0.7}
          iterations={4}
          overallOpacity={1}
          position="bottom"
          distortionType="plasma"
          waveSize={5}
          edgeSoftness={0}
          scale={1.1}
          distortionScale={0.2}
          chromaShift={0}
          refractionStrength={25}
          refractionEdgeWidth={0.5}
          refractionWaveSpeed={1.5}
          refractionWaveFrequency={10}
          fresnelIntensity={0.5}
          edgeHighlight={0.5}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-[15vh] md:items-center md:pt-[20vh] md:pb-0 mix-blend-difference">
          <h2 className="font-geist px-6 text-center text-[clamp(1.5rem,6vw,3.75rem)] font-bold uppercase tracking-tighter text-white">
            People building the impossible.
          </h2>
        </div>

        {/* curtain — clips from top to bottom over the plasma */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{
            clipPath: useMotionTemplate`inset(0 0 ${useTransform(clipProgress, (v) => 100 - v)}% 0)`,
          }}
        >
          <Skiper62 />
        </motion.div>
      </div>
    </div>
  );
}

function FadeSection({ text, subtitle, uppercase = true }: { text: string; subtitle?: string; uppercase?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  const opacity = useTransform(scrollYProgress, [0.5, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0.5, 0.8], [0, 20]);

  return (
    <div ref={ref} className="relative h-[200vh] bg-white">
      <motion.div
        className="sticky top-0 flex h-screen flex-col items-center justify-center"
        style={{ opacity, filter: useMotionTemplate`blur(${blur}px)` }}
      >
        <span className={`text-[clamp(2rem,8vw,3.75rem)] font-bold tracking-tighter text-[#1d1d1f] ${uppercase ? "uppercase" : ""}`}>
          {text}
        </span>
        {subtitle && (
          <span className="mt-3 text-sm uppercase tracking-widest text-[#1d1d1f]/40">
            {subtitle}
          </span>
        )}
      </motion.div>
    </div>
  );
}

function PortalRevealSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  /* circle grows from 0% to 150% (overshoot to cover corners) */
  const radius = useTransform(scrollYProgress, [0.3, 0.6], [0, 150]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">
        <motion.div
          className="h-full w-full"
          style={{
            clipPath: useMotionTemplate`circle(${radius}% at 50% 50%)`,
          }}
        >
          <Skiper84 />
        </motion.div>
      </div>
    </div>
  );
}

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
      <ScrollTextReveal text="Or should I say Дарья?" uppercase={false} />

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

      {/* section 5 — and won */}
      <FadeSection text="they won." />

      {/* section 6 — scroll animation */}
      <Skiper44 />

      {/* section 7 — looking for the few */}
      <section className="flex min-h-screen w-full items-center justify-center bg-white px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-3xl text-center text-[clamp(1.5rem,5vw,3rem)] font-bold tracking-tighter text-[#1d1d1f]"
        >
          I&apos;m looking for the few like you.
        </motion.p>
      </section>

      {/* section 8+9 — plasma → curtain reveal rotating titles */}
      <CurtainSection />

      {/* section 10 — text reveal */}
      <Skiper72 />

      {/* section 11 — thought I'd finished */}
      <FadeSection text="Thought I was finished, right?" subtitle="impossibl." uppercase={false} />

      {/* section 12 — just getting started */}
      <FadeSection text="I'm just getting started." uppercase={false} />

      {/* section 13 — second brain intro */}
      <section className="flex min-h-screen w-full items-center justify-center bg-white px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="max-w-3xl text-center text-[clamp(1.5rem,5vw,3rem)] font-bold tracking-tighter text-[#1d1d1f]"
        >
          As a fun sidequest, I built something while watching your podcast. It knows everything you&apos;ve ever said.
        </motion.p>
      </section>

      {/* section 14 — portal reveal into chat */}
      <PortalRevealSection />

    </ReactLenis>
  );
}

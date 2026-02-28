"use client";

import dynamic from "next/dynamic";
import StaggeredText from "@/components/react-bits/staggered-text";

// dynamic import to avoid SSR issues w/ three.js
const AsciiWaves = dynamic(() => import("@/components/ascii-waves"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">

      {/* background */}
      <div className="absolute inset-0 z-0">
        <AsciiWaves
          characters=".:−+*=%@#"
          color="#787878"
          invert={false}
          elementSize={10}
          noiseScale={3.7}
          speed={0.19}
          intensity={0.4}
          waveTension={0.5}
          waveTwist={0.1}
          hasCursorInteraction={true}
          interactionIntensity={0.2}
        />
      </div>

      {/* content overlay */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-8 py-8 md:px-12 md:py-10">

        {/* sponsored by — top right */}
        <div className="self-end text-right text-xs tracking-widest text-white/40">
          <p>[ sponsors ]</p>
          <a href="https://ultracontext.ai" target="_blank" rel="noopener noreferrer" className="pointer-events-auto block text-white/70 hover:text-white transition-colors">[•] Ultracontext</a>
          <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="pointer-events-auto block text-orange-400/70 hover:text-orange-300 transition-colors">🔥 Firecrawl</a>
          {/* <a href="https://latitud.com" target="_blank" rel="noopener noreferrer" className="pointer-events-auto block text-[#4a6b2a]/90 hover:text-[#5a7f35] transition-colors">Λ Latitud</a> */}
        </div>

        {/* hero headline */}
        <div className="flex flex-1 items-center justify-center">
          <StaggeredText
            text="for the ones who don't fear the impossibl ."
            segmentBy="words"
            separator="|"
            direction="top"
            delay={150}
            duration={1}
            blur={true}
            staggerDirection="forward"
            exitOnScrollOut={true}
            className="max-w-5xl font-[900] text-[clamp(1.8rem,5vw,4rem)] uppercase leading-[0.9] tracking-tighter text-white justify-center"
          />
        </div>

        {/* bottom bar */}
        <div className="flex items-end justify-between">
          <span className="font-bold text-base text-white/80 md:text-lg">impossibl</span>
          <span className="font-bold text-base uppercase text-white/80 md:text-lg">SF</span>
          <span className="font-bold text-base text-white/80 md:text-lg">March 21</span>
        </div>

      </div>
    </div>
  );
}

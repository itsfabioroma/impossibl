"use client";

import dynamic from "next/dynamic";

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
          intensity={1}
          waveTension={0.5}
          waveTwist={0.1}
          hasCursorInteraction={true}
          interactionIntensity={0.2}
        />
      </div>

      {/* content overlay */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-8 py-8 md:px-12 md:py-10">

        {/* hero headline */}
        <div className="flex flex-1 items-center justify-center">
          <h1 className="max-w-5xl text-center font-[900] text-[clamp(2.5rem,8vw,7rem)] uppercase leading-[0.9] tracking-tighter text-white">
            Find your way in.
          </h1>
        </div>

        {/* bottom bar */}
        <div className="flex items-end justify-between">
          <span className="font-bold text-base text-white/80 md:text-lg">impossibl</span>
          <span className="font-bold text-base uppercase text-white/80 md:text-lg">SF</span>
          <span className="font-bold text-base text-white/80 md:text-lg">March 14</span>
        </div>

      </div>
    </div>
  );
}

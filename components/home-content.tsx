"use client";

import { useEffect, useState } from "react";

/* 48h before hackathon (march 24 8am PT) → march 22 8am PT */
const TARGET = new Date("2026-03-22T08:00:00-07:00").getTime();

interface Time { d: number; h: number; m: number; s: number }

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function HomeContent() {
  const [t, setT] = useState<Time | null>(null);

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, TARGET - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!t) return <div className="h-screen w-screen bg-black" />;

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center gap-6 px-4">

      {/* label */}
      {/* <p className="font-mono text-[clamp(0.55rem,1.5vw,0.75rem)] uppercase tracking-[0.3em] text-white/25">
        [ transmission begins in ]
      </p> */}

      {/* countdown */}
      <div className="flex items-baseline gap-3 md:gap-5 font-mono">
        {[
          { val: pad(t.d), label: "days" },
          { val: pad(t.h), label: "hrs" },
          { val: pad(t.m), label: "min" },
          { val: pad(t.s), label: "sec" },
        ].map((block, i) => (
          <div key={block.label} className="flex items-baseline gap-3 md:gap-5">
            <div className="flex flex-col items-center">
              <span className="text-[clamp(2rem,8vw,5rem)] font-light tracking-tight text-white/80 tabular-nums leading-none">
                {block.val}
              </span>
              <span className="mt-1 text-[clamp(0.45rem,1vw,0.6rem)] uppercase tracking-[0.2em] text-white/20">
                {block.label}
              </span>
            </div>

            {/* separator */}
            {i < 3 && (
              <span className="text-[clamp(1.2rem,4vw,2.5rem)] text-white/15 leading-none mb-3">
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* bottom quote */}
      <p className="max-w-xl text-center font-mono text-[clamp(0.5rem,1.2vw,0.65rem)] text-white/20 tracking-wide leading-relaxed mt-6 px-6">
        I swear by my life and my love of it that I will never live for the sake of another man, nor ask another man to live for mine.
      </p>

    </div>
  );
}

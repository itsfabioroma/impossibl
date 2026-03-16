"use client";

import { useEffect, useRef } from "react";
import CicadaCanvas from "@/components/cicada-canvas";

// cryptic clues injected as real HTML comments
const clues = [
  "I have stopped your motor.",
  "Do not attempt to find us. We do not choose to be found.",
  "The world you desired can be won, it exists, it is real, it is possible, it's yours.",
  "impossibl.com/0/0x7A5",
];

function HtmlComments() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current?.parentNode) return;
    const parent = ref.current.parentNode;
    clues.forEach(c => parent.insertBefore(document.createComment(c), ref.current));
    ref.current.remove();
  }, []);
  return <span ref={ref} />;
}

/* discrete config/analytics-looking fetch — the real challenge entry point */
function useConfig() {
  useEffect(() => {
    fetch("/api/0x6578706c616e6174696f6e73").catch(() => {});
  }, []);
}

export default function ZeroPage() {
  useConfig();

  return (
    <>
      <HtmlComments />

      <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col items-center justify-center gap-12 px-4">

        {/* cicada — dim, breathing, with random sparkles */}
        <CicadaCanvas />

        {/* terminal prompt */}
        <p className="max-w-[90vw] text-center font-mono text-[clamp(0.6rem,2.8vw,0.85rem)] lowercase tracking-wide leading-relaxed text-white/40 px-10">
          We are looking for those who see what others don&apos;t.
        </p>

      </div>
    </>
  );
}

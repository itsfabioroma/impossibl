"use client";

import { useEffect } from "react";

export default function HexPage() {
  useEffect(() => {
    console.log("Nice try.");
    console.log("You took the bait.");
    console.log("Is that really the deepest you can look?");
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center px-6">
      <p className="font-mono text-[clamp(0.6rem,1.6vw,0.8rem)] text-white/30 tracking-wide text-center leading-relaxed">
        You&apos;re not who we&apos;re looking for. <span className="font-bold text-white">Give up.</span>
      </p>
    </div>
  );
}

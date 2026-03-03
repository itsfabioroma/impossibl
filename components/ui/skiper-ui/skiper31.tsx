"use client";

import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

type CharacterProps = {
  char: string;
  index: number;
  centerIndex: number;
  scrollYProgress: any;
};

const Character = ({
  char,
  index,
  centerIndex,
  scrollYProgress,
}: CharacterProps) => {
  const distanceFromCenter = index - centerIndex;

  // scatter → assemble (0 to 0.4)
  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);

  return (
    <motion.span
      className="inline-block text-[#1d1d1f]"
      style={{ x, rotateX }}
    >
      {char}
    </motion.span>
  );
};

const ScrollTextReveal = ({ text, subtitle }: { text: string; subtitle?: string }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  // enter from below → hold → fade out
  const y = useTransform(scrollYProgress, [0, 0.3], [300, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.6, 0.9], [0, 1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0.6, 0.9], [0, 20]);

  // split into words, track global char index for scatter effect
  const words = text.split(" ");
  let globalIndex = 0;
  const totalChars = text.replace(/ /g, "").length;
  const centerIndex = Math.floor(totalChars / 2);

  return (
    <div
      ref={targetRef}
      className="relative h-[200vh] bg-white"
    >
      <motion.div
        className="sticky top-0 flex h-screen flex-col items-center justify-center gap-6 px-6"
        style={{ opacity, y, filter: useMotionTemplate`blur(${blur}px)` }}
      >
        {/* subtitle with brackets */}
        {subtitle && (
          <p className="flex items-center justify-center gap-3 text-2xl font-medium tracking-tight text-[#1d1d1f]">
            <Bracket className="h-12 text-[#1d1d1f]" />
            <span>{subtitle}</span>
            <Bracket className="h-12 scale-x-[-1] text-[#1d1d1f]" />
          </p>
        )}

        <div
          className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-4 text-[clamp(2rem,8vw,3.75rem)] font-bold uppercase tracking-tighter"
          style={{ perspective: "500px" }}
        >
          {words.map((word, wordIdx) => {
            const chars = word.split("");
            const wordElement = (
              <span key={wordIdx} className="inline-flex whitespace-nowrap">
                {chars.map((char) => {
                  const charElement = (
                    <Character
                      key={globalIndex}
                      char={char}
                      index={globalIndex}
                      centerIndex={centerIndex}
                      scrollYProgress={scrollYProgress}
                    />
                  );
                  globalIndex++;
                  return charElement;
                })}
              </span>
            );
            return wordElement;
          })}
        </div>
      </motion.div>
    </div>
  );
};

const Bracket = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 27 78"
    className={className}
  >
    <path
      fill="currentColor"
      d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
    />
  </svg>
);

export { ScrollTextReveal };

/**
 * Skiper 31 ScrollAnimation_002 — React + framer motion + lenis
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */

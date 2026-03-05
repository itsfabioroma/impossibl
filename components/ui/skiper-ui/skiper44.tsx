"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";
import { PerspectiveGrid } from "./skiper33";

const GRID_IMAGES = [
  "/dasha/1.jpeg",
  "/dasha/2.jpeg",
  "/dasha/3.jpeg",
  "/dasha/4.jpeg",
  "/dasha/5.png",
  "/dasha/6.png",
  "/dasha/7.jpg",
  "/dasha/8.png",
  "/dasha/9.jpg",
  "/dasha/10.jpg",
  "/dasha/11.jpeg",
  "/dasha/12.jpg",
  "/dasha/13.jpg",
  "/dasha/14.png",
  "/dasha/15.jpeg",
  "/dasha/16.jpeg",
  "/dasha/17.jpeg",
  "/dasha/18.jpeg",
  "/dasha/19.jpeg",
  "/dasha/20.jpeg",
];

function DarkFadeSection({ text, uppercase = true }: { text: string; uppercase?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  const opacity = useTransform(scrollYProgress, [0.5, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0.5, 0.8], [0, 20]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      <motion.div
        className="sticky top-0 flex h-screen items-center justify-center"
        style={{ opacity, filter: useMotionTemplate`blur(${blur}px)` }}
      >
        <span className={`text-[clamp(2rem,8vw,3.75rem)] font-bold tracking-tighter text-white ${uppercase ? "uppercase" : ""}`}>
          {text}
        </span>
      </motion.div>
    </div>
  );
}

const Skiper44 = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: containerProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(containerProgress, [0.2, 1], [1, 0.5]);
  const blur = useTransform(containerProgress, [0.2, 0.8], [0, 20]);
  const scaleDiv = useTransform(containerProgress, [0, 0.3], [0.98, 1]);

  return (
    <div className="font-geist flex w-full flex-col items-center overflow-x-clip bg-white pt-[50vh] text-[#1d1d1f]">
      <motion.p
        style={{ opacity: useTransform(containerProgress, [0, 0.05], [1, 0]) }}
        className="sticky top-8 z-30 mb-24 font-serif text-lg italic tracking-wide text-[#1d1d1f]/50"
      >
        Here is what you heard:
      </motion.p>
      <motion.div
        style={{
          scale: scale,
        }}
        className="sticky top-[10%] flex gap-1 px-4 pb-10 text-base font-bold tracking-tighter sm:gap-2 sm:px-6 sm:text-xl md:text-5xl md:px-0"
      >
        <div className="sticky top-[50%] h-fit shrink-0">
          <h1>It's impossible</h1>
          <div className="absolute left-full top-0 z-10 h-[40vh] w-screen -translate-y-full bg-white/90" />
          <div className="absolute -bottom-2 left-full z-10 h-[44vh] w-screen translate-y-full bg-white/90" />
        </div>
        <div className="h-fit space-y-1 sm:space-y-2">
          <h2>for a woman to succeed in tech.</h2>
          <h2>to make it into SF as a Russian.</h2>
          <h2>to contribute to Forbes.</h2>
          <h2>to host a podcast in a foreign language.</h2>
          <h2>to build a community from scratch.</h2>
          <h2>to raise kids alone in a city your parents hate.</h2>
          <h2>to get top founders to open up on camera.</h2>
        </div>
        <motion.div
          style={{
            backdropFilter: useMotionTemplate`blur(${blur}px)`,
          }}
          className="absolute inset-0 bg-white/10"
        />
      </motion.div>
      <motion.div
        ref={containerRef}
        style={{
          scale: scaleDiv,
        }}
        className="rounded-4xl z-20 mt-[20vh] flex w-full flex-col items-center bg-[#121212] font-bold tracking-tighter text-white"
      >
        {/* guess what title */}
        <span className="flex min-h-screen w-full items-center justify-center text-[clamp(2rem,8vw,3.75rem)] tracking-tighter">
          So you did it.
        </span>

        {/* perspective photo grid */}
        <PerspectiveGrid images={GRID_IMAGES} className="w-full overflow-hidden" />

        {/* you proved them wrong */}
        <DarkFadeSection text="You proved them wrong." uppercase={false} />
      </motion.div>
    </div>
  );
};

export { Skiper44 };

const Names = [
  "Gurvinder Singh",
  "Not gxuri",
  "Jane Smith",
  "Emily Chen",
  "Carlos Ramirez",
  "Ava Patel",
  "Liam O'Brien",
  "Sophia Müller",
  "Noah Kim",
  "Mia Rossi",
  "Lucas Silva",
  "Olivia Dubois",
  "Ethan Zhang",
  "Chloe Ivanova",
  "Mateo Garcia",
  "Isabella Rossi",
  "William Lee",
  "Zara Ahmed",
  "Benjamin Cohen",
  "Hana Suzuki",
];

/**
 * Skiper 44 ScrollAnimation_006 — React + framer motion
 * Inspired by and adapted from https://nextjs.org/
 * Inspired by and adapted from https://devouringdetails.com/
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

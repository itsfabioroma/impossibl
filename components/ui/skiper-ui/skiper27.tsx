"use client";

import { motion } from "framer-motion";
import React from "react";

interface RollingTextProps {
  text?: string;
  speed?: number;
  className?: string;
  duration?: number;
}

function RollingText({
  text = "ROLLING",
  speed = 0.1,
  className = "text-5xl sm:text-7xl lg:text-8xl font-bold text-[#1d1d1f]",
  duration = 4,
}: RollingTextProps) {
  const centerIndex = Math.floor(text.length / 2);

  return (
    <motion.div className={`flex ${className}`}>
      {text.split("").map((letter, index) => {
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = distanceFromCenter * speed;
        const rollDuration = 0.2 + distanceFromCenter * 0.15;
        const numberOfRolls = Math.floor(duration / rollDuration);
        const totalMovement = numberOfRolls * 1.2;

        return (
          <div
            key={index}
            className="relative inline-block overflow-hidden"
            style={{ height: "1em" }}
          >
            <motion.h1
              className="flex flex-col"
              whileInView={{
                y: `-${totalMovement}em`,
              }}
              viewport={{ once: true, margin: "0px 0px -300px 0px" }}
              transition={{
                duration: duration,
                ease: [0.15, 1, 0.1, 1],
                delay: delay,
              }}
            >
              {Array(numberOfRolls + 2)
                .fill(null)
                .map((_, copyIndex) => (
                  <span
                    key={copyIndex}
                    className="flex shrink-0 items-center justify-center"
                    style={{ height: "1.2em" }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
            </motion.h1>
          </div>
        );
      })}
    </motion.div>
  );
}

export { RollingText };

/**
 * Skiper 27 RollingText — React + framer motion
 * Inspired by and adapted from https://www.siena.film/
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

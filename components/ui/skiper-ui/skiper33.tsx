"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

interface PerspectiveGridProps {
  images: string[];
  className?: string;
}

const GridItem = ({
  img,
  isLeft,
}: {
  img: string;
  index: number;
  isLeft: boolean;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: itemProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"],
  });

  // transform values based on scroll
  const rotateX = useTransform(itemProgress, [0, 0.5, 1], [70, 0, -50]);
  const rotateZ = useTransform(
    itemProgress,
    [0, 0.5, 1],
    isLeft ? [5, 0, -1] : [-5, 0, 1]
  );
  const x = useTransform(
    itemProgress,
    [0, 0.5, 0.7, 1],
    isLeft ? ["-40%", "0%", "0%", "-10%"] : ["40%", "0%", "0%", "10%"]
  );
  const skewX = useTransform(
    itemProgress,
    [0, 0.5, 1],
    isLeft ? [-5, 0, 5] : [5, 0, -5]
  );
  const y = useTransform(itemProgress, [0, 0.5, 1], ["40%", "0%", "-10%"]);
  const blur = useTransform(itemProgress, [0, 0.5, 1], [7, 0, 4]);
  const brightness = useTransform(itemProgress, [0, 0.5, 1], [0, 100, 0]);
  const contrast = useTransform(itemProgress, [0, 0.5, 1], [180, 110, 180]);
  const scaleY = useTransform(itemProgress, [0, 0.5, 1], [1.8, 1, 1.1]);

  return (
    <motion.figure
      ref={itemRef}
      className="relative z-10 m-0"
      style={{
        perspective: "800px",
        willChange: "transform",
        z: 300,
      }}
    >
      <motion.div
        className="relative aspect-[1/1.2] w-full overflow-hidden rounded"
        style={{
          y,
          x,
          rotateX,
          rotateZ,
          skewX,
          filter: useTransform(
            [blur, brightness, contrast],
            ([b, br, c]) =>
              `blur(${b}px) brightness(${br}%) contrast(${c}%)`
          ),
          scaleY,
        }}
      >
        <motion.div
          className="absolute inset-0 h-full w-full bg-cover bg-center bg-neutral-700"
          style={{
            backgroundImage: `url(${img})`,
          }}
        />
      </motion.div>
    </motion.figure>
  );
};

const PerspectiveGrid = ({ images, className }: PerspectiveGridProps) => {
  return (
    <div className={className}>
      <div className="relative grid w-full max-w-sm mx-auto grid-cols-2 gap-8 py-[10vh]">
        {images.map((img, index) => (
          <GridItem
            key={index}
            img={img}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  );
};

export { PerspectiveGrid };

/**
 * Adapted from Skiper 33 ScrollAnimation_004 — React + framer motion
 * Inspired by and adapted from https://tympanus.net/codrops/demos/
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

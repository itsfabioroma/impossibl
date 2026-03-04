"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

const useLoop = (delay = 1300) => {
  const [key, setKey] = useState(0);

  const incrementKey = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const interval = setInterval(incrementKey, delay);
    return () => clearInterval(interval);
  }, [delay, incrementKey]);

  return { key };
};

export { useLoop };

const Skiper62 = () => {
  const { key } = useLoop();

  const array = useMemo(
    () => [
      "fearless.",
      "misunderstood.",
      "weirdos.",
      "obsessed.",
      "delusional.",
    ],
    [],
  );

  const currentItem = useMemo(() => {
    return array[key % array.length];
  }, [array, key]);

  return (
    <div className="font-geist relative z-10 flex h-screen items-center justify-center bg-white px-6 shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
      <div className="flex items-center text-[clamp(2rem,8vw,3.75rem)] font-bold uppercase leading-none tracking-tighter text-[#1d1d1f]">
        <span className="shrink-0">The&nbsp;</span>
        <div className="relative h-[1em] w-[8em] overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={key}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center whitespace-nowrap"
            >
              {currentItem}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export { Skiper62 };

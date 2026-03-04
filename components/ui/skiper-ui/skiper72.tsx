"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

import { cn } from "@/lib/utils";

interface WordData {
  word: string;
  highlight?: boolean;
  lineBreak?: boolean;
}

interface SkiperTextRevealHProps {
  words: WordData[];
  className?: string;
}

const SkiperTextRevealH: React.FC<SkiperTextRevealHProps> = ({
  words,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="h-[500vh] w-full overflow-x-clip">
      <div className="sticky top-0 flex h-screen items-center px-6">
        <p
          className={cn(
            "w-full max-w-[90%] md:w-[60%] text-[clamp(1.5rem,3.9vw,4rem)] font-medium leading-[0.9] tracking-[-0.03em]",
            className,
          )}
        >
          {words.map((w, index) => (
            <AnimatedWord
              key={index}
              word={w.word}
              highlight={w.highlight}
              lineBreak={w.lineBreak}
              index={index}
              totalWords={words.length}
              scrollProgress={scrollYProgress}
            />
          ))}
        </p>
      </div>
    </div>
  );
};

const AnimatedWord: React.FC<{
  word: string;
  highlight?: boolean;
  lineBreak?: boolean;
  index: number;
  totalWords: number;
  scrollProgress: any;
}> = ({ word, highlight, lineBreak, index, totalWords, scrollProgress }) => {
  // normalize so all words finish by scroll = 0.95
  const normalizedStart = (index / totalWords) * 0.8;
  const normalizedEnd = normalizedStart + 0.15;

  const x = useTransform(
    scrollProgress,
    [normalizedStart, normalizedEnd],
    [1200, 0],
  );

  const opacity = useTransform(
    scrollProgress,
    [normalizedStart, normalizedEnd],
    [0, 1],
  );

  return (
    <>
      {lineBreak && <br />}
      <motion.span
        className={`mr-2 inline-block ${highlight ? "text-white font-bold" : "text-white/80"}`}
        style={{ x, opacity }}
      >
        {word}
      </motion.span>
    </>
  );
};

// helper to parse text and mark highlighted words
function buildWords(text: string, highlightPhrase: string): WordData[] {
  const words = text.split(" ");
  const highlightWords = highlightPhrase.toLowerCase().split(" ");
  const result: WordData[] = [];

  for (let i = 0; i < words.length; i++) {
    // detect line break marker
    const hasBreak = words[i].startsWith("\n");
    const cleanWord = hasBreak ? words[i].replace("\n", "") : words[i];

    // check if this starts the highlight phrase
    const slice = words.slice(i, i + highlightWords.length).map((w) => w.replace("\n", "").toLowerCase());
    const isMatch = slice.length === highlightWords.length && slice.every((w, j) => w === highlightWords[j]);

    if (isMatch) {
      for (let j = 0; j < highlightWords.length; j++) {
        const brk = j === 0 && hasBreak;
        result.push({ word: words[i + j].replace("\n", ""), highlight: true, lineBreak: brk });
      }
      i += highlightWords.length - 1;
    } else {
      result.push({ word: cleanWord, lineBreak: hasBreak });
    }
  }

  return result;
}

const TEXT = "People that are not afraid. The ones that would rather be dead than insignificant. That when everyone says they can't, they push even harder. People triggered by the word impossible. There's something inside us. Hard to tell, easy to feel. You know it. We feel off in this world, but we shouldn't. There are others like us. And we're gonna find them. \nI need your help.";

const WORDS = buildWords(TEXT, "I need your help.");

const Skiper72 = () => {
  return (
    <section className="font-geist bg-[#121212] text-[22px] font-medium leading-[1.3] text-white">
      <SkiperTextRevealH words={WORDS} />
    </section>
  );
};

export { Skiper72 };

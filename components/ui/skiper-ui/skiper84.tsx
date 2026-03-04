"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Plus } from "lucide-react";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import useSound from "use-sound";
import { useChat } from "@ai-sdk/react";

import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import DotShift from "@/components/react-bits/dot-shift";

const Skiper84 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [play] = useSound("/audio/send2.wav", { volume: 0.2 });

  const { messages, sendMessage, status } = useChat();

  const isLoading = status === "streaming" || status === "submitted";

  const suggestions = [
    "Connor's closet-to-YC story?",
    "Corgi's $108M pre-launch raise?",
  ];

  /* auto-scroll to latest message (skip on mount) */
  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    play();
    setIsSubmit((x) => !x);
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden text-[#121212]">

      {/* dot shift bg */}
      <div className="absolute inset-0 z-0">
        <DotShift
          speed={0.5}
          scale={0.6}
          size={0.4}
          blur={0.5}
          color="#e879f9"
        />
      </div>

      {/* gradient pulse on send */}
      <motion.div
        key={`pulse-${isSubmit}`}
        initial={{ y: "100%", opacity: 0.2 }}
        animate={{ y: "30%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="pointer-events-none absolute left-1/2 z-[1] flex h-[100vh] w-full max-w-3xl -translate-x-1/2"
      >
        <Grad className="w-full" />
        <Grad className="w-full -translate-y-20" />
        <Grad className="w-full" />
      </motion.div>

      <div className={cn(
        "relative z-10 w-full max-w-lg px-4 flex flex-col transition-all duration-500",
        messages.length > 0
          ? "h-full justify-between py-6"
          : "justify-center"
      )}>

        {/* prompt suggestions (empty state only) */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 flex flex-wrap gap-2 justify-end"
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    play();
                    setIsSubmit((x) => !x);
                    sendMessage({ text: s });
                  }}
                  className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-black/70 shadow-sm backdrop-blur transition-colors hover:bg-white"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* messages */}
        <motion.div
          layout="position"
          className={cn(
            "mb-3 flex flex-col items-end gap-5 overflow-y-auto scrollbar-none",
            messages.length > 0 ? "flex-1" : "max-h-[50vh]"
          )}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, type: "spring", bounce: 0.4 }}
              className={cn(
                "max-w-[260px] break-words px-[14px] py-[10px] text-sm",
                msg.role === "user"
                  ? "self-end rounded-[14px_14px_6px] bg-white text-black shadow-[0_10px_20px_-6px_rgba(0,0,0,0.1)]"
                  : "self-start rounded-[14px_14px_14px_6px] bg-sky-500 text-white shadow-[0_10px_20px_-6px_rgba(0,0,0,0.2)]"
              )}
            >
              {msg.role === "user" ? (
                <p>
                  {msg.parts.map((part, i) =>
                    part.type === "text" ? <span key={i}>{part.text}</span> : null
                  )}
                </p>
              ) : (
                <div className="prose prose-sm prose-invert prose-p:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 prose-headings:m-0 max-w-none">
                  <Markdown>
                    {msg.parts
                      .filter((p): p is { type: "text"; text: string } => p.type === "text")
                      .map((p) => p.text)
                      .join("")}
                  </Markdown>
                </div>
              )}
            </motion.div>
          ))}

          {/* shimmer thinking indicator */}
          <AnimatePresence>
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.3 }}
                className="self-start"
              >
                <TextShimmer className="text-sm" duration={1}>
                  Feeding your unicorn...
                </TextShimmer>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </motion.div>

        {/* input */}
        <div className="relative rounded-3xl bg-white p-1 shadow-[0_10px_20px_-6px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between rounded-3xl bg-white p-1.5">
            <div className="flex flex-1 items-center gap-3 pr-3">
              <button className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f4f3]">
                <Plus className="size-5 text-gray-400" />
              </button>
              <input
                type="text"
                value={input}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Dasha's brain anything..."
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f4f3]"
            >
              <AnimatePresence>
                {!isLoading && (
                  <motion.span
                    initial={{ rotate: -90, x: "150%" }}
                    animate={{ rotate: input ? 0 : -90, x: 0 }}
                    exit={{ y: "-150%" }}
                  >
                    <ArrowUp className="size-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Skiper84 };

/* gradient pulse columns */
const Grad = ({ className }: { className?: string }) => (
  <div className={cn("flex h-full flex-col items-stretch -space-y-3", className)}>
    <div className="w-full flex-1 bg-[#FC2BA3] blur-xl" />
    <div className="w-full flex-1 bg-[#FC6D35] blur-xl" />
    <div className="w-full flex-1 bg-[#F9C83D] blur-xl" />
    <div className="w-full flex-1 bg-[#C2D6E1] blur-xl" />
    <div className="w-full flex-1 bg-[#144EC5] blur-xl" />
  </div>
);

/* shimmer text */
export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

function TextShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements,
  );

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
        "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className,
      )}
      initial={{ backgroundPosition: "100% center" }}
      animate={{ backgroundPosition: "0% center" }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
      style={{
        "--spread": `${dynamicSpread}px`,
        backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
      } as React.CSSProperties}
    >
      {children}
    </MotionComponent>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);

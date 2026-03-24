"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ── cursor ─────────────────────────────────────────────────────────────── */

function Cursor() {
  return (
    <span
      className="inline-block w-[0.6em] h-[1.1em] bg-white/80 align-middle ml-[1px]"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  );
}

/* ── page ───────────────────────────────────────────────────────────────── */

export default function AidPage() {
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* auto-focus */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* submit hash */
  const submit = useCallback(async () => {
    const hash = input.trim().toLowerCase();
    if (!hash || checking) return;

    setChecking(true);
    setInvalid(false);

    const res = await fetch("/api/hash/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    });
    const data = await res.json();

    if (data.status === "valid") {
      router.push(`/h/${data.hash}`);
      return;
    }

    /* invalid — flash and reset */
    setInvalid(true);
    setChecking(false);
    setTimeout(() => setInvalid(false), 2000);
  }, [input, checking, router]);

  return (
    <div
      className="min-h-screen w-screen bg-black flex items-center justify-center px-6 py-12"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="font-mono text-white/80 text-[clamp(0.65rem,2.2vw,0.85rem)] max-w-xl w-full leading-relaxed">

        {/* prompt */}
        <p className="text-white/30 mb-6">enter your hash.</p>

        {/* input line */}
        <div className="flex items-center">
          <span className={`whitespace-pre ${invalid ? "text-red-500/60" : ""}`}>
            {input}
          </span>
          <Cursor />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            className="absolute opacity-0 w-0 h-0"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={checking}
          />
        </div>

        {/* invalid flash */}
        {invalid && (
          <p className="text-red-500/40 mt-4 text-xs">not recognized.</p>
        )}
      </div>
    </div>
  );
}

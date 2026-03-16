"use client";

import { useState } from "react";

export default function DollarPage() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    const res = await fetch("/api/check-pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass: input }),
    });

    setState(res.ok ? "granted" : "denied");
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center px-6">

      {state === "granted" ? (
        /* revealed content */
        <p className="max-w-xl text-center font-mono text-[clamp(0.7rem,2vw,0.9rem)] leading-relaxed tracking-wide text-white/50">
          The world you desired can be won. It exists, it is real, it is possible — it is yours.
        </p>
      ) : (
        /* password prompt */
        <form onSubmit={submit} className="flex flex-col items-center gap-4 w-full max-w-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setState("idle"); }}
            placeholder="enter passphrase"
            autoFocus
            className="w-full bg-transparent border border-white/10 rounded-none px-4 py-3 font-mono text-[clamp(0.6rem,2vw,0.8rem)] text-white/70 placeholder:text-white/15 outline-none focus:border-white/25 transition-colors"
          />

          {state === "denied" && (
            <p className="font-mono text-[clamp(0.5rem,1.2vw,0.6rem)] text-red-500/50 tracking-wide">
              access denied
            </p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="font-mono text-[clamp(0.5rem,1.2vw,0.65rem)] uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-colors disabled:opacity-50"
          >
            [ enter ]
          </button>
        </form>
      )}

    </div>
  );
}

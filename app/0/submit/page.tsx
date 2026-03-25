"use client";

import { useState, useCallback } from "react";

/* ── cursor ─────────────────────────────────────────────────────────────── */

function Cursor() {
  return (
    <span
      className="inline-block w-[0.6em] h-[1.1em] bg-white/80 align-middle ml-[1px]"
      style={{ animation: "blink 1s step-end infinite" }}
    />
  );
}

/* ── states ──────────────────────────────────────────────────────────────── */

type Phase = "form" | "submitting" | "done" | "error";

export default function SubmitPage() {
  const [phase, setPhase] = useState<Phase>("form");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [error, setError] = useState("");

  /* ── submit ──────────────────────────────────────────────────────────── */

  const submit = useCallback(async () => {
    if (!description.trim() || !repo.trim()) return;
    setPhase("submitting");
    setError("");

    try {
      const res = await fetch("/api/0/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          repo: repo.trim(),
        }),
      });
      const data = await res.json();

      if (data.ok) {
        setPhase("done");
      } else {
        setError(data.error || "something went wrong");
        setPhase("error");
      }
    } catch {
      setError("network error");
      setPhase("error");
    }
  }, [description, repo]);

  /* ── render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen w-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="font-mono text-white/80 text-[clamp(0.65rem,2.2vw,0.85rem)] max-w-xl w-full leading-relaxed">

        {/* ── form ───────────────────────────────────────────────────── */}
        {(phase === "form" || phase === "submitting" || phase === "error") && (
          <div className="space-y-6">

            {/* header */}
            <div className="text-white/40 space-y-1">
              <p className="text-white/90">impossibl[0]</p>
              <p>submit your project.</p>
            </div>

            {/* fields */}
            <div className="space-y-4 pt-2">
              <div>
                <textarea
                  placeholder="what did you build? (1-2 sentences)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  maxLength={280}
                  className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono resize-none"
                  autoFocus
                />
                <p className="text-white/15 text-xs mt-1 text-right font-mono">
                  {description.length}/280
                </p>
              </div>

              <input
                type="url"
                placeholder="github repo url"
                value={repo}
                onChange={e => setRepo(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
              />
            </div>

            {/* error */}
            {error && (
              <p className="text-red-500/60 text-xs font-mono">{error}</p>
            )}

            {/* submit */}
            <button
              onClick={submit}
              disabled={phase === "submitting" || !description.trim() || !repo.trim()}
              className="font-mono text-white/60 hover:text-white transition-colors tracking-widest uppercase text-xs disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {phase === "submitting" ? (
                <span className="inline-flex items-center gap-1">
                  submitting<Cursor />
                </span>
              ) : (
                "SUBMIT"
              )}
            </button>
          </div>
        )}

        {/* ── done ───────────────────────────────────────────────────── */}
        {phase === "done" && (
          <div className="text-white/60 space-y-1">
            <p>submitted.</p>
            <p>the judges will see it.</p>
            <p>good luck, builder.</p>
          </div>
        )}

      </div>
    </div>
  );
}

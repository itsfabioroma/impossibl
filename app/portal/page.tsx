"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ── multi-line typewriter ──────────────────────────────────────────────── */

function useMultiTypewriter(lines: string[], speed = 35, lineDelay = 300, delays?: Record<number, number>) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (lines.length === 0 || lines[0] === "") return;

    let cancelled = false;
    const output: string[] = [];

    async function run() {
      for (let l = 0; l < lines.length; l++) {
        if (cancelled) return;
        const line = lines[l];

        /* empty line = blank pause */
        if (line === "") {
          output.push("");
          setVisibleLines([...output]);
          await wait(lineDelay);
          continue;
        }

        /* type char by char */
        output.push("");
        for (let c = 0; c < line.length; c++) {
          if (cancelled) return;
          output[output.length - 1] = line.slice(0, c + 1);
          setVisibleLines([...output]);
          await wait(speed);
        }

        await wait(delays?.[l] ?? lineDelay);
      }
      if (!cancelled) setDone(true);
    }

    run();
    return () => { cancelled = true; };
  }, [lines, speed, lineDelay]);

  return { visibleLines, done };
}

function wait(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

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

type Phase =
  | "input"
  | "validating"
  | "granting"
  | "form"
  | "claiming"
  | "confirmed"
  | "full"
  | "waitlisted";

export default function PortalPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [input, setInput] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [builderNumber, setBuilderNumber] = useState<number | null>(null);
  const [hash, setHash] = useState("");

  /* form fields */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [github, setGithub] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  /* focus invisible input */
  useEffect(() => {
    if (phase === "input") inputRef.current?.focus();
  }, [phase]);

  /* ── check cap on mount ─────────────────────────────────────────────── */

  useEffect(() => {
    fetch("/api/portal/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "__cap_check__" }),
    })
      .then(r => r.json())
      .then(d => { if (d.status === "full") setPhase("full"); });
  }, []);

  /* ── validate token ─────────────────────────────────────────────────── */

  const submit = useCallback(async () => {
    if (!input.trim() || phase !== "input") return;
    setPhase("validating");

    const res = await fetch("/api/portal/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: input.trim() }),
    });
    const data = await res.json();

    if (data.status === "full") {
      setPhase("full");
      return;
    }

    if (data.status === "valid") {
      setTokenId(data.tokenId);
      setBuilderNumber(data.builderNumber);
      setHash(data.hash);
      setPhase("granting");
      return;
    }

    /* invalid — reset silently */
    setInput("");
    setPhase("input");
  }, [input, phase]);

  /* ── claim spot ─────────────────────────────────────────────────────── */

  const claim = useCallback(async () => {
    if (!name || !email || !tokenId) return;
    setPhase("claiming");

    const res = await fetch("/api/portal/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId, name, email, phone, telegram, github }),
    });
    const data = await res.json();

    if (data.ok) {
      setBuilderNumber(data.builderNumber);
      setHash("");
      setPhase("confirmed");
    } else {
      setInput("");
      setPhase("input");
    }
  }, [name, email, phone, github, tokenId]);

  /* ── waitlist ───────────────────────────────────────────────────────── */

  const joinWaitlist = useCallback(async () => {
    if (!waitlistEmail) return;
    await fetch("/api/portal/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: waitlistEmail }),
    });
    setPhase("waitlisted");
  }, [waitlistEmail]);

  /* ── render ─────────────────────────────────────────────────────────── */

  return (
    <div
      className="min-h-screen w-screen bg-black flex items-center justify-center px-6 py-12"
      onClick={() => phase === "input" && inputRef.current?.focus()}
    >
      <div className="font-mono text-white/80 text-[clamp(0.65rem,2.2vw,0.85rem)] max-w-xl w-full leading-relaxed">

        {/* ── input phase: just cursor ──────────────────────────────── */}
        {(phase === "input" || phase === "validating") && (
          <div className="flex items-center">
            <span className="whitespace-pre">{input}</span>
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
            />
          </div>
        )}

        {/* ── granting phase: typewriter ────────────────────────────── */}
        {phase === "granting" && (
          <GrantAnimation
            builderNumber={builderNumber!}
            hash={hash}
            onDone={() => setPhase("form")}
          />
        )}

        {/* ── form phase ───────────────────────────────────────────── */}
        {(phase === "form" || phase === "claiming") && (
          <div className="space-y-6">

            {/* echo the full message as static text */}
            <div className="text-white/30 space-y-1">
              <p>you&apos;re in.</p>
              <p>congratulations, you&apos;re impossibl[0][{builderNumber}]</p>
              <p>&nbsp;</p>
              <p>this is your hash: {hash}</p>
              <p>save it. you will never see it again.</p>
              <p>&nbsp;</p>
              <p>time to meet the others.</p>
              <p>the sharpest minds in the world. united.</p>
              <p>one day. one house. one goal.</p>
              <p>to ship the impossible.</p>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              <p className="text-white/90">impossibl[0]</p>
              <p>hackathon. san francisco. march 24.</p>
              <p>claim your spot below. details will follow.</p>
            </div>

            {/* form */}
            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
                autoFocus
              />
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
              />
              <input
                type="tel"
                placeholder="phone — for emergency comms only"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
              />
              <input
                type="text"
                placeholder="telegram handle"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
              />
              <input
                type="text"
                placeholder="github (optional)"
                value={github}
                onChange={e => setGithub(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
              />
            </div>

            <button
              onClick={claim}
              disabled={phase === "claiming" || !name || !email}
              className="font-mono text-white/60 hover:text-white transition-colors tracking-widest uppercase text-xs disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {phase === "claiming" ? "..." : "CLAIM SPOT"}
            </button>
          </div>
        )}

        {/* ── confirmed: everything gone, just this ────────────────── */}
        {phase === "confirmed" && (
          <div className="text-white/60 space-y-1">
            <p>impossibl[0][{builderNumber}] confirmed.</p>
            <p>check your inbox.</p>
            <p>see you soon.</p>
          </div>
        )}

        {/* ── full ─────────────────────────────────────────────────── */}
        {(phase === "full" || phase === "waitlisted") && (
          <div className="space-y-4">
            <div className="text-white/40 space-y-1">
              <p>impossibl[0] is full.</p>
              <p>impossibl[1] awaits.</p>
            </div>

            {phase === "full" && (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && joinWaitlist()}
                  className="flex-1 bg-transparent border-b border-white/15 pb-2 text-white/80 placeholder:text-white/20 outline-none font-mono"
                  autoFocus
                />
                <button
                  onClick={joinWaitlist}
                  disabled={!waitlistEmail}
                  className="font-mono text-white/60 hover:text-white transition-colors tracking-widest uppercase text-xs disabled:opacity-20"
                >
                  JOIN
                </button>
              </div>
            )}

            {phase === "waitlisted" && (
              <p className="text-white/30 text-xs">noted.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── grant animation ───────────────────────────────────────────────────── */

function GrantAnimation({
  builderNumber,
  hash,
  onDone,
}: {
  builderNumber: number;
  hash: string;
  onDone: () => void;
}) {
  const lines = useMemo(() => [
    "you're in.",
    `congratulations, you're impossibl[0][${builderNumber}]`,
    "",
    `this is your hash: ${hash}`,
    "save it. you will never see it again.",
    "",
    "time to meet the others.",
    "the sharpest minds in the world. united.",
    "one day. one house. one goal.",
    "to ship the impossible.",
    "",
    "",
    "!!impossibl[0]",
    "hackathon. san francisco. march 24.",
    "claim your spot below. details will follow.",
  ], [builderNumber, hash]);

  const delays: Record<number, number> = {
    0: 2000,  // after "you're in."
    1: 800,   // after "congratulations..."
    4: 1000,  // after "save it..."
  };

  const { visibleLines, done } = useMultiTypewriter(lines, 55, 500, delays);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  return (
    <div className="text-white/60 space-y-1">
      {visibleLines.map((line, i) => {
        const bright = line.startsWith("!!");
        const text = bright ? line.slice(2) : line;
        return (
          <p key={i} className={bright ? "text-white/90" : ""}>
            {text || "\u00A0"}
            {i === visibleLines.length - 1 && !done && text !== "" && <Cursor />}
          </p>
        );
      })}
    </div>
  );
}

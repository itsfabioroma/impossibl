"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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

type BuilderData = {
  status: "valid";
  hash: string;
  builderNumber: number;
  name: string | null;
  claimed: boolean;
} | null;

export default function AgePage() {
  const { hash } = useParams<{ hash: string }>();
  const [data, setData] = useState<BuilderData>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  /* fetch builder data */
  useEffect(() => {
    async function verify() {
      const res = await fetch("/api/hash/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });
      const json = await res.json();

      if (json.status === "valid") {
        setData(json);
      } else {
        setInvalid(true);
      }
      setLoading(false);
    }
    verify();
  }, [hash]);

  return (
    <div className="min-h-screen w-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="font-mono text-white/80 text-[clamp(0.65rem,2.2vw,0.85rem)] max-w-xl w-full leading-relaxed">

        {/* loading */}
        {loading && <Cursor />}

        {/* invalid hash */}
        {invalid && (
          <div className="space-y-1">
            <p className="text-red-500/60">hash not recognized.</p>
            <p className="text-white/20 mt-4">this hash does not belong to any impossibl builder.</p>
          </div>
        )}

        {/* verified builder */}
        {data && (
          <div className="space-y-4">

            {/* badge */}
            <div className="space-y-1">
              <p className="text-green-500/80">verified.</p>
              <p className="text-white/60 mt-2">
                impossibl[0][{data.builderNumber}]
              </p>
            </div>

            {/* details */}
            <div className="space-y-1 text-white/30 mt-6">
              <p>hash: {data.hash}</p>
              {data.name && <p>builder: {data.name}</p>}
              <p>status: {data.claimed ? "confirmed" : "unclaimed"}</p>
            </div>

            {/* footer */}
            <p className="text-white/15 mt-8">
              this person is a legit impossibl builder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

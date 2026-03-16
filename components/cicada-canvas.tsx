"use client";

import { useEffect, useRef } from "react";

const ART = `        %@@%%{#@@@@@@#{{#@@%%                 %@@%%%@@                 @@@@%{%{@@@@@@@@@%%%@
     ##@  @@    @@@@@    @@  @@@@@@         %@@@ @ @@@@#         %@@@@@@@      @@@% @@@@  @@@#
    @@  @@@@   @@@  @@@@@@@@@@@@@@@@@@@@    @@@@@@  @       @@@@@@ @@@@ @@@@@@@@@    @@@@@@@@%
    {[(@  @@@@@  @@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@ @@@@@@@@@@#@  @@{@@@@@@
       @#@@@@@@@@@@    @@@@@@@ @@@@@@@@@@ @@@@@@    @@@@*< @@@@@@@@ [@@{@@@@  [   @@@@@@@
           @@@@@ @@%@@@@ %@@@@@@@   {#    @@@   @@ @@@#@@  @@  %@@@@@@@@@@@@@  @%@@@@@@
            [@@@@@ @@@@    @@ @@@%         @@@@@@@@@@%   -@:   @ @@@@@@ @@@ @@@@@ @@%
               @@@#@%  @@@@@@@             @@@[   @@               @@@@@@@@@@@@@%
                      @@@@ @@@@%           @@@@@% %@@  }           @@@@ @@@@@
                     @@@  @@@} %           @@@%@   @%              @@  @{@@@@#
                     %@@@@@@@               @@ @@ %@@              @@  @@@@@@
                       @@@@@@@% #           @@  @@ #   @@         @@@@@@@@@
                          %%@@%%@#{{]       @@  @@}    # {     ]#%@@@@@
                                            @@@ <          =
                                             @@@%
                                              @@
                                               @@%
                                                @%`;

/* all non-space char positions for sparkle picking */
interface Pt { r: number; c: number }

export default function CicadaCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf: number;
    let cancelled = false;

    const lines = ART.split("\n");
    const rows = lines.length;
    const cols = Math.max(...lines.map((l) => l.length));

    /* index all visible chars */
    const pts: Pt[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < lines[r].length; c++)
        if (lines[r][c] !== " ") pts.push({ r, c });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    /* fit font to available width — cap at 60% on desktop */
    const vw = window.innerWidth;
    const maxW = (canvas.parentElement?.clientWidth ?? vw) * (vw >= 768 ? 0.55 : 0.92);
    const testFont = (s: number) => {
      ctx.font = `${s}px "Courier New", Courier, monospace`;
      return ctx.measureText("@").width * cols;
    };
    let fontSize = 10;
    while (fontSize > 3 && testFont(fontSize) > maxW) fontSize -= 0.5;

    const font = `${fontSize}px "Courier New", Courier, monospace`;
    ctx.font = font;
    const charW = ctx.measureText("@").width;
    const charH = fontSize * 1.2;

    /* hi-dpi sizing */
    const w = Math.ceil(cols * charW);
    const h = Math.ceil(rows * charH);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    /* ── sparkle state ─────────────────────────────── */

    interface Spark { r: number; c: number; birth: number; life: number }
    const sparks: Spark[] = [];
    let lastSpark = 0;

    function spawnSpark(t: number) {
      const p = pts[Math.floor(Math.random() * pts.length)];
      sparks.push({ ...p, birth: t, life: 400 + Math.random() * 600 });
    }

    /* ── draw ───────────────────────────────────────── */

    const BASE_ALPHA = 0.16;
    const BREATH_AMP = 0.012;
    const BREATH_PERIOD = 4000;

    function draw(t: number) {
      if (cancelled) return;

      /* breathing: slow sine oscillation */
      const breath = BASE_ALPHA + BREATH_AMP * Math.sin((t / BREATH_PERIOD) * Math.PI * 2);

      /* spawn sparks: sparse, one at a time */
      if (sparks.length < 2 && t - lastSpark > 1500 + Math.random() * 3000) {
        spawnSpark(t);
        lastSpark = t;
      }

      /* build sparkle lookup */
      const sparkMap = new Map<string, number>();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const age = t - s.birth;
        if (age > s.life) { sparks.splice(i, 1); continue; }

        /* envelope: cubic ease-in, exponential decay out */
        const peak = s.life * 0.08;
        const n = age < peak ? age / peak : (age - peak) / (s.life - peak);
        const brightness = age < peak
          ? n * n * (3 - 2 * n)                   // smoothstep in
          : Math.pow(1 - Math.min(n, 1), 3);      // cubic ease-out decay

        sparkMap.set(`${s.r},${s.c}`, brightness);
      }

      /* clear */
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;

      /* render */
      for (let r = 0; r < rows; r++) {
        const line = lines[r];
        for (let c = 0; c < line.length; c++) {
          if (line[c] === " ") continue;

          const spark = sparkMap.get(`${r},${c}`) ?? 0;
          const alpha = Math.min(breath + spark * 0.85, 1);

          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillText(line[c], c * charW, r * charH + fontSize);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

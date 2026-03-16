import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { getGeoData } from "@/lib/geo-utils";

/* ── encoding helpers: text → base64 → hex ──────────────────────────────── */

function textToHex(text: string): string {
  return Buffer.from(Buffer.from(text).toString("base64")).toString("hex");
}

/* ── GET: return encoded hint ───────────────────────────────────────────── */

export async function GET() {
  const instruction = "Congratulations. Now POST this same endpoint.";
  return NextResponse.json({ next: textToHex(instruction) });
}

/* ── POST: generate invite token, save to supabase ──────────────────────── */

export async function POST(req: NextRequest) {
  /* extract IP + geo */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const geo = getGeoData(req.headers);

  /* rate limit: 3 POSTs per IP */
  const { count } = await supabase
    .from("impossibl_tokens")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "rate limit exceeded" },
      { status: 429 },
    );
  }

  /* generate + store token with geo data */
  const invite_token = randomUUID();

  await supabase.from("impossibl_tokens").insert({
    invite_token,
    ip,
    used: false,
    ...geo,
  });

  return NextResponse.json({
    next: "r/696D706F737369626C",
    invite_token,
    decrypt_key: `data:application/pgp-keys;base64,${process.env.IMPOSSIBL_PGP_KEY!}`,
  });
}

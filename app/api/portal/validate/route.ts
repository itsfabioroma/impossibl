import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";

const CAP = 20;

export async function POST(req: NextRequest) {
  /* check cap first */
  const { count: usedCount } = await supabase
    .from("impossibl_tokens")
    .select("*", { count: "exact", head: true })
    .eq("used", true);

  if ((usedCount ?? 0) >= CAP) {
    return NextResponse.json({ status: "full" });
  }

  /* validate token */
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ status: "invalid" });
  }

  const { data } = await supabase
    .from("impossibl_tokens")
    .select("id, invite_token, used")
    .eq("invite_token", token.trim())
    .single();

  if (!data || data.used) {
    return NextResponse.json({ status: "invalid" });
  }

  /* proof hash: sha256(token), first 16 chars */
  const hash = createHash("sha256").update(data.invite_token).digest("hex").slice(0, 16);

  /* save hash to token row */
  await supabase
    .from("impossibl_tokens")
    .update({ hash })
    .eq("id", data.id);

  /* next builder number = used count + 1 */
  const builderNumber = (usedCount ?? 0) + 1;

  return NextResponse.json({
    status: "valid",
    tokenId: data.id,
    builderNumber,
    hash,
  });
}

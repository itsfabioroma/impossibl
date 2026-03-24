import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { hash } = await req.json();
  if (!hash || typeof hash !== "string") {
    return NextResponse.json({ status: "invalid" });
  }

  const clean = hash.trim().toLowerCase();

  /* fetch all tokens and compute hashes to find a match */
  const { data: tokens } = await supabase
    .from("impossibl_tokens")
    .select("id, invite_token, used, builder_number");

  if (!tokens) {
    return NextResponse.json({ status: "invalid" });
  }

  /* find the token whose sha256 prefix matches */
  const token = tokens.find((t) => {
    const computed = createHash("sha256")
      .update(t.invite_token)
      .digest("hex")
      .slice(0, 16);
    return computed === clean;
  });

  if (!token) {
    return NextResponse.json({ status: "invalid" });
  }

  /* look up builder by token_id */
  const { data: builder } = await supabase
    .from("impossibl_builders")
    .select("name, builder_number")
    .eq("token_id", token.id)
    .single();

  return NextResponse.json({
    status: "valid",
    hash: clean,
    builderNumber: builder?.builder_number ?? token.builder_number,
    name: builder?.name ?? null,
  });
}

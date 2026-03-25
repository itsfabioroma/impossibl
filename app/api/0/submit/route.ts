import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { description, repo } = await req.json();

  /* validate */
  if (!description?.trim() || !repo?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (description.trim().length > 280) {
    return NextResponse.json({ error: "description too long" }, { status: 400 });
  }

  /* insert */
  const { error } = await supabase.from("impossibl_submissions").insert({
    description: description.trim(),
    repo: repo.trim(),
  });

  if (error) {
    console.error("submission insert error:", error);
    return NextResponse.json({ error: "submission failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/lib/validate-email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "missing email" }, { status: 400 });
  }

  /* server-side email validation: format + MX */
  if (!(await isValidEmail(email.trim()))) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  await supabase.from("impossibl_waitlist").insert({ email: email.trim() });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

const SECRET =
  "i swear by my life and my love of it that i will never live for the sake of another man, nor ask another man to live for mine";

export async function POST(req: NextRequest) {
  const { pass } = await req.json();

  /* normalize: lowercase, trim, strip trailing period */
  const normalized = (pass ?? "").toLowerCase().trim().replace(/\.$/, "").trim();

  if (normalized === SECRET) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}

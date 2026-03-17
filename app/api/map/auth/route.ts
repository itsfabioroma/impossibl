import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.MAP_PASSWORD) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

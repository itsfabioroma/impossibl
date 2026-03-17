import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

// generate HMAC token from password
function signToken() {
  return crypto
    .createHmac("sha256", process.env.MAP_PASSWORD!)
    .update("impossibl-map-auth")
    .digest("hex")
}

// check if already authed (cookie only, no data returned)
export async function GET() {
  const valid = await verifyMapAuth()
  if (!valid) return NextResponse.json({ ok: false }, { status: 401 })
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.MAP_PASSWORD) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 })
  }

  // set HTTP-only cookie with signed token
  const token = signToken()
  const cookieStore = await cookies()
  cookieStore.set("map-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return NextResponse.json({ ok: true })
}

// verify token from cookie
export async function verifyMapAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("map-token")?.value
  if (!token) return false
  return token === signToken()
}

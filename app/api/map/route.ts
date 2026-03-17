import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyMapAuth } from "./auth/route"

export type Pin = {
  id: string
  lat: number
  lng: number
  variant: 1 | 2 | 3 | 4 | 5
  note?: string
  createdAt: string
}

// new response each time (response objects are not reusable)
function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 })
}

// map supabase row to Pin
function toPin(row: Record<string, unknown>): Pin {
  return {
    id: row.id as string,
    lat: row.lat as number,
    lng: row.lng as number,
    variant: row.variant as 1 | 2 | 3 | 4 | 5,
    note: (row.note as string) || "",
    createdAt: row.created_at as string,
  }
}

// validate variant is 1-5
function isValidVariant(v: unknown): v is 1 | 2 | 3 | 4 | 5 {
  return typeof v === "number" && v >= 1 && v <= 5 && Number.isInteger(v)
}

export async function GET() {
  if (!(await verifyMapAuth())) return unauthorized()

  const { data, error } = await supabase
    .from("impossibl_pins")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(toPin))
}

export async function POST(req: Request) {
  if (!(await verifyMapAuth())) return unauthorized()

  const body = await req.json()

  // validate inputs server-side
  if (typeof body.lat !== "number" || typeof body.lng !== "number" || !isValidVariant(body.variant)) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("impossibl_pins")
    .insert({
      lat: body.lat,
      lng: body.lng,
      variant: body.variant,
      note: typeof body.note === "string" ? body.note.slice(0, 500) : "",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toPin(data))
}

export async function PATCH(req: Request) {
  if (!(await verifyMapAuth())) return unauthorized()

  const { id, variant } = await req.json()

  // validate inputs server-side
  if (typeof id !== "string" || !isValidVariant(variant)) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("impossibl_pins")
    .update({ variant })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toPin(data))
}

export async function DELETE(req: Request) {
  if (!(await verifyMapAuth())) return unauthorized()

  const { id } = await req.json()

  // validate input server-side
  if (typeof id !== "string") {
    return NextResponse.json({ error: "invalid input" }, { status: 400 })
  }

  const { error } = await supabase
    .from("impossibl_pins")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

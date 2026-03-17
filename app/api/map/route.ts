import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { verifyMapAuth } from "./auth/route"

const UNAUTHORIZED = NextResponse.json({ error: "unauthorized" }, { status: 401 })

export type Pin = {
  id: string
  lat: number
  lng: number
  variant: 1 | 2 | 3 | 4 | 5
  note?: string
  createdAt: string
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

export async function GET() {
  if (!(await verifyMapAuth())) return UNAUTHORIZED

  const { data, error } = await supabase
    .from("impossibl_pins")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(toPin))
}

export async function POST(req: Request) {
  if (!(await verifyMapAuth())) return UNAUTHORIZED

  const body = await req.json()

  const { data, error } = await supabase
    .from("impossibl_pins")
    .insert({ lat: body.lat, lng: body.lng, variant: body.variant, note: body.note || "" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toPin(data))
}

export async function PATCH(req: Request) {
  if (!(await verifyMapAuth())) return UNAUTHORIZED

  const { id, variant } = await req.json()

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
  if (!(await verifyMapAuth())) return UNAUTHORIZED

  const { id } = await req.json()

  const { error } = await supabase
    .from("impossibl_pins")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

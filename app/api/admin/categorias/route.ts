import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { CategoryKind } from "@prisma/client"

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json(cats)
}

export async function POST(req: Request) {
  const body = await req.json()
  const slug = String(body.slug || "").trim().toLowerCase()
  const name = String(body.name || "").trim()
  const order = Number(body.order) || 0
  const kind: CategoryKind = body.kind || "GENERIC"
  const attributes = Array.isArray(body.attributes) ? body.attributes : []

  if (!slug || !name) {
    return NextResponse.json(
      { error: "Slug y nombre requeridos" },
      { status: 400 }
    )
  }

  try {
    const c = await prisma.category.create({
      data: { slug, name, order, kind, attributes, active: true },
    })
    return NextResponse.json(c)
  } catch {
    return NextResponse.json({ error: "Slug duplicado" }, { status: 400 })
  }
}
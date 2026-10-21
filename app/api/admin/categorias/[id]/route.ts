import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { CategoryKind } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = String(body.name).trim()
  if (body.order !== undefined) data.order = Number(body.order)
  if (body.active !== undefined) data.active = Boolean(body.active)
  if (body.showInNavbar !== undefined) data.showInNavbar = Boolean(body.showInNavbar)
  if (body.kind !== undefined) data.kind = body.kind as CategoryKind
  if (body.attributes !== undefined) data.attributes = body.attributes

  const c = await prisma.category.update({ where: { id }, data })
  return NextResponse.json(c)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} producto(s)` },
      { status: 400 }
    )
  }
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
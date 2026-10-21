import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin sesión" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const cantidad = Math.max(1, Math.floor(Number(body.quantity) || 1))

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: { variant: true },
  })

  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
  }

  if (cantidad > item.variant.stock) {
    return NextResponse.json(
      { error: `Solo hay ${item.variant.stock} en stock` },
      { status: 400 }
    )
  }

  const actualizado = await prisma.cartItem.update({
    where: { id },
    data: { quantity: cantidad },
  })

  return NextResponse.json({ item: actualizado })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin sesión" }, { status: 401 })

  const { id } = await params
  const item = await prisma.cartItem.findUnique({ where: { id } })
  if (!item || item.userId !== userId) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
  }

  await prisma.cartItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
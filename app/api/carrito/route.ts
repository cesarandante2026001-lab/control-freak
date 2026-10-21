import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ items: [], total: 0, count: 0 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ items: [], total: 0, count: 0 })

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      variant: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const mapped = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    variantId: item.variantId,
    attributes: item.variant.attributes,
    stock: item.variant.stock,
    variantImageUrl: item.variant.imageUrl,
    product: {
      id: item.variant.product.id,
      slug: item.variant.product.slug,
      name: item.variant.product.name,
      price: item.variant.product.price,
      imageUrl: item.variant.product.imageUrl,
      active: item.variant.product.active,
      category: item.variant.product.category
        ? { name: item.variant.product.category.name }
        : null,
    },
  }))

  const total = mapped.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = mapped.reduce((sum, i) => sum + i.quantity, 0)

  return NextResponse.json({ items: mapped, total, count })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json(
      { error: "Debes iniciar sesion" },
      { status: 401 }
    )
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin sesion" }, { status: 401 })

  try {
    const body = await req.json()
    const variantId = String(body.variantId || "")
    const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1))

    if (!variantId) {
      return NextResponse.json({ error: "Falta variantId" }, { status: 400 })
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    })

    if (!variant) {
      return NextResponse.json({ error: "Variante no existe" }, { status: 404 })
    }

    if (!variant.product.active) {
      return NextResponse.json({ error: "Producto inactivo" }, { status: 400 })
    }

    const existente = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId, variantId } },
    })

    const cantidadFinal = (existente?.quantity ?? 0) + quantity
    if (cantidadFinal > variant.stock) {
      return NextResponse.json(
        { error: `Solo hay ${variant.stock} en stock` },
        { status: 400 }
      )
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId } },
      create: { userId, variantId, quantity },
      update: { quantity: { increment: quantity } },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("Error carrito POST:", error)
    return NextResponse.json({ error: "Error al agregar" }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin sesion" }, { status: 401 })

  await prisma.cartItem.deleteMany({ where: { userId } })
  return NextResponse.json({ ok: true })
}
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

function isAdminRole(role?: string): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      variants: true,
    },
  })

  const withStock = products.map((p) => ({
    ...p,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }))

  return NextResponse.json({ products: withStock })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  try {
    const body = await req.json()

    if (!body.categoryId) {
      return NextResponse.json({ error: "Falta categoryId" }, { status: 400 })
    }

    const slugBase =
      body.slug ||
      body.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    let slug = slugBase
    let counter = 1
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${counter}`
      counter++
    }

    const variants: {
      attributes: Record<string, string>
      stock: number
      imageUrl: string | null
    }[] = Array.isArray(body.variants) ? body.variants : []

    const product = await prisma.product.create({
      data: {
        slug,
        name: body.name,
        description: body.description || null,
        price: Math.floor(Number(body.price)),
        imageUrl: body.imageUrl || null,
        images: body.images || [],
        categoryId: body.categoryId,
        provider: body.provider || "temu",
        providerUrl: body.providerUrl || null,
        attributes: body.attributes || {},
        featured: Boolean(body.featured),
        active: true,
        variants: {
          create: variants.map((v) => ({
            attributes: v.attributes || {},
            stock: Math.floor(Number(v.stock) || 0),
            imageUrl: v.imageUrl || null,
          })),
        },
      },
      include: { variants: true, category: true },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: "Error al crear producto: " + message },
      { status: 500 }
    )
  }
}
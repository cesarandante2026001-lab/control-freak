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
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const rates = await prisma.shippingRate.findMany({
    orderBy: [{ region: "asc" }, { comuna: "asc" }],
  })

  const setting = await prisma.setting.findUnique({
    where: { key: "freeShippingThreshold" },
  })

  const freeThreshold = setting ? Number(setting.value) : 50000

  return NextResponse.json({ rates, freeThreshold })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const body = await req.json()

  if (typeof body.freeThreshold === "number") {
    await prisma.setting.upsert({
      where: { key: "freeShippingThreshold" },
      update: { value: String(Math.max(0, Math.floor(body.freeThreshold))) },
      create: { key: "freeShippingThreshold", value: String(Math.max(0, Math.floor(body.freeThreshold))) },
    })
  }

  if (Array.isArray(body.rates)) {
    for (const r of body.rates) {
      if (!r.id || typeof r.price !== "number") continue
      await prisma.shippingRate.update({
        where: { id: r.id },
        data: {
          price: Math.max(0, Math.floor(r.price)),
          active: typeof r.active === "boolean" ? r.active : undefined,
        },
      })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  try {
    const body = await req.json()
    if (!body.region || !body.comuna || typeof body.price !== "number") {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const nueva = await prisma.shippingRate.create({
      data: {
        region: body.region,
        comuna: body.comuna,
        price: Math.max(0, Math.floor(body.price)),
        active: true,
      }
    })
    return NextResponse.json(nueva)
  } catch (error) {
    return NextResponse.json({ error: "Error al crear (quizas ya existe esa comuna en esa region)" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: "Falta ID" }, { status: 400 })

    await prisma.shippingRate.delete({ where: { id: body.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
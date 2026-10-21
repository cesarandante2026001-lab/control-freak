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

  const ordenes = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  })

  const mapped = ordenes.map((o) => ({
    id: o.id,
    shortId: o.id.slice(-8).toUpperCase(),
    status: o.status,
    total: o.total,
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    customerCity: o.customerCity,
    customerRegion: o.customerRegion,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    trackingNumber: o.trackingNumber,
    itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
  }))

  return NextResponse.json({ ordenes: mapped })
}
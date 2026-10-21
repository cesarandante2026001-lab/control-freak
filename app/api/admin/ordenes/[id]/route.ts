import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

function isAdminRole(role?: string): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const { id } = await params
  const orden = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true, },
          },
        },
      },
      user: {
        select: { email: true, name: true },
      },
    },
  })

  if (!orden) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  return NextResponse.json({ orden })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.status !== undefined) data.status = String(body.status)
  if (body.trackingNumber !== undefined) {
    data.trackingNumber = body.trackingNumber ? String(body.trackingNumber).trim() : null
  }
  if (body.notes !== undefined) {
    data.notes = body.notes ? String(body.notes).trim() : null
  }
  if (body.status === "paid") data.paidAt = new Date()

  const orden = await prisma.order.update({ where: { id }, data })
  return NextResponse.json({ orden })
}
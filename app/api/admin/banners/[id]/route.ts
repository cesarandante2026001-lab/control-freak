import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

function isAdminRole(role?: string): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
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
  if (body.title !== undefined) data.title = String(body.title).trim()
  if (body.subtitle !== undefined) data.subtitle = body.subtitle ? String(body.subtitle).trim() : null
  if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).trim()
  if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null
  if (body.linkText !== undefined) data.linkText = body.linkText ? String(body.linkText).trim() : null
  if (body.order !== undefined) data.order = Number(body.order)
  if (body.active !== undefined) data.active = Boolean(body.active)

  const banner = await prisma.banner.update({ where: { id }, data })
  return NextResponse.json({ banner })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const { id } = await params
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
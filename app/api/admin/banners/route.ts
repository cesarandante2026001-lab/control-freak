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

  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ banners })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  try {
    const body = await req.json()

    const banner = await prisma.banner.create({
      data: {
        title: String(body.title || "").trim(),
        subtitle: body.subtitle ? String(body.subtitle).trim() : null,
        imageUrl: String(body.imageUrl || "").trim(),
        linkUrl: body.linkUrl ? String(body.linkUrl).trim() : null,
        linkText: body.linkText ? String(body.linkText).trim() : null,
        order: Number(body.order) || 0,
        active: body.active !== false,
      },
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (error) {
    console.error("Error crear banner:", error)
    return NextResponse.json({ error: "Error al crear banner" }, { status: 500 })
  }
}
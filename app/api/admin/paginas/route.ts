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

  const paginas = await prisma.page.findMany({
    orderBy: { order: "asc" },
  })

  return NextResponse.json({ paginas })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  try {
    const body = await req.json()

    const slug = String(body.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")

    if (!slug || !body.title) {
      return NextResponse.json({ error: "Slug y título requeridos" }, { status: 400 })
    }

    const existe = await prisma.page.findUnique({ where: { slug } })
    if (existe) {
      return NextResponse.json({ error: "Ese slug ya existe" }, { status: 400 })
    }

    const pagina = await prisma.page.create({
      data: {
        slug,
        title: String(body.title).trim(),
        content: String(body.content || ""),
        order: Number(body.order) || 0,
        active: body.active !== false,
      },
    })

    return NextResponse.json({ pagina }, { status: 201 })
  } catch (error) {
    console.error("Error crear pagina:", error)
    return NextResponse.json({ error: "Error al crear" }, { status: 500 })
  }
}
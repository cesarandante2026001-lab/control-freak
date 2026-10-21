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

  const configs = await prisma.siteConfig.findMany()
  const contents = await prisma.siteContent.findMany()

  const config: Record<string, string> = {}
  for (const c of configs) config[c.key] = c.value

  const content: Record<string, string> = {}
  for (const c of contents) content[c.key] = c.value

  return NextResponse.json({ config, content })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  try {
    const body = await req.json()

    if (body.config && typeof body.config === "object") {
      for (const [key, value] of Object.entries(body.config)) {
        await prisma.siteConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      }
    }

    if (body.content && typeof body.content === "object") {
      for (const [key, value] of Object.entries(body.content)) {
        await prisma.siteContent.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error guardando contenido:", error)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
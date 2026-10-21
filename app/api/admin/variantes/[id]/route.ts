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
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  if (typeof body.stock !== "number") {
    return NextResponse.json(
      { error: "Stock debe ser un número" },
      { status: 400 }
    )
  }

  const variant = await prisma.productVariant.update({
    where: { id },
    data: { stock: Math.max(0, Math.floor(body.stock)) },
  })

  return NextResponse.json({ variant })
}
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin usuario" }, { status: 401 })

  try {
    const body = await req.json()
    const { address, region, comuna } = body

    await prisma.user.update({
      where: { id: userId },
      data: {
        address: address || undefined,
        regionCode: region || undefined,
        comuna: comuna || undefined,
      }
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
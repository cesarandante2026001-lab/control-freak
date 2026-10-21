import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { KIND_CONFIG } from "@/lib/categories"

export async function POST() {
  const cats = await prisma.category.findMany()
  let actualizadas = 0

  for (const c of cats) {
    const config = KIND_CONFIG[c.kind]
    if (!config) continue
    await prisma.category.update({
      where: { id: c.id },
      data: { attributes: config.attributes },
    })
    actualizadas++
  }

  return NextResponse.json({ actualizadas })
}
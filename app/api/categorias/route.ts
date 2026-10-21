import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      kind: true,
      attributes: true,
    },
  })

  return NextResponse.json({ categories })
}
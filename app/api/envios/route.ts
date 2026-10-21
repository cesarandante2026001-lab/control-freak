import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rates = await prisma.shippingRate.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, region: true, code: true, price: true },
  })

  const setting = await prisma.setting.findUnique({
    where: { key: "freeShippingThreshold" },
  })

  const freeThreshold = setting ? Number(setting.value) : 0

  return NextResponse.json({ rates, freeThreshold })
}
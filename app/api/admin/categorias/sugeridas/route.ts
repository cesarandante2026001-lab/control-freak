import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CATEGORIAS_SUGERIDAS, KIND_CONFIG } from "@/lib/categories"

export async function POST() {
  let creadas = 0
  let saltadas = 0

  for (const cat of CATEGORIAS_SUGERIDAS) {
    const existe = await prisma.category.findUnique({
      where: { slug: cat.slug },
    })
    if (existe) {
      saltadas++
      continue
    }

    await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        kind: cat.kind,
        attributes: KIND_CONFIG[cat.kind].attributes,
        order: cat.order,
        active: false, // se crean DESACTIVADAS
      },
    })
    creadas++
  }

  return NextResponse.json({ creadas, saltadas })
}
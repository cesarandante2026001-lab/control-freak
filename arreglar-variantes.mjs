import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const productos = await prisma.product.findMany({
    include: { variants: true },
  })

  let arreglados = 0

  for (const p of productos) {
    const vi = p.variantImages || {}
    if (Object.keys(vi).length === 0) continue

    for (const v of p.variants) {
      const attrs = v.attributes || {}
      const color = attrs.color

      if (!color) continue
      if (v.imageUrl) continue

      const fotos = vi[color]
      if (fotos && fotos.length > 0) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { imageUrl: fotos[0] },
        })
        console.log("OK: " + p.name + " - variante " + color + " -> " + fotos[0].slice(-30))
        arreglados++
      }
    }
  }

  console.log("")
  console.log("Total variantes arregladas: " + arreglados)
}

main().catch(console.error).finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const productos = await prisma.product.findMany({
    include: { variants: true },
  })

  for (const p of productos) {
    console.log("========================================")
    console.log("Producto: " + p.name + " (slug: " + p.slug + ")")
    console.log("imageUrl principal: " + (p.imageUrl || "(vacio)"))
    console.log("variantImages: " + JSON.stringify(p.variantImages))
    console.log("Variantes:")
    for (const v of p.variants.slice(0, 3)) {
      console.log("  attrs=" + JSON.stringify(v.attributes) + " img=" + (v.imageUrl || "(vacio)"))
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
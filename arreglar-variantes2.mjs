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
    if (p.variants.length === 0) continue
    if (p.images.length === 0) continue

    // Colores unicos de las variantes
    const coloresUnicos = []
    for (const v of p.variants) {
      const c = v.attributes.color
      if (c && !coloresUnicos.includes(c)) coloresUnicos.push(c)
    }

    if (coloresUnicos.length === 0) continue

    // Asignar fotos por orden
    const fotosPorColor = {}
    for (let i = 0; i < coloresUnicos.length; i++) {
      if (p.images[i]) {
        fotosPorColor[coloresUnicos[i]] = p.images[i]
      }
    }

    // Actualizar cada variante
    for (const v of p.variants) {
      const color = v.attributes.color
      if (!color) continue
      if (v.imageUrl) continue

      const foto = fotosPorColor[color]
      if (foto) {
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { imageUrl: foto },
        })
        arreglados++
      }
    }

    // Guardar variantImages en el producto
    const variantImagesObj = {}
    for (const [color, url] of Object.entries(fotosPorColor)) {
      variantImagesObj[color] = [url]
    }
    await prisma.product.update({
      where: { id: p.id },
      data: { variantImages: variantImagesObj },
    })

    console.log("OK: " + p.name + " -> " + JSON.stringify(fotosPorColor))
  }

  console.log("")
  console.log("Total variantes arregladas: " + arreglados)
}

main().catch(console.error).finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CONTENT = {
  "home.howto.step1.desc": "Explora el catálogo y encuentra lo que buscas.",
  "home.howto.step2.desc": "Revisa tu carrito y ajusta las cantidades.",
  "home.howto.step3.desc": "Paga con MercadoPago: tarjetas, transferencia o efectivo.",
  "home.howto.step4.desc": "Despachamos a todo Chile con seguimiento en línea.",
}

async function main() {
  for (const [key, value] of Object.entries(CONTENT)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, value },
    })
  }
  console.log(`OK: ${Object.keys(CONTENT).length} descripciones cargadas`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cats = [
    { slug: "hombre", name: "Hombre", order: 1 },
    { slug: "mujer", name: "Mujer", order: 2 },
    { slug: "nino", name: "Niño", order: 3 },
    { slug: "nina", name: "Niña", order: 4 },
    { slug: "electronicos", name: "Electrónicos", order: 5 },
  ]
  for (const c of cats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order, active: true },
      create: c,
    })
  }
  console.log("Categorías creadas:", cats.length)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

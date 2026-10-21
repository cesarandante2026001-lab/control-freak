import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Dejar solo 1 banner si hay duplicados (edítalos vos mismo desde /admin/banners)
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } })
  console.log("Banners actuales:")
  for (const b of banners) {
    console.log(`  #${b.order} - ${b.title} (${b.active ? "activo" : "inactivo"})`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
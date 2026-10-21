import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.siteConfig.upsert({
    where: { key: "address" },
    update: { value: "Talagante, Región Metropolitana, Chile" },
    create: { key: "address", value: "Talagante, Región Metropolitana, Chile" },
  })
  console.log("OK: address actualizado a Talagante")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
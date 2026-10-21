import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const CONFIG = {
  storeName: "8doce",
  yearFounded: "2026",
  country: "Chile",
  slogan: "Ropa para todos",
  categoryLabel: "ropa",
  email: "info.8doce@gmail.com",
  phone: "+56 9 9574 1590",
  whatsapp: "+56 9 9574 1590",
  address: "Temuco, Chile",
  instagram: "https://instagram.com/8doce",
  facebook: "https://facebook.com/8doce",
  tiktok: "",
  primaryColor: "#000000",
  shopUrl: "",
  logoUrl: "/logo-horizontal.png",
}

async function main() {
  for (const [key, value] of Object.entries(CONFIG)) {
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
  console.log(`OK: ${Object.keys(CONFIG).length} configuraciones actualizadas`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
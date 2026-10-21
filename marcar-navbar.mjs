import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const principales = ["hombre", "mujer", "nino", "nina"]
  for (const slug of principales) {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) continue
    await prisma.category.update({
      where: { slug },
      data: { showInNavbar: true },
    })
    console.log("Navbar ON: " + slug)
  }
  console.log("Listo.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const REGIONES = [
  { region: "Arica y Parinacota", code: "XV",    price: 6990, order: 1 },
  { region: "Tarapacá",            code: "I",     price: 6990, order: 2 },
  { region: "Antofagasta",         code: "II",    price: 6490, order: 3 },
  { region: "Atacama",             code: "III",   price: 5990, order: 4 },
  { region: "Coquimbo",            code: "IV",    price: 5490, order: 5 },
  { region: "Valparaíso",          code: "V",     price: 4490, order: 6 },
  { region: "Metropolitana",       code: "RM",    price: 3990, order: 7 },
  { region: "O'Higgins",           code: "VI",    price: 4490, order: 8 },
  { region: "Maule",               code: "VII",   price: 4990, order: 9 },
  { region: "Ñuble",               code: "XVI",   price: 5490, order: 10 },
  { region: "Biobío",              code: "VIII",  price: 5490, order: 11 },
  { region: "Araucanía",           code: "IX",    price: 5990, order: 12 },
  { region: "Los Ríos",            code: "XIV",   price: 6490, order: 13 },
  { region: "Los Lagos",           code: "X",     price: 6490, order: 14 },
  { region: "Aysén",               code: "XI",    price: 7990, order: 15 },
  { region: "Magallanes",          code: "XII",   price: 8490, order: 16 },
]

async function main() {
  for (const r of REGIONES) {
    await prisma.shippingRate.upsert({
      where: { code: r.code },
      update: { region: r.region, price: r.price, order: r.order },
      create: r,
    })
  }
  console.log(`OK: ${REGIONES.length} regiones cargadas`)

  await prisma.setting.upsert({
    where: { key: "freeShippingThreshold" },
    update: {},
    create: { key: "freeShippingThreshold", value: "50000" },
  })
  console.log("OK: umbral de envio gratis = $50.000")

  console.log("Listo.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
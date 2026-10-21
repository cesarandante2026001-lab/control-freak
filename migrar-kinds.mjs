import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Atributos hardcodeados (mismo contenido que lib/categories.ts)
const ATTRS = {
  APPAREL_ADULT: [
    { key: "talla", label: "Talla", type: "select", options: ["XS","S","M","L","XL","XXL"], placeholder: "Ej: S, M, L" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Blanco","Rojo","Azul","Verde","Gris","Beige"], placeholder: "Ej: Negro, Blanco" },
  ],
  APPAREL_KIDS: [
    { key: "talla", label: "Talla", type: "select", options: ["T2","T4","T6","T8","T10","T12","T14","T16"], placeholder: "Ej: T4, T6" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Blanco","Rojo","Azul","Verde","Rosa","Amarillo"], placeholder: "Ej: Azul, Rosa" },
  ],
  APPAREL_BABY: [
    { key: "talla", label: "Talla", type: "select", options: ["RN","0-3m","3-6m","6-9m","9-12m","12-18m","18-24m"], placeholder: "Ej: 0-3m, 6-9m" },
    { key: "color", label: "Color", type: "select", options: ["Blanco","Celeste","Rosado","Amarillo","Verde","Gris"], placeholder: "Ej: Celeste, Rosado" },
  ],
  SHOES_ADULT: [
    { key: "talla", label: "Talla", type: "select", options: ["35","36","37","38","39","40","41","42","43","44","45","46"], placeholder: "Ej: 38, 40" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Blanco","Café","Azul","Gris","Beige"], placeholder: "Ej: Negro, Café" },
  ],
  SHOES_KIDS: [
    { key: "talla", label: "Talla", type: "select", options: ["20","21","22","23","24","25","26","27","28","29","30","31","32","33","34"], placeholder: "Ej: 24, 28" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Blanco","Azul","Rosa","Rojo"], placeholder: "Ej: Azul, Rosa" },
  ],
  PERFUME: [
    { key: "contenido", label: "Contenido", type: "select", options: ["30ML","50ML","100ML","150ML","200ML"], unit: "ml", placeholder: "Ej: 50ML, 100ML" },
  ],
  ELECTRONICS: [
    { key: "modelo", label: "Modelo", type: "text", placeholder: "Ej: iPhone 15, Galaxy S24" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Blanco","Plata","Azul","Dorado"], placeholder: "Ej: Negro, Plata" },
  ],
  DIGITAL: [],
  FOOD: [
    { key: "peso", label: "Peso", type: "select", options: ["100g","250g","500g","1kg","2kg"], unit: "g", placeholder: "Ej: 250g, 500g" },
  ],
  ACCESSORY: [
    { key: "material", label: "Material", type: "text", placeholder: "Ej: Acero, Cuero, Plata" },
    { key: "color", label: "Color", type: "select", options: ["Negro","Plateado","Dorado","Blanco"], placeholder: "Ej: Negro, Dorado" },
  ],
  GENERIC: [],
}

async function main() {
  const mapeo = {
    hombre: "APPAREL_ADULT",
    mujer: "APPAREL_ADULT",
    nino: "APPAREL_KIDS",
    nina: "APPAREL_KIDS",
    bebe: "APPAREL_BABY",
    "zapatos-hombre": "SHOES_ADULT",
    "zapatos-mujer": "SHOES_ADULT",
    "zapatos-nino": "SHOES_KIDS",
    "zapatos-bebe": "SHOES_KIDS",
    perfumes: "PERFUME",
    electronicos: "ELECTRONICS",
    ebooks: "DIGITAL",
    ebook: "DIGITAL",
    accesorios: "ACCESSORY",
    comida: "FOOD",
  }

  for (const [slug, kind] of Object.entries(mapeo)) {
    const cat = await prisma.category.findUnique({ where: { slug } })
    if (!cat) continue
    const attributes = ATTRS[kind]
    await prisma.category.update({
      where: { slug },
      data: { kind, attributes },
    })
    console.log("Actualizada: " + slug + " -> " + kind)
  }

  // Borrar categoria generica "zapatos" (o "zapatos" con kind SHOES viejo) si no tiene productos
  const zapGen = await prisma.category.findUnique({ where: { slug: "zapatos" } })
  if (zapGen) {
    const count = await prisma.product.count({ where: { categoryId: zapGen.id } })
    if (count === 0) {
      await prisma.category.delete({ where: { id: zapGen.id } })
      console.log("Borrada categoria generica 'zapatos'")
    } else {
      console.log("'zapatos' tiene " + count + " productos, no se borra")
    }
  }

  console.log("Listo.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const PAGINAS = [
  { file: "01-sobre-nosotros.md", slug: "sobre-nosotros", title: "Sobre nosotros", order: 1 },
  { file: "02-como-comprar.md", slug: "como-comprar", title: "Cómo comprar", order: 2 },
  { file: "03-envios.md", slug: "envios", title: "Envíos y despacho", order: 3 },
  { file: "04-devoluciones.md", slug: "devoluciones", title: "Cambios y devoluciones", order: 4 },
  { file: "05-faq.md", slug: "preguntas-frecuentes", title: "Preguntas frecuentes", order: 5 },
  { file: "06-terminos.md", slug: "terminos", title: "Términos y condiciones", order: 6 },
  { file: "07-privacidad.md", slug: "privacidad", title: "Política de privacidad", order: 7 },
  { file: "08-contacto.md", slug: "contacto", title: "Contacto", order: 8 },
]

async function main() {
  for (const p of PAGINAS) {
    const ruta = join(process.cwd(), "Institucional", p.file)
    if (!existsSync(ruta)) {
      console.log(`SKIP: ${p.file} no existe`)
      continue
    }

    const content = readFileSync(ruta, "utf-8")

    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content, order: p.order, active: true },
      create: { slug: p.slug, title: p.title, content, order: p.order, active: true },
    })

    console.log(`OK: ${p.slug}`)
  }

  console.log(`\nListo. ${PAGINAS.length} páginas cargadas.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
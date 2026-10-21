import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Actualizar el FAQ: reemplazar la pregunta de cancelar pedido
  const faq = await prisma.page.findUnique({ where: { slug: "preguntas-frecuentes" } })
  if (faq) {
    let content = faq.content
    content = content.replace(
      /## ¿Puedo cancelar mi pedido\?[\s\S]*$/m,
      `## ¿Puedo cancelar mi pedido?

Una vez confirmado el pago, el pedido ingresa de inmediato al proceso de compra y despacho, por lo que **no es posible cancelarlo**. Si tienes dudas antes de pagar, escríbenos a {{email}} o por WhatsApp {{whatsapp}} y te ayudamos.`
    )
    await prisma.page.update({
      where: { slug: "preguntas-frecuentes" },
      data: { content },
    })
    console.log("OK: FAQ actualizado (sin cancelación post-pago)")
  }

  // 2. Actualizar términos: ajustar cláusula de cancelación si existe
  const terminos = await prisma.page.findUnique({ where: { slug: "terminos" } })
  if (terminos) {
    let content = terminos.content
    // Si tenía algo de cancelación, agregamos una nota
    if (!content.includes("no es posible cancelar")) {
      content = content.replace(
        /(## 3\. Compras[\s\S]*?)(\n## 4\.)/m,
        `$1

**Importante:** una vez confirmado el pago, el pedido ingresa de inmediato al proceso de preparación y despacho, por lo que no es posible cancelarlo. Si tienes dudas, contáctanos antes de completar tu compra.

$2`
      )
      await prisma.page.update({
        where: { slug: "terminos" },
        data: { content },
      })
      console.log("OK: Términos actualizados")
    }
  }

  console.log("Listo.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
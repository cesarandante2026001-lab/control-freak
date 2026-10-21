import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { renderMarkdown } from "@/lib/markdown"

export default async function PageDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const pagina = await prisma.page.findUnique({ where: { slug } })
  if (!pagina || !pagina.active) notFound()

  // Cargar config para reemplazar placeholders
  const configs = await prisma.siteConfig.findMany()
  const config: Record<string, string> = {}
  for (const c of configs) config[c.key] = c.value

  const year = new Date().getFullYear().toString()
  const placeholders: Record<string, string> = {
    storeName: config.storeName ?? "Mi Tienda",
    yearFounded: config.yearFounded ?? year,
    country: config.country ?? "Chile",
    slogan: config.slogan ?? "",
    categoryLabel: config.categoryLabel ?? "productos",
    email: config.email ?? "",
    phone: config.phone ?? "",
    whatsapp: config.whatsapp ?? "",
    address: config.address ?? "",
    instagram: config.instagram ?? "#",
    facebook: config.facebook ?? "#",
    year,
  }

  const contentHTML = renderMarkdown(pagina.content, placeholders)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-xs tracking-widest uppercase text-gray-400 mb-8">
          <Link href="/" className="hover:text-black">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{pagina.title}</span>
        </nav>

        <article
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
      </div>
    </main>
  )
}
import { prisma } from "@/lib/prisma"
import CategoriasClient from "./CategoriasClient"

export default async function CategoriasPage() {
  const categorias = await prisma.category.findMany({
    orderBy: { order: "asc" },
  })

  const data = categorias.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    attributes: c.attributes as { key: string; label: string; type: string; options?: string[] }[],
    order: c.order,
    active: c.active,
    showInNavbar: c.showInNavbar,
  }))

  return <CategoriasClient initial={data} />
}
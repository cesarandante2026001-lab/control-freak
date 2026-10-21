import { prisma } from "@/lib/prisma"
import PaginasClient from "./PaginasClient"

export default async function PaginasPage() {
  const paginas = await prisma.page.findMany({
    orderBy: { order: "asc" },
  })

  const data = paginas.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content,
    order: p.order,
    active: p.active,
  }))

  return <PaginasClient initial={data} />
}
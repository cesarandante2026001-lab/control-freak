import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditarProductoClient from "./EditarProductoClient"

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categorias] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, attributes: true },
    }),
  ])

  if (!product) notFound()

  const dataProducto = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    images: product.images,
    variantImages: product.variantImages as Record<string, string[]>,
    categoryId: product.categoryId,
    provider: product.provider,
    providerUrl: product.providerUrl,
    featured: product.featured,
    active: product.active,
    variants: product.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes as Record<string, string>,
      stock: v.stock,
      imageUrl: v.imageUrl,
    })),
  }

  const categoriasList = categorias.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    attributes: c.attributes as { key: string; label: string; type: string; options?: string[] }[],
  }))

  return (
    <EditarProductoClient
      producto={dataProducto}
      categorias={categoriasList}
    />
  )
}
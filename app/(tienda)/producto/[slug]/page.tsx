import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductClient from "./ProductClient"

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!product || !product.active) notFound()

  return <ProductClient product={JSON.parse(JSON.stringify(product))} />
}
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CarritoClient from "./CarritoClient"

export default async function CarritoPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string })?.id

  let items = []
  if (userId) {
    items = await prisma.cartItem.findMany({
      where: { userId },
      include: { variant: { include: { product: { include: { category: true } } } } },
      orderBy: { createdAt: "desc" },
    })
  }

  const data = items.map((item) => ({
    id: item.id, quantity: item.quantity, variantId: item.variantId, variantImageUrl: item.variant.imageUrl,
    attributes: item.variant.attributes, stock: item.variant.stock,
    product: { id: item.variant.product.id, slug: item.variant.product.slug, name: item.variant.product.name, price: item.variant.product.price, imageUrl: item.variant.product.imageUrl, category: item.variant.product.category ? { name: item.variant.product.category.name } : null },
  }))

  return <CarritoClient initialItems={data} />
}
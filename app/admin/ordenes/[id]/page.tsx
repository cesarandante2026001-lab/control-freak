import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OrdenDetalleClient from "./OrdenDetalleClient"

export default async function OrdenDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const orden = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  })

  if (!orden) notFound()

  const data = {
    id: orden.id,
    shortId: orden.id.slice(-8).toUpperCase(),
    status: orden.status,
    total: orden.total,
    subtotal: orden.subtotal,
    shippingCost: orden.shippingCost,
    customerName: orden.customerName,
    customerEmail: orden.customerEmail,
    customerPhone: orden.customerPhone,
    customerAddress: orden.customerAddress,
    customerCity: orden.customerCity,
    customerRegion: orden.customerRegion,
    notes: orden.notes,
    trackingNumber: orden.trackingNumber,
    paymentId: orden.paymentId,
    providerOrderId: orden.providerOrderId,
    createdAt: orden.createdAt.toISOString(),
    paidAt: orden.paidAt ? orden.paidAt.toISOString() : null,
    items: orden.items.map((it) => ({
      id: it.id,
      quantity: it.quantity,
      price: it.price,
      variant: {
        attributes: it.variant.attributes as Record<string, string>,
      },
      product: {
        name: it.variant.product.name,
        slug: it.variant.product.slug,
        imageUrl: it.variant.product.imageUrl,
      },
    })),
  }

  return <OrdenDetalleClient orden={data} />
}
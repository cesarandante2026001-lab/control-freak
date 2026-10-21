import { prisma } from "@/lib/prisma"
import OrdenesClient from "./OrdenesClient"

export default async function OrdenesPage() {
  const ordenes = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  })

  const mapped = ordenes.map((o) => ({
    id: o.id,
    shortId: o.id.slice(-8).toUpperCase(),
    status: o.status,
    total: o.total,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    customerRegion: o.customerRegion,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt ? o.paidAt.toISOString() : null,
    trackingNumber: o.trackingNumber,
    itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
  }))

  return <OrdenesClient initialOrdenes={mapped} />
}
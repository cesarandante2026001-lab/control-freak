import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import MiCuentaClient from "./MiCuentaClient"

export default async function MiCuentaPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/mi-cuenta")

  const userId = (session.user as { id?: string }).id
  if (!userId) redirect("/login?callbackUrl=/mi-cuenta")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/login")

  const rates = await prisma.shippingRate.findMany({ where: { active: true }, orderBy: { region: "asc" } });

  const ordenes = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  })

  const pedidos = ordenes.map((o) => ({
    id: o.id,
    shortId: o.id.slice(-8).toUpperCase(),
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
  }))

  return (
    <MiCuentaClient
      user={{
        name: user.name ?? "",
        email: user.email,
        phone: user.phone ?? "",
        address: user.address ?? "",
        regionCode: user.regionCode ?? "",
        comuna: user.comuna ?? "",
      }}
      rates={rates}
      pedidos={pedidos}
    />
  )
}
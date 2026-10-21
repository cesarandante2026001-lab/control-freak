import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CheckoutClient from "./CheckoutClient"

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/checkout")
  const userId = (session.user as { id?: string }).id
  if (!userId) redirect("/login?callbackUrl=/checkout")

  const items = await prisma.cartItem.findMany({ where: { userId }, include: { variant: { include: { product: true } } } })
  if (items.length === 0) redirect("/carrito")

  const rates = await prisma.shippingRate.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, region: true, comuna: true, price: true },
  })

  const setting = await prisma.setting.findUnique({ where: { key: "freeShippingThreshold" } })
  const freeThreshold = setting ? Number(setting.value) : 0
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const subtotal = items.reduce((sum, i) => sum + i.variant.product.price * i.quantity, 0)

  const data = {
    subtotal, freeThreshold, rates,
    user: { name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", address: user?.address ?? "", regionCode: user?.regionCode ?? "", comuna: user?.comuna ?? "" }
  }
  return <CheckoutClient data={data} />
}
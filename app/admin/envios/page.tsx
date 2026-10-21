import { prisma } from "@/lib/prisma"
import EnviosClient from "./EnviosClient"

export default async function EnviosPage() {
  const rates = await prisma.shippingRate.findMany({
    orderBy: { order: "asc" },
  })

  const setting = await prisma.setting.findUnique({
    where: { key: "freeShippingThreshold" },
  })

  const freeThreshold = setting ? Number(setting.value) : 50000

  const data = rates.map((r) => ({
    id: r.id,
    region: r.region,
    comuna: r.comuna || "",
    price: r.price,
    active: r.active,
  }))

  return <EnviosClient initialRates={data} initialThreshold={freeThreshold} />
}
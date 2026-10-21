import { prisma } from "@/lib/prisma"
import BannersClient from "./BannersClient"

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  })

  const data = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl,
    linkText: b.linkText,
    order: b.order,
    active: b.active,
  }))

  return <BannersClient initial={data} />
}
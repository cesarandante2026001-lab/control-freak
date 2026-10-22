export const dynamic = 'force-dynamic'

import { Providers } from "@/app/providers"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { prisma } from "@/lib/prisma"

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categorias = await prisma.category.findMany({
    where: { active: true, showInNavbar: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, name: true },
  })

  const setting = await prisma.setting.findUnique({
    where: { key: "freeShippingThreshold" },
  })
  const freeThreshold = setting ? Number(setting.value) : 0

  return (
    <Providers>
      <div className="antialiased flex flex-col min-h-screen">
        <Navbar categorias={categorias} freeThreshold={freeThreshold} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  )
}
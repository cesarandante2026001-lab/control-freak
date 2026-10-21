import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-helpers"
import { Providers } from "@/app/providers"
import { AdminBackButton } from "@/components/AdminBackButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ok = await isAdmin()
  if (!ok) redirect("/login?callbackUrl=/admin")

  return (
    <Providers>
      <AdminBackButton />
      {children}
    </Providers>
  )
}
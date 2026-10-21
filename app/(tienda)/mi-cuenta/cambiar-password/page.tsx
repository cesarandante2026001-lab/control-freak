import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import CambiarPasswordClient from "./CambiarPasswordClient"

export default async function CambiarPasswordPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/mi-cuenta/cambiar-password")
  return <CambiarPasswordClient />
}
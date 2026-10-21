import { Providers } from "@/app/providers"

export default function PlataformaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <main>{children}</main>
    </Providers>
  )
}
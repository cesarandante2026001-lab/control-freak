import { prisma } from "@/lib/prisma"
import ContenidoClient from "./ContenidoClient"

export default async function ContenidoPage() {
  const configs = await prisma.siteConfig.findMany()
  const contents = await prisma.siteContent.findMany()

  const config: Record<string, string> = {}
  for (const c of configs) config[c.key] = c.value

  const content: Record<string, string> = {}
  for (const c of contents) content[c.key] = c.value

  return <ContenidoClient initialConfig={config} initialContent={content} />
}
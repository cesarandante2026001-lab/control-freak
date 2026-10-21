import Link from "next/link"
import { prisma } from "@/lib/prisma"

export async function Footer() {
  // Leer config para datos de contacto
  const configs = await prisma.siteConfig.findMany()
  const config: Record<string, string> = {}
  for (const c of configs) config[c.key] = c.value

  const storeName = config.storeName ?? "Mi Tienda"
  const email = config.email ?? ""
  const whatsapp = config.whatsapp ?? ""
  const address = config.address ?? ""
  const instagram = config.instagram ?? ""
  const facebook = config.facebook ?? ""
  const year = new Date().getFullYear()

  // Categorías para links de tienda
  const categorias = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take: 6,
    select: { slug: true, name: true },
  })

  return (
    <footer className="bg-black text-white pt-16 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Marca */}
          <div>
            <p className="text-lg font-medium tracking-widest uppercase mb-4">
              {storeName}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Compra fácil, pago seguro y despacho a todo Chile.
            </p>
            {(instagram || facebook) && (
              <div className="flex gap-4 mt-6">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Tienda */}
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
              Tienda
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/productos" className="text-gray-300 hover:text-white transition">
                  Todos los productos
                </Link>
              </li>
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/productos?categoria=${c.slug}`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
              Ayuda
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/como-comprar" className="text-gray-300 hover:text-white transition">
                  Cómo comprar
                </Link>
              </li>
              <li>
                <Link href="/envios" className="text-gray-300 hover:text-white transition">
                  Envíos y despacho
                </Link>
              </li>
              <li>
                <Link href="/devoluciones" className="text-gray-300 hover:text-white transition">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-gray-300 hover:text-white transition">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
              Contacto
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              {whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-white transition"
                  >
                    {email}
                  </a>
                </li>
              )}
              {address && <li className="text-gray-400">{address}</li>}
            </ul>
          </div>
        </div>

        {/* Footer inferior */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>
            © {year} {storeName} — Todos los derechos reservados
          </p>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-white transition">
              Términos
            </Link>
            <span>·</span>
            <Link href="/privacidad" className="hover:text-white transition">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
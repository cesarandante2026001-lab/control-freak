"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { CartCounter } from "./CartCounter"

type Categoria = { id: string; slug: string; name: string }

export function Navbar({
  categorias = [],
  freeThreshold = 0,
}: {
  categorias?: Categoria[]
  freeThreshold?: number
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const isLoggedIn = status === "authenticated"
  const userName = session?.user?.name?.split(" ")[0] || "Mi cuenta"
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === "SUPERADMIN" || role === "OWNER" || role === "ADMIN"

  const bannerTexto =
    freeThreshold > 0
      ? `ENVÍO GRATIS EN COMPRAS SOBRE $${freeThreshold.toLocaleString("es-CL")} — DESPACHO A TODO CHILE`
      : "DESPACHO A TODO CHILE"

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="bg-black text-white text-xs text-center py-2 tracking-wide">
        {bannerTexto}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-horizontal.png"
            alt="Control-Freak"
            width={200}
            height={60}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium tracking-wide uppercase overflow-x-auto flex-1 min-w-0 mx-2">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?categoria=${cat.slug}`}
              className={`transition hover:text-gray-500 whitespace-nowrap ${
                pathname.includes(cat.slug)
                  ? "text-black border-b-2 border-black pb-0.5"
                  : "text-gray-700"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm flex-shrink-0 ml-auto">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden md:inline text-xs tracking-widest uppercase text-gray-500 hover:text-black transition"
            >
              Admin
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <Link
                href="/mi-cuenta"
                className="hidden md:inline-flex items-center gap-2 text-gray-700 hover:text-black transition"
              >
                <span className="w-7 h-7 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span>Hola, {userName}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden md:inline text-gray-500 hover:text-black transition text-xs tracking-widest uppercase whitespace-nowrap"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline text-gray-700 hover:text-black transition"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="hidden md:inline px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Registrarse
              </Link>
            </>
          )}

          <CartCounter />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-gray-700"
            aria-label="Menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col p-4 gap-3 text-sm">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-gray-700 uppercase tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr className="border-gray-200 my-2" />
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-700 font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  href="/mi-cuenta"
                  className="text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Hola, {userName}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-gray-500 text-xs tracking-widest uppercase"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
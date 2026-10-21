"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function CartCounter() {
  const { status } = useSession()
  const pathname = usePathname()
  const [count, setCount] = useState(0)

  async function cargar() {
    if (status !== "authenticated") {
      setCount(0)
      return
    }
    try {
      const res = await fetch("/api/carrito", { cache: "no-store" })
      const data = await res.json()
      setCount(data.count ?? 0)
    } catch {
      setCount(0)
    }
  }

  useEffect(() => {
    cargar()
  }, [status, pathname])

  // Escuchar eventos de "carrito actualizado" (emitidos por agregar/eliminar)
  useEffect(() => {
    function handler() {
      cargar()
    }
    window.addEventListener("cart:update", handler)
    return () => window.removeEventListener("cart:update", handler)
  }, [status])

  return (
    <Link
      href="/carrito"
      className="relative flex items-center gap-2 text-gray-700 hover:text-black transition"
      aria-label="Carrito"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span className="hidden md:inline">Carrito</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 md:static md:ml-1 bg-black text-white text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
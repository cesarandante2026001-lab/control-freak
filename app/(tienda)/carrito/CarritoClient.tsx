"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Item = {
  id: string
  quantity: number
  variantId: string
  variantImageUrl: string | null
  attributes: Record<string, string>
  stock: number
  product: {
    id: string
    slug: string
    name: string
    price: number
    imageUrl: string | null
    category: { name: string } | null
  }
}

export default function CarritoClient({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>(initialItems)
  const [error, setError] = useState("")
  const [actualizando, setActualizando] = useState<string | null>(null)

  async function recargar() {
    const res = await fetch("/api/carrito", { cache: "no-store" })
    const data = await res.json()
    setItems(data.items || [])
    window.dispatchEvent(new CustomEvent("cart:update"))
    router.refresh()
  }

  async function cambiarCantidad(item: Item, nueva: number) {
    if (nueva < 1) return
    if (nueva > item.stock) {
      setError(`Solo hay ${item.stock} en stock`)
      return
    }
    setError("")
    setActualizando(item.id)
    await fetch(`/api/carrito/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: nueva }),
    })
    await recargar()
    setActualizando(null)
  }

  async function eliminar(item: Item) {
    if (!confirm(`¿Quitar "${item.product.name}" del carrito?`)) return
    setActualizando(item.id)
    await fetch(`/api/carrito/${item.id}`, { method: "DELETE" })
    await recargar()
    router.refresh()
    setActualizando(null)
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-light mb-4">Tu carrito está vacío</h1>
          <p className="text-sm text-gray-500 mb-8">Explora nuestra colección y agrega tus productos favoritos.</p>
          <Link href="/productos" className="inline-block px-8 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition">Ver productos</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light tracking-tight mb-2">Tu carrito</h1>
        <p className="text-sm text-gray-500 mb-10">{items.length} producto{items.length !== 1 ? "s" : ""} en tu carrito</p>

        {error && <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-white">
                <Link href={`/producto/${item.product.slug}`} className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                  {(item.variantImageUrl || item.product.imageUrl) ? (
                    <img src={item.variantImageUrl || item.product.imageUrl || ''} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{item.product.category?.name}</p>
                  <Link href={`/producto/${item.product.slug}`} className="font-medium hover:underline">{item.product.name}</Link>
                  {Object.keys(item.attributes).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => cambiarCantidad(item, item.quantity - 1)} disabled={actualizando === item.id || item.quantity <= 1} className="w-8 h-8 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40">−</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => cambiarCantidad(item, item.quantity + 1)} disabled={actualizando === item.id || item.quantity >= item.stock} className="w-8 h-8 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-40">+</button>
                    </div>
                    <p className="text-sm font-medium">${(item.product.price * item.quantity).toLocaleString("es-CL")}</p>
                  </div>
                  <button onClick={() => eliminar(item)} disabled={actualizando === item.id} className="text-xs text-red-600 hover:underline mt-2 disabled:opacity-40">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 sticky top-24">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">Resumen del pedido</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CL")}</span>
                </div>
                <p className="text-xs text-gray-500 pt-1">El costo de envío se calculará en el siguiente paso.</p>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium text-lg">${subtotal.toLocaleString("es-CL")}</span>
              </div>
              <Link href="/checkout" className="block w-full text-center py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition">Ir a pagar</Link>
              <Link href="/productos" className="block w-full text-center mt-3 text-xs text-gray-500 hover:text-black">Seguir comprando</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

type Variant = {
  id: string
  attributes: Record<string, string>
  stock: number
}

type Product = {
  id: string
  slug: string
  name: string
  price: number
  stock: number
  category: { id: string; name: string; slug: string } | null
  active: boolean
  featured: boolean
  imageUrl: string | null
  variants: Variant[]
}

const ADMIN_ROLES = ["SUPERADMIN", "OWNER", "ADMIN"]

export default function AdminProductosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/productos")
      return
    }
    const user = session?.user as { role?: string } | undefined
    if (
      status === "authenticated" &&
      (!user?.role || !ADMIN_ROLES.includes(user.role))
    ) {
      router.push("/")
    }
  }, [status, session, router])

  function loadProducts() {
    fetch("/api/admin/productos")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (status !== "authenticated") return
    loadProducts()
  }, [status])

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    })
    loadProducts()
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/admin/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !current }),
    })
    loadProducts()
  }

  async function updateVariantStock(variantId: string, newStock: number) {
    await fetch(`/api/admin/variantes/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Math.max(0, newStock) }),
    })
    loadProducts()
  }

  async function eliminar(p: Product) {
    const mensaje = `Eliminar "${p.name}"?\n\nSi tiene ventas registradas, se desactivara en vez de borrar.`
    if (!confirm(mensaje)) return
    setError("")
    setOk("")

    const res = await fetch(`/api/admin/productos/${p.id}`, {
      method: "DELETE",
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al eliminar")
      return
    }

    if (data.softDeleted) {
      setOk(data.message)
    } else {
      setOk(`Producto "${p.name}" eliminado`)
    }
    setTimeout(() => setOk(""), 4000)
    loadProducts()
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <Link
        href="/admin"
        className="inline-block text-xs tracking-widest uppercase text-gray-500 hover:text-black mb-6"
      >
        Volver al panel
      </Link>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">
              Productos
            </h1>
            <p className="text-sm text-gray-500">Gestiona el catalogo</p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="px-6 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            + Nuevo producto
          </Link>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
            {error}
          </div>
        )}
        {ok && (
          <div className="mb-4 text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
            {ok}
          </div>
        )}

        {products.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
            <p className="text-gray-500 mb-4">No tienes productos todavia</p>
            <Link
              href="/admin/productos/nuevo"
              className="text-sm text-black underline"
            >
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="p-5 bg-gray-50">
                  <div className="flex items-start gap-4 flex-wrap">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium text-lg">{p.name}</p>
                      <p className="text-xs text-gray-400 mb-1">/{p.slug}</p>
                      <p className="text-sm text-gray-600">
                        {p.category?.name ?? "Sin categoria"} Â· $
                        {p.price.toLocaleString("es-CL")} Â·{" "}
                        <strong>{p.stock} en stock</strong>
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                      <button
                        onClick={() => toggleActive(p.id, p.active)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          p.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </button>
                      <button
                        onClick={() => toggleFeatured(p.id, p.featured)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          p.featured
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.featured ? "Destacado" : "Normal"}
                      </button>
                      <Link
                        href={`/admin/productos/${p.id}/editar`}
                        className="px-3 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/producto/${p.slug}`}
                        target="_blank"
                        className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => eliminar(p)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
                    Variantes ({p.variants.length})
                  </p>
                  {p.variants.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Este producto no tiene variantes
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {p.variants.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2"
                        >
                          <div className="text-sm truncate">
                            {Object.keys(v.attributes).length === 0 ? (
                              <span className="text-gray-400">Unico</span>
                            ) : (
                              Object.entries(v.attributes).map(([k, val], i) => (
                                <span key={k}>
                                  {i > 0 && (
                                    <span className="text-gray-400"> Â· </span>
                                  )}
                                  <span>{val}</span>
                                </span>
                              ))
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                updateVariantStock(v.id, v.stock - 1)
                              }
                              className="w-6 h-6 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs"
                            >
                              -
                            </button>
                            <span
                              className={`w-8 text-center text-sm font-medium ${
                                v.stock === 0 ? "text-red-600" : "text-gray-800"
                              }`}
                            >
                              {v.stock}
                            </span>
                            <button
                              onClick={() =>
                                updateVariantStock(v.id, v.stock + 1)
                              }
                              className="w-6 h-6 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
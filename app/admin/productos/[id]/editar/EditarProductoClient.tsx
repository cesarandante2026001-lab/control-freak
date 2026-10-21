"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { UploadDropzone } from "@/lib/uploadthing"
import type { AttributeDef } from "@/lib/categories"

type Category = {
  id: string
  name: string
  slug: string
  attributes: AttributeDef[]
}

type VariantEdit = {
  id?: string
  attributes: Record<string, string>
  stock: number
}

type ProductoEdit = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  images: string[]
  variantImages: Record<string, string[]>
  categoryId: string
  provider: string
  providerUrl: string | null
  featured: boolean
  active: boolean
  variants: {
    id: string
    attributes: Record<string, string>
    stock: number
    imageUrl: string | null
  }[]
}

const ADMIN_ROLES = ["SUPERADMIN", "OWNER", "ADMIN"]
const MAX_FOTOS = 10

export default function EditarProductoClient({
  producto,
  categorias,
}: {
  producto: ProductoEdit
  categorias: Category[]
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState(producto.name)
  const [description, setDescription] = useState(producto.description ?? "")
  const [price, setPrice] = useState(String(producto.price))
  const [categoryId, setCategoryId] = useState(producto.categoryId)
  const [provider, setProvider] = useState(producto.provider)
  const [providerUrl, setProviderUrl] = useState(producto.providerUrl ?? "")
  const [featured, setFeatured] = useState(producto.featured)
  const [active, setActive] = useState(producto.active)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [loading, setLoading] = useState(false)

  const [fotos, setFotos] = useState<string[]>(
    producto.images.length > 0
      ? producto.images
      : producto.imageUrl
        ? [producto.imageUrl]
        : []
  )

  const [variants, setVariants] = useState<VariantEdit[]>(
    producto.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes,
      stock: v.stock,
    }))
  )

  const [variantImages, setVariantImages] = useState<Record<string, string[]>>(
    producto.variantImages ?? {}
  )

  const categoriaActual = useMemo(
    () => categorias.find((c) => c.id === categoryId),
    [categorias, categoryId]
  )

  const atributosActuales: AttributeDef[] = useMemo(() => {
    const raw = categoriaActual?.attributes
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (a) =>
        a &&
        typeof a === "object" &&
        typeof (a as AttributeDef).key === "string" &&
        typeof (a as AttributeDef).label === "string"
    )
  }, [categoriaActual])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/admin/productos/${producto.id}/editar`)
      return
    }
    const user = session?.user as { role?: string } | undefined
    if (
      status === "authenticated" &&
      (!user?.role || !ADMIN_ROLES.includes(user.role))
    ) {
      router.push("/")
    }
  }, [status, session, router, producto.id])

  function updateStock(index: number, nuevoStock: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, stock: Math.max(0, nuevoStock) } : v
      )
    )
  }

  function eliminarVariante(index: number) {
    if (!confirm("Eliminar esta variante?")) return
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  function agregarVariante() {
    setVariants((prev) => [...prev, { attributes: {}, stock: 0 }])
  }

  function cambiarAtributoVariante(index: number, key: string, valor: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, attributes: { ...v.attributes, [key]: valor } }
          : v
      )
    )
  }

  function subirFotos(urls: string[]) {
    setFotos((prev) => {
      const existentes = new Set(prev)
      const nuevas = urls.filter((u) => !existentes.has(u))
      return [...prev, ...nuevas].slice(0, MAX_FOTOS)
    })
  }

  function quitarFoto(url: string) {
    setFotos((prev) => prev.filter((f) => f !== url))
  }

  function moverFotoPrimera(url: string) {
    setFotos((prev) => {
      const restantes = prev.filter((f) => f !== url)
      return [url, ...restantes]
    })
  }

  function cambiarAsociacion(url: string, variantValue: string) {
    setVariantImages((prev) => {
      const copia = { ...prev }
      // Quitar la url de cualquier variante anterior
      for (const k of Object.keys(copia)) {
        copia[k] = copia[k].filter((u) => u !== url)
      }
      // Agregar a la nueva variante (si no es vacia)
      if (variantValue) {
        if (!copia[variantValue]) copia[variantValue] = []
        copia[variantValue] = [...copia[variantValue], url]
      }
      return copia
    })
  }

  function obtenerColorDeFoto(url: string): string {
    for (const [k, urls] of Object.entries(variantImages)) {
      if (urls.includes(url)) return k
    }
    return ""
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setOk("")

    if (!categoryId) {
      setError("Selecciona una categoria")
      return
    }

    if (fotos.length === 0) {
      setError("Sube al menos una foto del producto")
      return
    }

    if (variants.length === 0) {
      setError("El producto debe tener al menos una variante")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          categoryId,
          provider,
          providerUrl,
          imageUrl: fotos[0],
          images: fotos,
          variantImages,
          variants: variants.map((v) => {
            // Buscar la imagen segun el atributo de color especificamente
            const colorVal = v.attributes.color
            const imgVar = colorVal && variantImages[colorVal]?.[0]
              ? variantImages[colorVal][0]
              : null
            return {
              attributes: v.attributes,
              stock: v.stock,
              imageUrl: imgVar,
            }
          }),
          featured,
          active,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al guardar")
        setLoading(false)
        return
      }

      setOk("Producto guardado correctamente")
      setTimeout(() => {
        router.push("/admin/productos")
        router.refresh()
      }, 1500)
    } catch {
      setError("Error de conexion")
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    )
  }

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin/productos"
          className="inline-block text-xs tracking-widest uppercase text-gray-500 hover:text-black mb-6"
        >
          Volver a productos
        </Link>

        <h1 className="text-3xl font-light tracking-tight mb-1">
          Editar producto
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Modifica los datos del producto y guarda los cambios.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Descripcion
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Precio (CLP) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              required
              min={0}
              step={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Categoria *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
              required
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-widest uppercase text-gray-500">
                Fotos del producto ({fotos.length}/{MAX_FOTOS})
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              La primera foto es la principal. Puedes reordenar con &quot;Hacer principal&quot;.
            </p>

            {fotos.length < MAX_FOTOS && (
              <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    subirFotos(
                      res.map((r) => r.ufsUrl).filter(Boolean) as string[]
                    )
                  }
                }}
                onUploadError={(err: Error) => {
                  setError(`Error al subir: ${err.message}`)
                }}
                appearance={{
                  container:
                    "border-2 border-dashed border-gray-300 bg-white rounded-md p-6 ut-uploading:opacity-50",
                  button:
                    "bg-black text-white text-xs tracking-widest uppercase px-6 py-3 rounded-md hover:bg-gray-800",
                  allowedContent: "text-xs text-gray-400",
                  label: "text-sm text-gray-600 hover:text-black",
                }}
              />
            )}

            {fotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {fotos.map((url, idx) => (
                  <div
                    key={url}
                    className="bg-white rounded-md border border-gray-200 p-3"
                  >
                    <div className="aspect-square bg-gray-50 rounded overflow-hidden mb-2 relative">
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[9px] tracking-widest uppercase px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    {idx > 0 && atributosActuales.length > 0 && (() => {
                      const atributoColor =
                        atributosActuales.find((a) => a.key === "color") ||
                        atributosActuales.find((a) => a.options && a.options.length > 0)
                      if (!atributoColor) return null
                      return (
                        <select
                          value={obtenerColorDeFoto(url)}
                          onChange={(e) => cambiarAsociacion(url, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white mb-2"
                        >
                          <option value="">-- {atributoColor.label} --</option>
                          {(atributoColor.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )
                    })()}                    <div className="space-y-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moverFotoPrimera(url)}
                          className="w-full text-[10px] text-blue-600 hover:underline uppercase tracking-widest"
                        >
                          Hacer principal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => quitarFoto(url)}
                        className="w-full text-[10px] text-red-600 hover:underline uppercase tracking-widest"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                Variantes ({variants.length})
              </h3>
              <span className="text-xs text-gray-500">
                Stock total: <strong>{totalStock}</strong>
              </span>
            </div>

            {variants.length > 0 && atributosActuales.length > 0 && (
              <div className="space-y-3 mb-4">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-md p-4 border border-gray-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {atributosActuales.map((a) => (
                        <div key={a.key}>
                          <label className="block text-[10px] tracking-widest uppercase text-gray-500 mb-1">
                            {a.label}
                          </label>
                          {a.type === "select" &&
                          a.options &&
                          a.options.length > 0 ? (
                            <select
                              value={v.attributes[a.key] ?? ""}
                              onChange={(e) =>
                                cambiarAtributoVariante(
                                  idx,
                                  a.key,
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            >
                              <option value="">-</option>
                              {a.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={v.attributes[a.key] ?? ""}
                              onChange={(e) =>
                                cambiarAtributoVariante(
                                  idx,
                                  a.key,
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex-1">Stock:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateStock(idx, v.stock - 1)}
                          className="w-7 h-7 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) =>
                            updateStock(idx, parseInt(e.target.value) || 0)
                          }
                          min={0}
                          className="w-20 text-center px-2 py-1 border border-gray-300 rounded-md focus:border-black outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => updateStock(idx, v.stock + 1)}
                          className="w-7 h-7 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarVariante(idx)}
                        className="text-xs text-red-600 hover:underline ml-3"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={agregarVariante}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-xs tracking-widest uppercase font-medium hover:bg-gray-100 transition"
            >
              + Agregar variante
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Proveedor
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
              >
                <option value="temu">Temu</option>
                <option value="aliexpress">AliExpress</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Link del proveedor
              </label>
              <input
                type="url"
                value={providerUrl}
                onChange={(e) => setProviderUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-md">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4"
              />
              Activo
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {ok && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-md">
              {ok}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-4 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <Link
              href="/admin/productos"
              className="px-8 py-4 border border-gray-300 text-xs tracking-widest uppercase font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { UploadDropzone } from "@/lib/uploadthing"
import { generarCombinaciones, type AttributeDef } from "@/lib/categories"

type Category = {
  id: string
  slug: string
  name: string
  attributes: AttributeDef[]
}

type Variant = {
  attributes: Record<string, string>
  stock: number
}

type Foto = {
  url: string
  variantValue: string
}

const ADMIN_ROLES = ["SUPERADMIN", "OWNER", "ADMIN"]
const MAX_FOTOS = 10

export default function NuevoProductoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [categorias, setCategorias] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [provider, setProvider] = useState("temu")
  const [providerUrl, setProviderUrl] = useState("")
  const [featured, setFeatured] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [textoAtributo, setTextoAtributo] = useState<Record<string, string>>({})
  const [valoresSeleccionados, setValoresSeleccionados] = useState<
    Record<string, string[]>
  >({})
  const [variants, setVariants] = useState<Variant[]>([])
  const [fotos, setFotos] = useState<Foto[]>([])

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

  const atributoFoto = useMemo(() => {
    const color = atributosActuales.find((a) => a.key === "color")
    if (color && color.type === "select" && color.options) return color
    const conOpciones = atributosActuales.find(
      (a) => a.type === "select" && a.options && a.options.length > 0
    )
    return conOpciones ?? null
  }, [atributosActuales])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/productos/nuevo")
      return
    }
    const user = session?.user as { role?: string } | undefined
    if (status === "authenticated" && (!user?.role || !ADMIN_ROLES.includes(user.role))) {
      router.push("/")
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => {
        const list: Category[] = (data.categories || []).map(
          (c: Category) => ({
            ...c,
            attributes: Array.isArray(c.attributes) ? c.attributes : [],
          })
        )
        setCategorias(list)
        if (list.length > 0) setCategoryId(list[0].id)
      })
      .catch(() => {})
  }, [status])

  useEffect(() => {
    setTextoAtributo({})
    setValoresSeleccionados({})
    setVariants([])
    setFotos([])
  }, [categoryId])

  function toggleValorSeleccionado(key: string, valor: string) {
    setValoresSeleccionados((prev) => {
      const actual = prev[key] ?? []
      const next = actual.includes(valor)
        ? actual.filter((v) => v !== valor)
        : [...actual, valor]
      return { ...prev, [key]: next }
    })
  }

  function parseTexto(texto: string): string[] {
    return texto.split(",").map((s) => s.trim()).filter(Boolean)
  }

  function valoresDeAtributo(a: AttributeDef): string[] {
    if (a.type === "select" && a.options && a.options.length > 0) {
      return valoresSeleccionados[a.key] ?? []
    }
    return parseTexto(textoAtributo[a.key] ?? "")
  }

  function regenerarVariantes() {
    const attrs = atributosActuales
    if (attrs.length === 0) {
      setVariants([{ attributes: {}, stock: 0 }])
      return
    }

    const conValores: Record<string, string[]> = {}
    for (const a of attrs) {
      const vals = valoresDeAtributo(a)
      if (vals.length > 0) conValores[a.key] = vals
    }

    if (Object.keys(conValores).length === 0) {
      setVariants([])
      return
    }

    const combinaciones = generarCombinaciones(conValores)
    setVariants(
      combinaciones.map((attributes) => {
        const existente = variants.find(
          (v) => JSON.stringify(v.attributes) === JSON.stringify(attributes)
        )
        return { attributes, stock: existente?.stock ?? 0 }
      })
    )
  }

  function updateStock(index: number, newStock: number) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, stock: Math.max(0, newStock) } : v
      )
    )
  }

  function subirFotos(urls: string[]) {
    setFotos((prev) => {
      const existentes = new Set(prev.map((f) => f.url))
      const nuevas = urls
        .filter((u) => !existentes.has(u))
        .map((url) => ({
          url,
          variantValue: "",
        }))
      return [...prev, ...nuevas].slice(0, MAX_FOTOS)
    })
  }

  function quitarFoto(url: string) {
    setFotos((prev) => prev.filter((f) => f.url !== url))
  }

  function cambiarAsociacion(url: string, variantValue: string) {
    setFotos((prev) =>
      prev.map((f) => (f.url === url ? { ...f, variantValue } : f))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!categoryId) {
      setError("Selecciona una categoría")
      return
    }

    if (fotos.length === 0) {
      setError("Sube al menos una foto del producto")
      return
    }

    const attrs = atributosActuales
    const conValores: Record<string, string[]> = {}
    for (const a of attrs) {
      const vals = valoresDeAtributo(a)
      if (vals.length > 0) conValores[a.key] = vals
    }

    let finalVariants = variants
    if (attrs.length === 0) {
      finalVariants = [{ attributes: {}, stock: variants[0]?.stock ?? 0 }]
    } else if (Object.keys(conValores).length > 0) {
      finalVariants = generarCombinaciones(conValores).map((attributes) => {
        const existente = variants.find(
          (v) => JSON.stringify(v.attributes) === JSON.stringify(attributes)
        )
        return { attributes, stock: existente?.stock ?? 0 }
      })
    }

    if (finalVariants.length === 0) {
      setError(
        attrs.length === 0
          ? "Ingresa el stock del producto"
          : "Elige al menos una opción de algún atributo"
      )
      return
    }

    // Mapa variantImages: { "Negro": ["url1","url2"], ... }
    const variantImages: Record<string, string[]> = {}
    if (atributoFoto) {
      for (const f of fotos) {
        if (!f.variantValue) continue
        if (!variantImages[f.variantValue]) variantImages[f.variantValue] = []
        variantImages[f.variantValue].push(f.url)
      }
    }

    // Imagen principal: la primera foto que tenga color asignado, o la primera foto
    const primeraConColor = fotos.find((f) => f.variantValue)
    const imageUrl = primeraConColor?.url || fotos[0].url

    // Imagen principal de cada variante
    const variantsConImagen = finalVariants.map((v) => {
      const valor = atributoFoto ? v.attributes[atributoFoto.key] : null
      const imgVar = valor ? variantImages[valor]?.[0] ?? null : null
      return { ...v, imageUrl: imgVar }
    })

    setLoading(true)

    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          categoryId,
          provider,
          providerUrl,
          imageUrl,
          images: fotos.map((f) => f.url),
          variantImages,
          attributes: {},
          variants: variantsConImagen,
          featured,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al crear producto")
        setLoading(false)
        return
      }
      router.push("/admin/productos")
    } catch {
      setError("Error de conexión")
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
  const sinAtributos = atributosActuales.length === 0

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin/productos"
          className="inline-block text-xs tracking-widest uppercase text-gray-500 hover:text-black mb-6"
        >
          ← Volver a productos
        </Link>

        <h1 className="text-3xl font-light tracking-tight mb-1">Nuevo producto</h1>
        <p className="text-sm text-gray-500 mb-10">
          Los atributos cambian según el tipo de la categoría elegida.
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
              placeholder="Polera oversize"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 resize-none"
              placeholder="Detalles del producto..."
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
              placeholder="15000"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Categoría *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900"
              required
            >
              {categorias.length === 0 ? (
                <option value="">Cargando categorías...</option>
              ) : (
                categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          {categoriaActual && atributosActuales.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-5">
              <p className="text-xs tracking-widest uppercase text-gray-500">
                Opciones disponibles
              </p>
              {atributosActuales.map((a) => (
                <div key={a.key}>
                  <p className="text-sm font-medium mb-2">{a.label}</p>
                  {a.type === "select" && a.options && a.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {a.options.map((opt) => {
                        const sel = (valoresSeleccionados[a.key] ?? []).includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleValorSeleccionado(a.key, opt)}
                            className={`px-4 py-2 border text-sm rounded transition ${
                              sel
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white hover:border-black"
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={textoAtributo[a.key] ?? ""}
                      onChange={(e) =>
                        setTextoAtributo((prev) => ({
                          ...prev,
                          [a.key]: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 bg-white"
                      placeholder={a.placeholder ?? "Ej: S, M, L, XL"}
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={regenerarVariantes}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-xs tracking-widest uppercase font-medium hover:bg-gray-100 transition"
              >
                Generar variantes
              </button>
            </div>
          )}

          {categoriaActual && sinAtributos && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
                Stock (producto sin variantes)
              </p>
              <input
                type="number"
                value={variants[0]?.stock ?? 0}
                onChange={(e) => {
                  const v = Math.max(0, parseInt(e.target.value) || 0)
                  setVariants([{ attributes: {}, stock: v }])
                }}
                min={0}
                className="w-32 px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 bg-white"
              />
            </div>
          )}

          {variants.length > 0 && !sinAtributos && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Variantes ({variants.length})</h3>
                <span className="text-xs text-gray-500">
                  Stock total: <strong>{totalStock}</strong>
                </span>
              </div>
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white rounded-md px-4 py-3">
                    <div className="flex-1 text-sm">
                      {Object.entries(v.attributes).length === 0 ? (
                        <span className="text-gray-400">Único</span>
                      ) : (
                        Object.entries(v.attributes).map(([k, val], i) => (
                          <span key={k}>
                            {i > 0 && <span className="text-gray-400"> · </span>}
                            <span>{val}</span>
                          </span>
                        ))
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateStock(idx, v.stock - 1)}
                        className="w-7 h-7 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateStock(idx, parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-16 text-center px-2 py-1 border border-gray-300 rounded-md focus:border-black outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => updateStock(idx, v.stock + 1)}
                        className="w-7 h-7 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs tracking-widest uppercase text-gray-500">
                Fotos del producto ({fotos.length}/{MAX_FOTOS})
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Sube hasta 10 fotos. Asocia cada foto a un color para que cambie automáticamente al elegirlo.
            </p>

            {fotos.length < MAX_FOTOS && (
              <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    subirFotos(res.map((r) => r.ufsUrl).filter(Boolean) as string[])
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
                {fotos.map((f, idx) => (
                  <div key={f.url} className="bg-white rounded-md border border-gray-200 p-3">
                    <div className="aspect-square bg-gray-50 rounded overflow-hidden mb-2 relative">
                      <img src={f.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[9px] tracking-widest uppercase px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>

                    {atributoFoto && (
                      <select
                        value={f.variantValue}
                        onChange={(e) => cambiarAsociacion(f.url, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white mb-2"
                      >
                        <option value="">— {atributoFoto.label} —</option>
                        {(atributoFoto.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => quitarFoto(f.url)}
                      className="w-full text-[10px] text-red-600 hover:underline uppercase tracking-widest"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="featured" className="text-sm">
              Destacar producto en la home
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-4 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear producto"}
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
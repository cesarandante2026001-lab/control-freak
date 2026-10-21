"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import type { AttributeDef } from "@/lib/categories"

type Variant = {
  id: string
  attributes: Record<string, string>
  stock: number
  imageUrl: string | null
}

type Category = {
  id: string
  name: string
  slug: string
  attributes: AttributeDef[]
}

type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  images: string[]
  category: Category | null
  variants: Variant[]
}

export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter()
  const { status } = useSession()

  const attrs: AttributeDef[] = useMemo(() => {
    const raw = product.category?.attributes
    return Array.isArray(raw) ? raw : []
  }, [product.category])

  const galeria: string[] = useMemo(() => {
    const set = new Set<string>()
    if (product.imageUrl) set.add(product.imageUrl)
    for (const img of product.images) if (img) set.add(img)
    for (const v of product.variants) if (v.imageUrl) set.add(v.imageUrl)
    return Array.from(set)
  }, [product])

  const valoresPorAtributo: Record<string, string[]> = useMemo(() => {
    const mapa: Record<string, Set<string>> = {}
    for (const a of attrs) mapa[a.key] = new Set()
    for (const v of product.variants) {
      for (const a of attrs) {
        const val = v.attributes[a.key]
        if (val) mapa[a.key].add(val)
      }
    }
    const final: Record<string, string[]> = {}
    for (const key of Object.keys(mapa)) {
      const ordenOriginal = attrs.find((a) => a.key === key)?.options ?? []
      final[key] = Array.from(mapa[key]).sort((a, b) => {
        const ia = ordenOriginal.indexOf(a)
        const ib = ordenOriginal.indexOf(b)
        if (ia === -1 && ib === -1) return a.localeCompare(b)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
    }
    return final
  }, [attrs, product.variants])

  // Arrancar con la primera variante (que ya viene ordenada por el backend)
  const primeraVariante = product.variants[0]

  const [seleccion, setSeleccion] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {}
    if (primeraVariante) {
      for (const a of attrs) {
        const val = primeraVariante.attributes[a.key]
        if (val) s[a.key] = val
      }
    }
    return s
  })

  // Foto activa: imagen de la variante actual o la principal
  const [fotoActiva, setFotoActiva] = useState<string>(
    primeraVariante?.imageUrl || product.imageUrl || galeria[0] || ""
  )

  const [agregando, setAgregando] = useState(false)
  const [feedback, setFeedback] = useState<string>("")

  const varianteActual = useMemo(() => {
    if (attrs.length === 0) return product.variants[0] ?? null
    return (
      product.variants.find((v) =>
        attrs.every((a) => v.attributes[a.key] === seleccion[a.key])
      ) ?? null
    )
  }, [attrs, product.variants, seleccion])

  const stockDisponible = varianteActual?.stock ?? 0
  const puedeComprar = !!varianteActual && stockDisponible > 0

  function cambiarAtributo(key: string, valor: string) {
    const nueva = { ...seleccion, [key]: valor }
    setSeleccion(nueva)

    const varianteMatch = product.variants.find((v) =>
      attrs.every((a) => v.attributes[a.key] === nueva[a.key])
    )
    if (varianteMatch?.imageUrl) {
      setFotoActiva(varianteMatch.imageUrl)
    }
  }

  function pincharMiniatura(url: string) {
    setFotoActiva(url)

    const varianteDeLaFoto = product.variants.find((v) => v.imageUrl === url)
    if (varianteDeLaFoto) {
      const nueva = { ...seleccion }
      for (const a of attrs) {
        const val = varianteDeLaFoto.attributes[a.key]
        if (val) nueva[a.key] = val
      }
      setSeleccion(nueva)
    }
  }

  function valorTieneStock(key: string, valor: string): boolean {
    return product.variants.some((v) => {
      if (v.stock <= 0) return false
      if (v.attributes[key] !== valor) return false
      for (const a of attrs) {
        if (a.key === key) continue
        const sel = seleccion[a.key]
        if (sel && v.attributes[a.key] !== sel) return false
      }
      return true
    })
  }

  async function agregarAlCarrito() {
    if (!varianteActual) return

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/producto/${product.slug}`)
      return
    }

    setAgregando(true)
    setFeedback("")

    try {
      const res = await fetch("/api/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: varianteActual.id, quantity: 1 }),
      })
      const data = await res.json()

      if (!res.ok) {
        setFeedback(data.error || "Error al agregar")
        setAgregando(false)
        return
      }

      setFeedback("¡Agregado al carrito!")
      window.dispatchEvent(new Event("cart:update"))
      router.refresh()
      setTimeout(() => setFeedback(""), 2500)
    } catch {
      setFeedback("Error de conexión")
    } finally {
      setAgregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="text-xs tracking-widest uppercase text-gray-400 mb-8">
          <Link href="/" className="hover:text-black">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <Link
                href={`/productos?categoria=${product.category.slug}`}
                className="hover:text-black"
              >
                {product.category.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex gap-4">
            {galeria.length > 1 && (
              <div className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0">
                {galeria.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pincharMiniatura(img)}
                    className={`aspect-square bg-white rounded border overflow-hidden transition ${
                      fotoActiva === img
                        ? "border-black ring-1 ring-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
              {fotoActiva ? (
                <img
                  src={fotoActiva}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  Sin imagen
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            {product.category && (
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">
                {product.category.name}
              </p>
            )}
            <h1 className="text-4xl font-light tracking-tight mb-4">
              {product.name}
            </h1>

            <p className="text-3xl font-medium mb-6">
              ${product.price.toLocaleString("es-CL")}
            </p>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {attrs.map((a) => {
              const valores = valoresPorAtributo[a.key] ?? []
              if (valores.length === 0) return null

              return (
                <div key={a.key} className="mb-6">
                  <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
                    {a.label}
                    {seleccion[a.key] && (
                      <span className="text-gray-800 ml-2 normal-case tracking-normal">
                        {seleccion[a.key]}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {valores.map((val) => {
                      const tieneStock = valorTieneStock(a.key, val)
                      const sel = seleccion[a.key] === val
                      return (
                        <button
                          key={val}
                          onClick={() => cambiarAtributo(a.key, val)}
                          disabled={!tieneStock}
                          className={`px-4 py-2 border text-sm rounded transition ${
                            sel
                              ? "border-black bg-black text-white"
                              : tieneStock
                              ? "border-gray-300 hover:border-black"
                              : "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                          }`}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {varianteActual && (
              <div className="mb-6">
                {stockDisponible > 0 ? (
                  <p className="text-sm text-green-700">
                    ✓ {stockDisponible} disponible{stockDisponible !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Sin stock en esta combinación
                  </p>
                )}
              </div>
            )}

            <button
              onClick={agregarAlCarrito}
              disabled={!puedeComprar || agregando}
              className={`w-full py-4 text-xs tracking-widest uppercase font-medium transition ${
                puedeComprar && !agregando
                  ? "bg-black text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {agregando
                ? "Agregando..."
                : puedeComprar
                ? "Añadir al carrito"
                : "Sin stock"}
            </button>

            {feedback && (
              <p
                className={`text-sm mt-3 text-center ${
                  feedback.includes("¡") ? "text-green-700" : "text-red-600"
                }`}
              >
                {feedback}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-4 text-center">
              Envío a todo Chile — 7 a 15 días hábiles
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
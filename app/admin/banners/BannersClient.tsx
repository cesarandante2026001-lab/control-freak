"use client"

import { useState, useTransition } from "react"
import { UploadDropzone } from "@/lib/uploadthing"

type Banner = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  linkText: string | null
  order: number
  active: boolean
}

export default function BannersClient({ initial }: { initial: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initial)
  const [msg, setMsg] = useState("")
  const [ok, setOk] = useState("")
  const [pending, start] = useTransition()
  const [mostrandoForm, setMostrandoForm] = useState(false)

  // Form nuevo banner
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [order, setOrder] = useState(0)

  async function recargar() {
    const r = await fetch("/api/admin/banners", { cache: "no-store" })
    const data = await r.json()
    setBanners(data.banners || [])
  }

  async function crear() {
    if (!title.trim() || !imageUrl) {
      setMsg("Título e imagen son obligatorios")
      return
    }
    setMsg("")
    setOk("")

    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        imageUrl,
        linkUrl: linkUrl.trim() || null,
        linkText: linkText.trim() || null,
        order,
      }),
    })

    if (!res.ok) {
      setMsg("Error al crear banner")
      return
    }

    setTitle("")
    setSubtitle("")
    setImageUrl("")
    setLinkUrl("")
    setLinkText("")
    setOrder(0)
    setMostrandoForm(false)
    setOk("Banner creado")
    setTimeout(() => setOk(""), 2500)
    await recargar()
  }

  async function actualizar(b: Banner, campos: Partial<Banner>) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campos),
    })
    await recargar()
  }

  async function eliminar(b: Banner) {
    if (!confirm(`¿Eliminar banner "${b.title}"?`)) return
    await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" })
    setOk("Banner eliminado")
    setTimeout(() => setOk(""), 2500)
    await recargar()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-light mb-1">Banners promocionales</h1>
            <p className="text-sm text-gray-500">
              Aparecen en el home, debajo del navbar. Se rotan automáticamente.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Tamaño recomendado:</strong> 1920 x 600-800 px · máx 500 KB · JPG o PNG
            </p>
          </div>
          <button
            onClick={() => setMostrandoForm(!mostrandoForm)}
            className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-800"
          >
            {mostrandoForm ? "Cancelar" : "+ Nuevo banner"}
          </button>
        </div>

        {msg && (
          <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
            {msg}
          </div>
        )}
        {ok && (
          <div className="mb-4 text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
            {ok}
          </div>
        )}

        {mostrandoForm && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8 space-y-4">
            <h2 className="text-xs tracking-widest uppercase text-gray-500">
              Nuevo banner
            </h2>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Imagen *</label>
              {imageUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-48 h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs text-red-600 underline"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="productImage"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.ufsUrl) setImageUrl(res[0].ufsUrl)
                  }}
                  onUploadError={(err: Error) => setMsg(`Error: ${err.message}`)}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Título *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nueva colección verano"
                  className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subtítulo</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Hasta 30% de descuento"
                  className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL del link</label>
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/productos?categoria=mujer"
                  className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Texto del botón</label>
                <input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ver colección"
                  className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Orden</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-32 border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <button
              onClick={() => start(crear)}
              disabled={pending}
              className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-800 disabled:opacity-50"
            >
              {pending ? "Creando..." : "Crear banner"}
            </button>
          </div>
        )}

        {banners.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
            <p className="text-sm text-gray-400">
              No tienes banners todavía. Crea el primero para que aparezca en el home.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row"
              >
                <div className="w-full md:w-64 h-40 bg-gray-100 flex-shrink-0">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        defaultValue={b.title}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v && v !== b.title) actualizar(b, { title: v })
                        }}
                        className="w-full text-lg font-medium border border-transparent hover:border-gray-200 focus:border-black px-2 py-1 outline-none"
                      />
                      <input
                        defaultValue={b.subtitle ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v !== (b.subtitle ?? "")) actualizar(b, { subtitle: v || null })
                        }}
                        placeholder="Subtítulo"
                        className="w-full text-sm text-gray-500 border border-transparent hover:border-gray-200 focus:border-black px-2 py-1 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => actualizar(b, { active: !b.active })}
                        className={`text-xs px-3 py-1 border rounded ${
                          b.active
                            ? "border-green-300 text-green-700 bg-green-50"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {b.active ? "Activo" : "Inactivo"}
                      </button>
                      <button
                        onClick={() => eliminar(b)}
                        className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-400 uppercase tracking-widest mb-1">
                        URL destino
                      </label>
                      <input
                        defaultValue={b.linkUrl ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v !== (b.linkUrl ?? "")) actualizar(b, { linkUrl: v || null })
                        }}
                        placeholder="/productos"
                        className="w-full border border-gray-200 px-2 py-1 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 uppercase tracking-widest mb-1">
                        Texto botón
                      </label>
                      <input
                        defaultValue={b.linkText ?? ""}
                        onBlur={(e) => {
                          const v = e.target.value.trim()
                          if (v !== (b.linkText ?? "")) actualizar(b, { linkText: v || null })
                        }}
                        placeholder="Ver más"
                        className="w-full border border-gray-200 px-2 py-1 outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 uppercase tracking-widest mb-1">
                        Orden
                      </label>
                      <input
                        type="number"
                        defaultValue={b.order}
                        onBlur={(e) => {
                          const v = Number(e.target.value)
                          if (v !== b.order) actualizar(b, { order: v })
                        }}
                        className="w-24 border border-gray-200 px-2 py-1 outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
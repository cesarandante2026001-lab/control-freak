"use client"

import { useState, useTransition } from "react"

type Pagina = {
  id: string
  slug: string
  title: string
  content: string
  order: number
  active: boolean
}

export default function PaginasClient({ initial }: { initial: Pagina[] }) {
  const [paginas, setPaginas] = useState<Pagina[]>(initial)
  const [editando, setEditando] = useState<string | null>(null)
  const [tituloEdit, setTituloEdit] = useState("")
  const [contenidoEdit, setContenidoEdit] = useState("")
  const [ordenEdit, setOrdenEdit] = useState(0)
  const [msg, setMsg] = useState("")
  const [ok, setOk] = useState("")
  const [pending, start] = useTransition()

  async function recargar() {
    const r = await fetch("/api/admin/paginas", { cache: "no-store" })
    const data = await r.json()
    setPaginas(data.paginas || [])
  }

  function abrirEditor(p: Pagina) {
    setEditando(p.id)
    setTituloEdit(p.title)
    setContenidoEdit(p.content)
    setOrdenEdit(p.order)
    setMsg("")
  }

  async function guardar() {
    if (!editando) return
    setMsg("")
    setOk("")
    const res = await fetch(`/api/admin/paginas/${editando}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tituloEdit, content: contenidoEdit, order: ordenEdit }),
    })
    if (!res.ok) {
      setMsg("Error al guardar")
      return
    }
    setOk("Página guardada")
    setTimeout(() => setOk(""), 2000)
    setEditando(null)
    await recargar()
  }

  async function toggleActive(p: Pagina) {
    await fetch(`/api/admin/paginas/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    })
    await recargar()
  }

  async function eliminar(p: Pagina) {
    if (!confirm(`¿Eliminar "${p.title}"?`)) return
    await fetch(`/api/admin/paginas/${p.id}`, { method: "DELETE" })
    setOk("Página eliminada")
    setTimeout(() => setOk(""), 2000)
    await recargar()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-1">Páginas institucionales</h1>
          <p className="text-sm text-gray-500">
            Edita el contenido de las páginas legales e informativas.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Puedes usar <code className="bg-gray-100 px-1">{"{{storeName}}"}</code>,{" "}
            <code className="bg-gray-100 px-1">{"{{email}}"}</code>,{" "}
            <code className="bg-gray-100 px-1">{"{{whatsapp}}"}</code>,{" "}
            <code className="bg-gray-100 px-1">{"{{country}}"}</code>,{" "}
            <code className="bg-gray-100 px-1">{"{{year}}"}</code>.
          </p>
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

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs tracking-widest uppercase text-gray-500">
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4 text-center">Activa</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginas.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      defaultValue={p.order}
                      onBlur={async (e) => {
                        const v = Number(e.target.value)
                        if (v !== p.order) {
                          await fetch(`/api/admin/paginas/${p.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ order: v }),
                          })
                          await recargar()
                        }
                      }}
                      className="border border-gray-200 px-2 py-1 text-sm w-16"
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                    /p/{p.slug}
                  </td>
                  <td className="py-3 px-4 font-medium">{p.title}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-xs px-3 py-1 border rounded ${
                        p.active
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {p.active ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    <button
                      onClick={() => abrirEditor(p)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <a
                      href={`/p/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => eliminar(p)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-medium">Editar página</h2>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  /p/{paginas.find((p) => p.id === editando)?.slug}
                </p>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                      Título
                    </label>
                    <input
                      value={tituloEdit}
                      onChange={(e) => setTituloEdit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={ordenEdit}
                      onChange={(e) => setOrdenEdit(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                    Contenido (Markdown)
                  </label>
                  <textarea
                    value={contenidoEdit}
                    onChange={(e) => setContenidoEdit(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black outline-none text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Soporta <strong># Título</strong>, <strong>## Subtítulo</strong>,{" "}
                    <strong>**negrita**</strong>, <strong>[link](url)</strong>, listas con{" "}
                    <strong>-</strong>, tablas con <strong>|</strong>.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setEditando(null)}
                  className="px-6 py-3 border border-gray-300 text-xs tracking-widest uppercase hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => start(guardar)}
                  disabled={pending}
                  className="px-6 py-3 bg-black text-white text-xs tracking-widest uppercase hover:bg-gray-800 disabled:opacity-50"
                >
                  {pending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
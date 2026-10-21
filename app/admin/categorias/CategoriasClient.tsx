"use client"

import { Fragment, useState, useTransition } from "react"
import type { CategoryKind } from "@prisma/client"
import { KIND_CONFIG, type AttributeDef } from "@/lib/categories"

type Cat = {
  id: string
  slug: string
  name: string
  kind: CategoryKind
  attributes: AttributeDef[]
  order: number
  active: boolean
  showInNavbar: boolean
}

const KINDS: CategoryKind[] = [
  "APPAREL_ADULT",
  "APPAREL_KIDS",
  "APPAREL_BABY",
  "SHOES_ADULT",
  "SHOES_KIDS",
  "PERFUME",
  "ELECTRONICS",
  "DIGITAL",
  "FOOD",
  "ACCESSORY",
  "GENERIC",
]

export default function CategoriasClient({ initial }: { initial: Cat[] }) {
  const [cats, setCats] = useState<Cat[]>(initial)
  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [order, setOrder] = useState(0)
  const [kind, setKind] = useState<CategoryKind>("GENERIC")
  const [msg, setMsg] = useState("")
  const [ok, setOk] = useState("")
  const [pending, start] = useTransition()
  const [editando, setEditando] = useState<string | null>(null)

  async function recargar() {
    const r = await fetch("/api/admin/categorias", { cache: "no-store" })
    const data = await r.json()
    setCats(data)
  }

  async function crear() {
    if (!slug.trim() || !name.trim()) return
    setMsg("")
    setOk("")
    const attrs = KIND_CONFIG[kind]?.attributes ?? []
    const r = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim(),
        name: name.trim(),
        order,
        kind,
        attributes: attrs,
      }),
    })
    if (r.ok) {
      setSlug("")
      setName("")
      setOrder(0)
      setKind("GENERIC")
      setOk("Categoría creada")
      await recargar()
    } else {
      setMsg("Error al crear")
    }
  }

  async function cargarSugeridas() {
    if (!confirm("Crear categorías sugeridas (desactivadas)? Solo se crean las que no existan.")) return
    setMsg("")
    setOk("")
    const r = await fetch("/api/admin/categorias/sugeridas", { method: "POST" })
    const data = await r.json()
    setOk(`Creadas: ${data.creadas}, ya existían: ${data.saltadas}`)
    await recargar()
  }

  async function actualizar(c: Cat, campos: Partial<Cat>) {
    await fetch(`/api/admin/categorias/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campos),
    })
    await recargar()
  }

  async function cambiarKind(c: Cat, nuevoKind: CategoryKind) {
    const label = KIND_CONFIG[nuevoKind]?.label ?? nuevoKind
    if (!confirm(`Cambiar tipo a "${label}"? Los atributos se actualizan a los predeterminados.`)) return
    await actualizar(c, {
      kind: nuevoKind,
      attributes: KIND_CONFIG[nuevoKind]?.attributes ?? [],
    } as Partial<Cat>)
  }

  async function eliminar(c: Cat) {
    if (!confirm(`¿Eliminar "${c.name}"?`)) return
    const r = await fetch(`/api/admin/categorias/${c.id}`, { method: "DELETE" })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setMsg(j.error || "No se puede eliminar (tiene productos)")
      return
    }
    setMsg("")
    await recargar()
  }

  async function guardarAtributos(c: Cat, nuevos: AttributeDef[]) {
    await actualizar(c, { attributes: nuevos } as Partial<Cat>)
    setEditando(null)
    setOk("Atributos actualizados")
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-light mb-1">Categorías</h1>
            <p className="text-sm text-gray-500 mb-8">
              Crea, edita, activa o elimina. El tipo define qué atributos pide cada producto.
            </p>
          </div>
          <button
            onClick={cargarSugeridas}
            className="text-xs tracking-widest uppercase px-4 py-2 border border-gray-300 hover:border-black"
          >
            Cargar sugeridas
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

        <div className="border border-gray-200 p-4 mb-10 bg-gray-50">
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
            Nueva categoría
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="perfumes"
                className="border border-gray-300 px-3 py-2 text-sm w-40 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Perfumes"
                className="border border-gray-300 px-3 py-2 text-sm w-40 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as CategoryKind)}
                className="border border-gray-300 px-3 py-2 text-sm bg-white"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_CONFIG[k]?.label ?? k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Orden</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="border border-gray-300 px-3 py-2 text-sm w-20 bg-white"
              />
            </div>
            <button
              onClick={() => start(crear)}
              disabled={pending}
              className="bg-black text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-gray-800 disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs tracking-widest uppercase text-gray-500">
              <th className="py-3 pr-3">Orden</th>
              <th className="py-3 pr-3">Slug</th>
              <th className="py-3 pr-3">Nombre</th>
              <th className="py-3 pr-3">Tipo</th>
              <th className="py-3 pr-3">Atributos</th>
              <th className="py-3 pr-3 text-center">Activa</th>
              <th className="py-3 pr-3 text-center">Navbar</th>
              <th className="py-3 pr-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-b border-gray-100 align-top">
                  <td className="py-3 pr-3">
                    <input
                      type="number"
                      defaultValue={c.order}
                      onBlur={(e) => {
                        const v = Number(e.target.value)
                        if (v !== c.order) actualizar(c, { order: v })
                      }}
                      className="border border-gray-200 px-2 py-1 text-sm w-14"
                    />
                  </td>
                  <td className="py-3 pr-3 text-gray-500 text-xs">{c.slug}</td>
                  <td className="py-3 pr-3">
                    <input
                      defaultValue={c.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v && v !== c.name) actualizar(c, { name: v })
                      }}
                      className="border border-gray-200 px-2 py-1 text-sm w-36"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      value={c.kind}
                      onChange={(e) =>
                        cambiarKind(c, e.target.value as CategoryKind)
                      }
                      className="border border-gray-200 px-2 py-1 text-sm bg-white"
                    >
                      {KINDS.map((k) => (
                        <option key={k} value={k}>
                          {KIND_CONFIG[k]?.label ?? k}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3 text-xs text-gray-500">
                    {!c.attributes || c.attributes.length === 0 ? (
                      "—"
                    ) : (
                      <button
                        onClick={() =>
                          setEditando(editando === c.id ? null : c.id)
                        }
                        className="text-left text-xs text-blue-600 hover:underline"
                      >
                        {c.attributes.map((a) => a.label).join(", ")}{" "}
                        <span className="text-gray-400">✎</span>
                      </button>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <button
                      onClick={() => actualizar(c, { active: !c.active })}
                      className={`text-xs px-2 py-1 border ${
                        c.active
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {c.active ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="py-3 pr-3 text-center">
                    <button
                      onClick={() =>
                        actualizar(c, { showInNavbar: !c.showInNavbar })
                      }
                      className={`text-xs px-2 py-1 border ${
                        c.showInNavbar
                          ? "border-blue-300 text-blue-700 bg-blue-50"
                          : "border-gray-300 text-gray-400"
                      }`}
                      title="Mostrar en la barra superior"
                    >
                      {c.showInNavbar ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      onClick={() => eliminar(c)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                {editando === c.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="p-4">
                      <EditorAtributos
                        cat={c}
                        onGuardar={(attrs) => guardarAtributos(c, attrs)}
                        onCancelar={() => setEditando(null)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-gray-400 mt-6">
          <strong>Activa</strong>: se puede comprar / mostrar en catálogo.{" "}
          <strong>Navbar</strong>: aparece en la barra superior (siempre que esté activa).
        </p>
      </div>
    </main>
  )
}

function EditorAtributos({
  cat,
  onGuardar,
  onCancelar,
}: {
  cat: Cat
  onGuardar: (attrs: AttributeDef[]) => void
  onCancelar: () => void
}) {
  const [attrs, setAttrs] = useState<AttributeDef[]>(cat.attributes ?? [])

  function actualizarAtributo(idx: number, campo: keyof AttributeDef, valor: unknown) {
    setAttrs((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [campo]: valor } : a))
    )
  }

  function actualizarOpciones(idx: number, texto: string) {
    const opciones = texto
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    actualizarAtributo(idx, "options", opciones)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs tracking-widest uppercase text-gray-500">
        Atributos de &quot;{cat.name}&quot;
      </p>
      {attrs.length === 0 ? (
        <p className="text-sm text-gray-500">
          Esta categoría no tiene atributos (productos sin variantes).
        </p>
      ) : (
        attrs.map((a, i) => (
          <div key={i} className="border border-gray-200 p-3 bg-white">
            <div className="flex flex-wrap gap-3 items-end mb-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                <input
                  value={a.label}
                  onChange={(e) => actualizarAtributo(i, "label", e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm w-40"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                <select
                  value={a.type}
                  onChange={(e) => actualizarAtributo(i, "type", e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="select">Lista de opciones</option>
                  <option value="text">Texto libre</option>
                  <option value="number">Número</option>
                  <option value="color">Color</option>
                </select>
              </div>
            </div>
            {a.type === "select" && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Opciones (separadas por coma)
                </label>
                <input
                  value={(a.options ?? []).join(", ")}
                  onChange={(e) => actualizarOpciones(i, e.target.value)}
                  className="border border-gray-300 px-3 py-2 text-sm w-full"
                  placeholder="S, M, L, XL"
                />
              </div>
            )}
          </div>
        ))
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onGuardar(attrs)}
          className="bg-black text-white text-xs tracking-widest uppercase px-5 py-2 hover:bg-gray-800"
        >
          Guardar
        </button>
        <button
          onClick={onCancelar}
          className="text-xs tracking-widest uppercase px-5 py-2 border border-gray-300 hover:border-black"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
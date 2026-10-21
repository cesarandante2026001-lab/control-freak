"use client"

import Link from "next/link"
import { useState } from "react"

type Pedido = {
  id: string
  shortId: string
  status: string
  total: number
  createdAt: string
  itemsCount: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "border-yellow-300 text-yellow-700 bg-yellow-50" },
  paid: { label: "Pagada", color: "border-green-300 text-green-700 bg-green-50" },
  shipped: { label: "Enviada", color: "border-blue-300 text-blue-700 bg-blue-50" },
  delivered: { label: "Entregada", color: "border-gray-300 text-gray-700 bg-gray-100" },
  cancelled: { label: "Cancelada", color: "border-red-300 text-red-700 bg-red-50" },
}

export default function MiCuentaClient({
  user,
  rates,
  pedidos,
}: {
  user: { name: string; email: string; phone: string; address: string; regionCode: string; comuna: string }
  rates: { id: string, region: string, comuna: string, price: number }[]
  pedidos: Pedido[]
}) {
  const [tab, setTab] = useState<"pedidos" | "datos">("pedidos")
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [address, setAddress] = useState(user.address)
  const [selectedRegion, setSelectedRegion] = useState(user.regionCode)
  const [selectedComuna, setSelectedComuna] = useState(user.comuna)
  const [msg, setMsg] = useState("")
  const [ok, setOk] = useState("")
  const [guardando, setGuardando] = useState(false)

  const regiones = Array.from(new Set(rates.map(r => r.region)))
  const comunasDisponibles = rates.filter(r => r.region === selectedRegion)

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault()
    setMsg("")
    setOk("")
    setGuardando(true)

    const res = await fetch("/api/usuario/datos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address, regionCode: selectedRegion, comuna: selectedComuna }),
    })

    setGuardando(false)
    if (res.ok) {
      setOk("Datos actualizados")
      setTimeout(() => setOk(""), 2500)
    } else {
      setMsg("Error al guardar")
    }
  }

  function formatoFecha(iso: string) {
    return new Date(iso).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mb-10">
          Hola, {user.name || user.email}
        </p>

        <div className="flex gap-2 border-b border-gray-200 mb-8">
          <button
            onClick={() => setTab("pedidos")}
            className={`text-xs tracking-widest uppercase py-3 px-4 border-b-2 transition ${
              tab === "pedidos"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Mis pedidos ({pedidos.length})
          </button>
          <button
            onClick={() => setTab("datos")}
            className={`text-xs tracking-widest uppercase py-3 px-4 border-b-2 transition ${
              tab === "datos"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Mis datos
          </button>
        </div>

        {tab === "pedidos" && (
          <>
            {pedidos.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Todavía no tienes pedidos
                </p>
                <Link
                  href="/productos"
                  className="inline-block px-6 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
                >
                  Ver productos
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((p) => {
                  const st = STATUS_LABELS[p.status] || {
                    label: p.status,
                    color: "border-gray-300 text-gray-600",
                  }
                  return (
                    <div
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-5 flex items-center justify-between flex-wrap gap-3"
                    >
                      <div>
                        <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">
                          Pedido
                        </p>
                        <p className="font-mono text-sm">#{p.shortId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatoFecha(p.createdAt)} · {p.itemsCount} producto
                          {p.itemsCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-3 py-1 border rounded ${st.color}`}
                        >
                          {st.label}
                        </span>
                        <p className="text-lg font-medium mt-2">
                          ${p.total.toLocaleString("es-CL")}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab === "datos" && (
          <form onSubmit={guardarDatos} className="max-w-lg space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                El email no se puede cambiar por ahora
              </p>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                  Región
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => { setSelectedRegion(e.target.value); setSelectedComuna(""); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none bg-white"
                >
                  <option value="">Selecciona Región</option>
                  {regiones.map((r, i) => <option key={i} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
                  Comuna
                </label>
                <select
                  value={selectedComuna}
                  onChange={(e) => setSelectedComuna(e.target.value)}
                  disabled={!selectedRegion}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Selecciona Comuna</option>
                  {comunasDisponibles.map((r) => <option key={r.id} value={r.comuna}>{r.comuna}</option>)}
                </select>
              </div>
            </div>

            {ok && (
              <div className="text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
                {ok}
              </div>
            )}
            {msg && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                {msg}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={guardando}
                className="px-6 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar datos"}
              </button>
              <Link
                href="/mi-cuenta/cambiar-password"
                className="px-6 py-3 border border-gray-300 text-xs tracking-widest uppercase font-medium hover:bg-gray-50 transition"
              >
                Cambiar contraseña
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
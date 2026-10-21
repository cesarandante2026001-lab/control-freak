"use client"

import { useState } from "react"

type Rate = { id: string, region: string, comuna: string, price: number, active: boolean }

export default function EnviosClient({ initialRates, initialThreshold }: { initialRates: Rate[], initialThreshold: number }) {
  const [rates, setRates] = useState<Rate[]>(initialRates)
  const [threshold, setThreshold] = useState(initialThreshold)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState("")
  
  // Estados para nueva comuna
  const [nuevaRegion, setNuevaRegion] = useState("")
  const [nuevaComuna, setNuevaComuna] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")

  async function guardar() {
    setGuardando(true)
    setOk("")
    const res = await fetch("/api/admin/envios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ freeThreshold: threshold, rates }),
    })
    setGuardando(false)
    if (res.ok) {
      setOk("Cambios guardados")
      setTimeout(() => setOk(""), 2000)
    }
  }

  function updateRate(id: string, campo: "price" | "active", valor: number | boolean) {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)))
  }

  async function agregarComuna(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevaRegion || !nuevaComuna || !nuevoPrecio) return
    
    const res = await fetch("/api/admin/envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: nuevaRegion, comuna: nuevaComuna, price: Number(nuevoPrecio) })
    })
    
    if (res.ok) {
      const nueva = await res.json()
      setRates([...rates, nueva].sort((a,b) => a.region.localeCompare(b.region) || a.comuna.localeCompare(b.comuna)))
      setNuevaRegion("")
      setNuevaComuna("")
      setNuevoPrecio("")
      setOk("Comuna agregada")
      setTimeout(() => setOk(""), 2000)
    } else {
      const error = await res.json()
      alert(error.error || "Error al agregar")
    }
  }

  async function eliminarComuna(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta comuna?")) return
    const res = await fetch("/api/admin/envios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setRates(rates.filter(r => r.id !== id))
      setOk("Comuna eliminada")
      setTimeout(() => setOk(""), 2000)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-light mb-1">Envios</h1>
        <p className="text-sm text-gray-500 mb-8">Define el costo de envio por comuna y el umbral para envio gratis.</p>

        {ok && <div className="mb-4 text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">{ok}</div>}

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8">
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Envio gratis desde</p>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">$</span>
            <input type="number" value={threshold} onChange={(e) => setThreshold(Math.max(0, Number(e.target.value) || 0))} min={0} step={1000} className="border border-gray-300 px-3 py-2 text-sm w-40 bg-white" />
            <span className="text-sm text-gray-500">CLP (0 = nunca envio gratis)</span>
          </div>
        </div>

        {/* FORMULARIO PARA AGREGAR COMUNA */}
        <form onSubmit={agregarComuna} className="mb-8 p-4 border border-gray-200 rounded-lg bg-white flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-500 block mb-1">Region</label>
            <input type="text" value={nuevaRegion} onChange={e => setNuevaRegion(e.target.value)} placeholder="Ej: Metropolitana" className="w-full border px-3 py-2 text-sm rounded" required />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-500 block mb-1">Comuna</label>
            <input type="text" value={nuevaComuna} onChange={e => setNuevaComuna(e.target.value)} placeholder="Ej: Santiago" className="w-full border px-3 py-2 text-sm rounded" required />
          </div>
          <div className="w-32">
            <label className="text-xs text-gray-500 block mb-1">Precio</label>
            <input type="number" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} placeholder="0" className="w-full border px-3 py-2 text-sm rounded" required />
          </div>
          <button type="submit" className="bg-black text-white text-xs uppercase px-4 py-2.5 rounded hover:bg-gray-800">Agregar</button>
        </form>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs tracking-widest uppercase text-gray-500">
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Comuna</th>
                <th className="py-3 px-4">Precio (CLP)</th>
                <th className="py-3 px-4 text-center">Activa</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.region}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{r.comuna || "Sin comuna"}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">$</span>
                      <input type="number" value={r.price} onChange={(e) => updateRate(r.id, "price", Math.max(0, Number(e.target.value) || 0))} min={0} step={100} className="border border-gray-300 px-2 py-1 text-sm w-24" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => updateRate(r.id, "active", !r.active)} className={`text-xs px-3 py-1 border ${r.active ? "border-green-300 text-green-700 bg-green-50" : "border-gray-300 text-gray-400"}`}>
                      {r.active ? "Si" : "No"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => eliminarComuna(r.id)} className="text-red-500 hover:text-red-700 text-xs font-medium uppercase tracking-wider">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">{rates.length} comunas cargadas</p>
          <button onClick={guardar} disabled={guardando} className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-800 disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </main>
  )
}
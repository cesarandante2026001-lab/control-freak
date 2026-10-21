"use client"
import Link from "next/link"
import { useMemo, useState } from "react"

type Rate = { id: string, region: string, comuna: string, price: number }
type Data = { subtotal: number, freeThreshold: number, rates: Rate[], user: { name: string, email: string, phone: string, address: string, regionCode: string, comuna: string } }

export default function CheckoutClient({ data }: { data: Data }) {
  const [nombre, setNombre] = useState(data.user.name)
  const [email, setEmail] = useState(data.user.email)
  const [telefono, setTelefono] = useState(data.user.phone)
  const [direccion, setDireccion] = useState(data.user.address)
  const [selectedRegion, setSelectedRegion] = useState(data.user.regionCode || "")
  const [selectedComuna, setSelectedComuna] = useState(data.user.comuna || "")
  const [notas, setNotas] = useState("")
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [guardandoDir, setGuardandoDir] = useState(false)

  const regiones = Array.from(new Set(data.rates.map(r => r.region)))
  const comunasDisponibles = data.rates.filter(r => r.region === selectedRegion)

  const selectedRate = data.rates.find(r => r.region === selectedRegion && r.comuna === selectedComuna)
  const envioBase = selectedRate?.price ?? 0
  const envio = useMemo(() => {
    if (data.freeThreshold > 0 && data.subtotal >= data.freeThreshold) return 0
    return envioBase
  }, [data.freeThreshold, data.subtotal, envioBase])

  const total = data.subtotal + envio

  async function guardarDireccion() {
    if (!selectedRegion || !selectedComuna) { alert("Selecciona region y comuna primero"); return; }
    setGuardandoDir(true)
    const res = await fetch("/api/users/me/address", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: direccion, region: selectedRegion, comuna: selectedComuna })
    })
    setGuardandoDir(false)
    if (res.ok) alert("Direccion guardada en tu perfil. Se usara en futuras compras.")
    else alert("Error al guardar direccion")
  }

  async function continuarAlPago(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRegion || !selectedComuna) { setError("Selecciona tu región y comuna"); return; }
    setEnviando(true)
    try {
      const res = await fetch("/api/checkout", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          customerName: nombre, 
          customerEmail: email, 
          customerPhone: telefono, 
          customerAddress: direccion, 
          customerCity: selectedComuna, 
          customerRegion: selectedRegion, 
          shippingCost: envio, 
          notes: notas 
        }) 
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Error"); setEnviando(false); return; }
      window.location.href = json.initPoint
    } catch { setError("Error de conexión"); setEnviando(false); }
  }

  return (
    <main className="min-h-screen bg-white"><div className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/carrito" className="text-xs text-gray-500 hover:text-black mb-6">← Volver al carrito</Link>
      <h1 className="text-3xl font-light mb-2">Checkout</h1>
      {error && <div className="mb-6 text-sm text-red-600 bg-red-50 px-3 py-2">{error}</div>}
      
      <form onSubmit={continuarAlPago} className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Nombre completo *</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="w-full px-3 py-2 border rounded text-sm" /></div>
            <div><label className="text-xs text-gray-500">Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded text-sm" /></div>
          </div>
          <div><label className="text-xs text-gray-500">Teléfono *</label><input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="w-full px-3 py-2 border rounded text-sm" /></div>
          <div><label className="text-xs text-gray-500">Dirección *</label><input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required className="w-full px-3 py-2 border rounded text-sm" /></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Región *</label>
              <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedComuna(""); }} required className="w-full px-3 py-2 border rounded text-sm bg-white">
                <option value="">Selecciona Región</option>
                {regiones.map((r, i) => <option key={i} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Comuna *</label>
              <select value={selectedComuna} onChange={(e) => setSelectedComuna(e.target.value)} required disabled={!selectedRegion} className="w-full px-3 py-2 border rounded text-sm bg-white disabled:bg-gray-100">
                <option value="">Selecciona Comuna</option>
                {comunasDisponibles.map((r) => <option key={r.id} value={r.comuna}>{r.comuna}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button type="button" onClick={guardarDireccion} disabled={guardandoDir} className="text-xs text-blue-600 hover:text-blue-800 underline">
              {guardandoDir ? "Guardando..." : "Guardar esta dirección para futuras compras"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1"><div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xs uppercase text-gray-500 mb-4">Resumen</h2>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${data.subtotal.toLocaleString("es-CL")}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Envío</span>
              <span>
                {!selectedComuna ? <span className="text-gray-400 text-xs">Elige comuna</span> : envioBase === 0 ? <span className="text-green-700">Gratis</span> : envio === 0 ? <span className="text-green-700 flex gap-1">Gratis <span className="text-xs text-gray-400 line-through">${envioBase.toLocaleString("es-CL")}</span></span> : `$${envio.toLocaleString("es-CL")}`}
              </span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6 flex justify-between font-medium"><span>Total</span><span className="text-lg">${total.toLocaleString("es-CL")}</span></div>
          <button type="submit" disabled={enviando} className="w-full py-4 bg-black text-white text-xs uppercase disabled:opacity-50">{enviando ? "Procesando..." : "Pagar con MercadoPago"}</button>
        </div></div>
      </form>
    </div></main>
  )
}
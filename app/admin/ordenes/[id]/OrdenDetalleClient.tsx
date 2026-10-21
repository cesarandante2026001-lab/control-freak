"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Item = {
  id: string
  quantity: number
  price: number
  variant: { attributes: Record<string, string> }
  product: { name: string; slug: string; imageUrl: string | null }
}

type Orden = {
  id: string
  shortId: string
  status: string
  total: number
  subtotal: number
  shippingCost: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string | null
  customerRegion: string | null
  notes: string | null
  trackingNumber: string | null
  paymentId: string | null
  providerOrderId: string | null
  createdAt: string
  paidAt: string | null
  items: Item[]
}

const ESTADOS = ["pending", "paid", "shipped", "delivered", "cancelled"]
const ESTADO_LABEL: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
}

export default function OrdenDetalleClient({ orden: initial }: { orden: Orden }) {
  const router = useRouter()
  const [orden, setOrden] = useState(initial)
  const [tracking, setTracking] = useState(orden.trackingNumber ?? "")
  const [notas, setNotas] = useState(orden.notes ?? "")
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState("")

  async function cambiarEstado(nuevoEstado: string) {
    setGuardando(true)
    setOk("")
    const res = await fetch(`/api/admin/ordenes/${orden.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoEstado }),
    })
    if (res.ok) {
      const data = await res.json()
      setOrden((o) => ({ ...o, status: data.orden.status }))
      setOk(`Estado cambiado a ${ESTADO_LABEL[nuevoEstado]}`)
      setTimeout(() => setOk(""), 2000)
    }
    setGuardando(false)
  }

  async function guardarTracking() {
    setGuardando(true)
    setOk("")
    const res = await fetch(`/api/admin/ordenes/${orden.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking }),
    })
    if (res.ok) {
      setOk("Tracking guardado")
      setTimeout(() => setOk(""), 2000)
    }
    setGuardando(false)
  }

  async function guardarNotas() {
    setGuardando(true)
    setOk("")
    const res = await fetch(`/api/admin/ordenes/${orden.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notas }),
    })
    if (res.ok) {
      setOk("Notas guardadas")
      setTimeout(() => setOk(""), 2000)
    }
    setGuardando(false)
  }

  function fechaFormato(iso: string) {
    return new Date(iso).toLocaleString("es-CL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/admin/ordenes"
          className="inline-block text-xs tracking-widest uppercase text-gray-500 hover:text-black mb-6"
        >
          ← Volver a órdenes
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light mb-1">
              Orden <span className="font-mono">#{orden.shortId}</span>
            </h1>
            <p className="text-sm text-gray-500">{fechaFormato(orden.createdAt)}</p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 border rounded ${
              orden.status === "paid"
                ? "border-green-300 text-green-700 bg-green-50"
                : orden.status === "shipped"
                ? "border-blue-300 text-blue-700 bg-blue-50"
                : orden.status === "delivered"
                ? "border-gray-300 text-gray-700 bg-gray-100"
                : orden.status === "cancelled"
                ? "border-red-300 text-red-700 bg-red-50"
                : "border-yellow-300 text-yellow-700 bg-yellow-50"
            }`}
          >
            {ESTADO_LABEL[orden.status]}
          </span>
        </div>

        {ok && (
          <div className="mb-6 text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
            {ok}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: items + acciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-xs tracking-widest uppercase text-gray-500">
                  Productos ({orden.items.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {orden.items.map((it) => (
                  <div key={it.id} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {it.product.imageUrl && (
                        <img
                          src={it.product.imageUrl}
                          alt={it.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/producto/${it.product.slug}`}
                        className="font-medium hover:underline"
                        target="_blank"
                      >
                        {it.product.name}
                      </Link>
                      {Object.keys(it.variant.attributes).length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Object.entries(it.variant.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">
                        ${(it.price * it.quantity).toLocaleString("es-CL")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {it.quantity} × ${it.price.toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${orden.subtotal.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Envío</span>
                  <span>
                    {orden.shippingCost === 0
                      ? "Gratis"
                      : `$${orden.shippingCost.toLocaleString("es-CL")}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                  <span>Total</span>
                  <span>${orden.total.toLocaleString("es-CL")}</span>
                </div>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Cambiar estado
              </h2>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => cambiarEstado(e)}
                    disabled={guardando || orden.status === e}
                    className={`text-xs px-4 py-2 border transition ${
                      orden.status === e
                        ? "border-black bg-black text-white cursor-default"
                        : "border-gray-300 hover:border-black"
                    } disabled:opacity-50`}
                  >
                    {ESTADO_LABEL[e]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Número de seguimiento
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Ej: CHX123456789"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
                />
                <button
                  onClick={guardarTracking}
                  disabled={guardando}
                  className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Se enviará al cliente por email cuando implementemos notificaciones.
              </p>
            </div>

            {/* Notas internas */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Notas internas
              </h2>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Notas para ti o tu equipo..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm resize-none"
              />
              <button
                onClick={guardarNotas}
                disabled={guardando}
                className="mt-2 px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Guardar notas
              </button>
            </div>
          </div>

          {/* Columna derecha: cliente */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Cliente
              </h2>
              <p className="font-medium mb-1">{orden.customerName}</p>
              <p className="text-sm text-gray-600 mb-1">{orden.customerEmail}</p>
              <p className="text-sm text-gray-600">{orden.customerPhone}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Dirección de envío
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {orden.customerAddress}
                {"\n"}
                {orden.customerCity}, {orden.customerRegion}
              </p>
            </div>

            {orden.notes && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                  Nota del cliente
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {orden.notes}
                </p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
                Pago
              </h2>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">ID Preferencia MP:</span>
                  <br />
                  <span className="font-mono break-all">{orden.paymentId ?? "—"}</span>
                </p>
                {orden.providerOrderId && (
                  <p className="pt-2">
                    <span className="text-gray-400">ID Pago MP:</span>
                    <br />
                    <span className="font-mono break-all">
                      {orden.providerOrderId}
                    </span>
                  </p>
                )}
                {orden.paidAt && (
                  <p className="pt-2">
                    <span className="text-gray-400">Pagada el:</span>
                    <br />
                    {fechaFormato(orden.paidAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
"use client"

import Link from "next/link"
import { useState } from "react"

type Orden = {
  id: string
  shortId: string
  status: string
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerRegion: string | null
  createdAt: string
  paidAt: string | null
  trackingNumber: string | null
  itemsCount: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "border-yellow-300 text-yellow-700 bg-yellow-50" },
  paid: { label: "Pagada", color: "border-green-300 text-green-700 bg-green-50" },
  shipped: { label: "Enviada", color: "border-blue-300 text-blue-700 bg-blue-50" },
  delivered: { label: "Entregada", color: "border-gray-300 text-gray-700 bg-gray-100" },
  cancelled: { label: "Cancelada", color: "border-red-300 text-red-700 bg-red-50" },
}

export default function OrdenesClient({ initialOrdenes }: { initialOrdenes: Orden[] }) {
  const [ordenes] = useState<Orden[]>(initialOrdenes)
  const [filtro, setFiltro] = useState<string>("todas")

  const conteoPorEstado = ordenes.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filtradas = filtro === "todas"
    ? ordenes
    : ordenes.filter((o) => o.status === filtro)

  function formatoFecha(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-1">Órdenes</h1>
          <p className="text-sm text-gray-500">
            {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} en total
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFiltro("todas")}
            className={`text-xs px-3 py-1.5 border transition ${
              filtro === "todas" ? "border-black bg-black text-white" : "border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            Todas ({ordenes.length})
          </button>
          {Object.keys(STATUS_LABELS).map((key) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`text-xs px-3 py-1.5 border transition ${
                filtro === key ? "border-black bg-black text-white" : "border-gray-300 text-gray-700 hover:border-black"
              }`}
            >
              {STATUS_LABELS[key].label} ({conteoPorEstado[key] || 0})
            </button>
          ))}
        </div>

        {filtradas.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
            <p className="text-sm text-gray-400">
              {filtro === "todas"
                ? "Todavía no tienes órdenes"
                : `No hay órdenes en estado "${STATUS_LABELS[filtro]?.label}"`}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs tracking-widest uppercase text-gray-500">
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Región</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((o) => {
                  const st = STATUS_LABELS[o.status] || {
                    label: o.status,
                    color: "border-gray-300 text-gray-600",
                  }
                  return (
                    <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          #{o.shortId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {formatoFecha(o.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{o.customerName}</p>
                        <p className="text-xs text-gray-500">{o.customerEmail}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {o.customerRegion ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-center">{o.itemsCount}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${o.total.toLocaleString("es-CL")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 border rounded ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/ordenes/${o.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
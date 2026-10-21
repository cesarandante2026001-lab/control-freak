"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Kpis = {
  ventasHoy: { total: number; cantidad: number; ayer: number; ayerCantidad: number }
  ventasMes: { total: number; cantidad: number }
  ticketPromedio: number
  pendientes: number
  bajoStock: number
  grafico: { fecha: string; total: number }[]
  top5: { nombre: string; cantidad: number; total: number }[]
  ultimas: {
    id: string
    shortId: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
  paid: { label: "Pagada", color: "text-green-700 bg-green-50 border-green-300" },
  shipped: { label: "Enviada", color: "text-blue-700 bg-blue-50 border-blue-300" },
  delivered: { label: "Entregada", color: "text-gray-700 bg-gray-100 border-gray-300" },
  cancelled: { label: "Cancelada", color: "text-red-700 bg-red-50 border-red-300" },
}

export default function DashboardClient() {
  const [data, setData] = useState<Kpis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/kpis")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando KPIs...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error al cargar KPIs</p>
      </main>
    )
  }

  const variacionHoy =
    data.ventasHoy.ayer > 0
      ? Math.round(((data.ventasHoy.total - data.ventasHoy.ayer) / data.ventasHoy.ayer) * 100)
      : null

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-light mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">Resumen de tu tienda</p>
          </div>
          <Link
            href="/admin"
            className="text-xs tracking-widest uppercase text-gray-500 hover:text-black"
          >
            â† Volver al panel
          </Link>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Tarjeta
            titulo="Ventas hoy"
            valor={`$${data.ventasHoy.total.toLocaleString("es-CL")}`}
            extra={
              variacionHoy !== null
                ? `${variacionHoy >= 0 ? "â†‘" : "â†“"} ${Math.abs(variacionHoy)}% vs ayer`
                : "Sin ventas ayer"
            }
            colorExtra={variacionHoy !== null && variacionHoy >= 0 ? "text-green-600" : "text-red-600"}
          />
          <Tarjeta
            titulo="Ventas del mes"
            valor={`$${data.ventasMes.total.toLocaleString("es-CL")}`}
            extra={`${data.ventasMes.cantidad} orden${data.ventasMes.cantidad !== 1 ? "es" : ""}`}
          />
          <Tarjeta
            titulo="Ticket promedio"
            valor={`$${data.ticketPromedio.toLocaleString("es-CL")}`}
            extra="Promedio por orden"
          />
          <Tarjeta
            titulo="Ã“rdenes pendientes"
            valor={`${data.pendientes}`}
            extra={data.pendientes > 0 ? "Requieren atenciÃ³n" : "Todo al dÃ­a"}
            colorExtra={data.pendientes > 0 ? "text-yellow-600" : "text-green-600"}
          />
        </div>

        {/* Alerta stock bajo */}
        {data.bajoStock > 0 && (
          <div className="mb-8 border border-yellow-300 bg-yellow-50 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-yellow-800">
              <strong>{data.bajoStock}</strong> variante{data.bajoStock !== 1 ? "s" : ""} con stock bajo (menos de 5 unidades)
            </p>
            <Link
              href="/admin/productos"
              className="text-xs tracking-widest uppercase text-yellow-800 hover:text-black"
            >
              Ver productos â†’
            </Link>
          </div>
        )}

        {/* GrÃ¡fico */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-6">
            Ventas Ãºltimos 30 dÃ­as
          </h2>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.grafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 11, fill: "#999" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#999" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [`$${v.toLocaleString("es-CL")}`, "Ventas"]}
                  contentStyle={{ fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#000"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 productos */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-6">
              Top 5 productos (Ãºltimos 30 dÃ­as)
            </h2>
            {data.top5.length === 0 ? (
              <p className="text-sm text-gray-400">Sin ventas todavÃ­a</p>
            ) : (
              <div className="space-y-3">
                {data.top5.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{p.nombre}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-medium">${p.total.toLocaleString("es-CL")}</p>
                      <p className="text-xs text-gray-500">{p.cantidad} vendidos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ãšltimas Ã³rdenes */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs tracking-widest uppercase text-gray-500">
                Ãšltimas Ã³rdenes
              </h2>
              <Link
                href="/admin/ordenes"
                className="text-xs text-gray-500 hover:text-black"
              >
                Ver todas â†’
              </Link>
            </div>
            {data.ultimas.length === 0 ? (
              <p className="text-sm text-gray-400">Sin Ã³rdenes todavÃ­a</p>
            ) : (
              <div className="space-y-3">
                {data.ultimas.map((o) => {
                  const st = STATUS_LABELS[o.status] || {
                    label: o.status,
                    color: "text-gray-600 bg-gray-50 border-gray-300",
                  }
                  return (
                    <Link
                      key={o.id}
                      href={`/admin/ordenes/${o.id}`}
                      className="flex items-center justify-between text-sm hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-gray-500">#{o.shortId}</p>
                        <p className="truncate">{o.customerName}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-medium">${o.total.toLocaleString("es-CL")}</p>
                        <span className={`text-[10px] px-2 py-0.5 border rounded ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function Tarjeta({
  titulo,
  valor,
  extra,
  colorExtra,
}: {
  titulo: string
  valor: string
  extra?: string
  colorExtra?: string
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">{titulo}</p>
      <p className="text-2xl font-light mb-1">{valor}</p>
      {extra && (
        <p className={`text-xs ${colorExtra ?? "text-gray-500"}`}>{extra}</p>
      )}
    </div>
  )
}
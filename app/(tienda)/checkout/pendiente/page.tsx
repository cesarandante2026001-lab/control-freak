import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function PendientePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment_id?: string }>
}) {
  const params = await searchParams
  const orderId = params.order

  let ordenInfo: { id: string; total: number; customerName: string } | null = null
  if (orderId) {
    const o = await prisma.order.findUnique({ where: { id: orderId } })
    if (o) ordenInfo = { id: o.id, total: o.total, customerName: o.customerName }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a16207"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        <h1 className="text-3xl font-light mb-3">Pago pendiente</h1>
        <p className="text-sm text-gray-500 mb-8">
          Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.
          Si elegiste pago en efectivo, recibirás las instrucciones por correo.
        </p>

        {ordenInfo && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">N° de orden</span>
              <span className="font-mono text-xs">
                {ordenInfo.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">
                ${ordenInfo.total.toLocaleString("es-CL")}
              </span>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="inline-block px-8 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { mpPayment } from "@/lib/mercadopago"

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment_id?: string; status?: string }>
}) {
  const params = await searchParams
  const orderId = params.order
  const paymentId = params.payment_id
  const status = params.status

  let ordenInfo: {
    id: string
    total: number
    status: string
    customerName: string
  } | null = null

  if (orderId) {
    // Verificar pago con MP y actualizar orden + stock
    if (paymentId && status === "approved") {
      try {
        const pago = await mpPayment.get({ id: paymentId })
        if (pago.status === "approved") {
          const ordenActual = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          })

          if (ordenActual && ordenActual.status !== "paid") {
            // 1. Marcar como pagada
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: "paid",
                paidAt: new Date(),
                providerOrderId: String(pago.id),
              },
            })

            // 2. Bajar stock de cada variante
            for (const item of ordenActual.items) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              })
            }

            // 3. Vaciar carrito
            if (ordenActual.userId) {
              await prisma.cartItem.deleteMany({
                where: { userId: ordenActual.userId },
              })
            }
          }
        }
      } catch (e) {
        console.error("Error verificando pago:", e)
      }
    }

    const o = await prisma.order.findUnique({ where: { id: orderId } })
    if (o) {
      ordenInfo = {
        id: o.id,
        total: o.total,
        status: o.status,
        customerName: o.customerName,
      }
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#15803d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="text-3xl font-light mb-3">Gracias por tu compra</h1>
        <p className="text-sm text-gray-500 mb-8">
          {ordenInfo
            ? "Hemos recibido tu pedido. Te contactaremos a " + ordenInfo.customerName + " por email para coordinar el envio."
            : "Hemos recibido tu pedido correctamente."}
        </p>

        {ordenInfo && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8 text-left">
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">
              Resumen del pedido
            </p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">N de orden</span>
              <span className="font-mono text-xs">{ordenInfo.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">
                ${ordenInfo.total.toLocaleString("es-CL")}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/productos"
            className="inline-block px-8 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="inline-block px-8 py-4 border border-gray-300 text-xs tracking-widest uppercase font-medium hover:bg-gray-50 transition"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
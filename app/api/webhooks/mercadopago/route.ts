import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mpPayment } from "@/lib/mercadopago"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const url = new URL(req.url)
    const topic = url.searchParams.get("type") ?? body.type ?? body.topic

    console.log("Webhook MP:", topic, JSON.stringify(body).slice(0, 300))

    if (topic === "payment" || body.type === "payment") {
      const paymentId = body.data?.id ?? body.resource
      if (!paymentId) return NextResponse.json({ ok: true })

      const pago = await mpPayment.get({ id: String(paymentId) })
      const orderId = pago.external_reference
      if (!orderId) return NextResponse.json({ ok: true })

      const estado = pago.status

      if (estado === "approved") {
        // Verificar si ya se proceso (evitar duplicados)
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

          // 3. Vaciar carrito del comprador
          if (ordenActual.userId) {
            await prisma.cartItem.deleteMany({
              where: { userId: ordenActual.userId },
            })
          }

          console.log("Orden " + orderId + " pagada. Stock decrementado.")
        }
      } else if (estado === "rejected" || estado === "cancelled") {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "cancelled" },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error webhook MP:", error)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
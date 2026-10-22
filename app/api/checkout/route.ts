import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mpPreference } from "@/lib/mercadopago"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Debes iniciar sesiÃƒÂ³n" }, { status: 401 })
  }
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: "Sin sesiÃƒÂ³n" }, { status: 401 })

  try {
    const body = await req.json()

    const customerName = String(body.customerName || "").trim()
    const customerEmail = String(body.customerEmail || "").trim().toLowerCase()
    const customerPhone = String(body.customerPhone || "").trim()
    const customerAddress = String(body.customerAddress || "").trim()
    const customerCity = String(body.customerCity || "").trim()
    const customerRegion = String(body.customerRegion || "").trim()
    const notes = String(body.notes || "").trim() || null
    const shippingCost = Math.max(0, Math.floor(Number(body.shippingCost) || 0))

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !customerAddress ||
      !customerCity ||
      !customerRegion
    ) {
      return NextResponse.json({ error: "Faltan datos de envÃƒÂ­o" }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: { product: true },
        },
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Carrito vacÃƒÂ­o" }, { status: 400 })
    }

    for (const item of cartItems) {
      if (item.quantity > item.variant.stock) {
        return NextResponse.json(
          { error: `Sin stock suficiente para ${item.variant.product.name}` },
          { status: 400 }
        )
      }
    }

    const subtotal = cartItems.reduce(
      (sum, i) => sum + i.variant.product.price * i.quantity,
      0
    )
    const total = subtotal + shippingCost

    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        shippingCost,
        shippingRegion: customerRegion,
        total,
        status: "pending",
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        customerRegion,
        notes,
        items: {
          create: cartItems.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.variant.product.price,
          })),
        },
      },
      include: { items: true },
    })

    const appUrl = process.env.APP_URL ?? "http://localhost:3000"

    const preference = await mpPreference.create({
      body: {
        items: cartItems.map((i) => ({
          id: i.variantId,
          title: i.variant.product.name,
          description:
            Object.entries(i.variant.attributes as Record<string, string>)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" Ã‚Â· ") || undefined,
          quantity: i.quantity,
          unit_price: i.variant.product.price,
          currency_id: "CLP",
        })),
        shipments:
          shippingCost > 0
            ? {
                cost: shippingCost,
                mode: "not_specified",
              }
            : undefined,
        payer: {
          name: customerName,
          email: customerEmail,
          phone: { number: customerPhone },
        },
        back_urls: {
          success: `${appUrl}/checkout/exito?order=${order.id}`,
          failure: `${appUrl}/checkout/error?order=${order.id}`,
          pending: `${appUrl}/checkout/pendiente?order=${order.id}`,
        },
        external_reference: order.id,
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        statement_descriptor: "CONTROL-FREAK",
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: preference.id },
    })

    return NextResponse.json({
      orderId: order.id,
      initPoint: preference.init_point,
    })
  } catch (error) {
    console.error("Error checkout:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: "Error al procesar el pedido: " + msg },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

function isAdminRole(role?: string): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

function inicioDelDia(fecha: Date): Date {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No auth" }, { status: 401 })
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) return NextResponse.json({ error: "Solo admin" }, { status: 403 })

  const ahora = new Date()
  const hoy = inicioDelDia(ahora)
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  const hace30 = new Date(hoy)
  hace30.setDate(hace30.getDate() - 30)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  // Órdenes pagadas (status = paid, shipped, delivered)
  const estadosPagados = ["paid", "shipped", "delivered"]

  // Ventas hoy
  const ventasHoy = await prisma.order.aggregate({
    where: {
      status: { in: estadosPagados },
      paidAt: { gte: hoy },
    },
    _sum: { total: true },
    _count: true,
  })

  // Ventas ayer
  const ventasAyer = await prisma.order.aggregate({
    where: {
      status: { in: estadosPagados },
      paidAt: { gte: ayer, lt: hoy },
    },
    _sum: { total: true },
    _count: true,
  })

  // Ventas del mes
  const ventasMes = await prisma.order.aggregate({
    where: {
      status: { in: estadosPagados },
      paidAt: { gte: inicioMes },
    },
    _sum: { total: true },
    _count: true,
  })

  // Órdenes pendientes de despacho (pagadas pero no enviadas)
  const pendientes = await prisma.order.count({
    where: { status: "paid" },
  })

  // Productos con bajo stock (< 5)
  const bajoStock = await prisma.productVariant.count({
    where: {
      stock: { lt: 5, gte: 0 },
      product: { active: true },
    },
  })

  // Gráfico: ventas por día últimos 30 días
  const ordenes30Dias = await prisma.order.findMany({
    where: {
      status: { in: estadosPagados },
      paidAt: { gte: hace30 },
    },
    select: { paidAt: true, total: true },
  })

  const porDia: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    porDia[key] = 0
  }
  for (const o of ordenes30Dias) {
    if (!o.paidAt) continue
    const key = o.paidAt.toISOString().slice(0, 10)
    if (porDia[key] !== undefined) porDia[key] += o.total
  }

  const grafico = Object.entries(porDia).map(([fecha, total]) => ({
    fecha: fecha.slice(5), // MM-DD
    total,
  }))

  // Top 5 productos vendidos (últimos 30 días)
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: estadosPagados },
        paidAt: { gte: hace30 },
      },
    },
    include: {
      variant: {
        include: { product: true },
      },
    },
  })

  const topProductos: Record<string, { nombre: string; cantidad: number; total: number }> = {}
  for (const it of items) {
    const key = it.variant.product.id
    if (!topProductos[key]) {
      topProductos[key] = { nombre: it.variant.product.name, cantidad: 0, total: 0 }
    }
    topProductos[key].cantidad += it.quantity
    topProductos[key].total += it.price * it.quantity
  }

  const top5 = Object.values(topProductos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  // Últimas 5 órdenes
  const ultimas = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
    },
  })

  // Ticket promedio (últimos 30 días)
  const sumaVentas = ventasMes._sum.total ?? 0
  const cantidadVentas = ventasMes._count ?? 0
  const ticketPromedio = cantidadVentas > 0 ? Math.round(sumaVentas / cantidadVentas) : 0

  return NextResponse.json({
    ventasHoy: {
      total: ventasHoy._sum.total ?? 0,
      cantidad: ventasHoy._count,
      ayer: ventasAyer._sum.total ?? 0,
      ayerCantidad: ventasAyer._count,
    },
    ventasMes: {
      total: sumaVentas,
      cantidad: cantidadVentas,
    },
    ticketPromedio,
    pendientes,
    bajoStock,
    grafico,
    top5,
    ultimas: ultimas.map((o) => ({
      id: o.id,
      shortId: o.id.slice(-8).toUpperCase(),
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  })
}
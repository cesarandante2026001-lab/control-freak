import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

function isAdminRole(role?: string): boolean {
  return !!role && ADMIN_ROLES.includes(role as UserRole)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ product })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const cambiosCompletos =
      body.name !== undefined ||
      body.price !== undefined ||
      body.categoryId !== undefined ||
      body.variants !== undefined

    if (cambiosCompletos) {
      const existente = await prisma.product.findUnique({ where: { id } })
      if (!existente) {
        return NextResponse.json({ error: "No existe" }, { status: 404 })
      }

      const dataProducto: Record<string, unknown> = {}
      if (body.name !== undefined) dataProducto.name = String(body.name).trim()
      if (body.description !== undefined)
        dataProducto.description = body.description ? String(body.description).trim() : null
      if (body.price !== undefined)
        dataProducto.price = Math.floor(Number(body.price)) || 0
      if (body.imageUrl !== undefined)
        dataProducto.imageUrl = body.imageUrl || null
      if (body.images !== undefined && Array.isArray(body.images))
        dataProducto.images = body.images
      if (body.variantImages !== undefined)
        dataProducto.variantImages = body.variantImages
      if (body.categoryId !== undefined)
        dataProducto.categoryId = String(body.categoryId)
      if (body.provider !== undefined)
        dataProducto.provider = String(body.provider)
      if (body.providerUrl !== undefined)
        dataProducto.providerUrl = body.providerUrl ? String(body.providerUrl).trim() : null
      if (body.featured !== undefined) dataProducto.featured = Boolean(body.featured)
      if (body.active !== undefined) dataProducto.active = Boolean(body.active)

      const product = await prisma.product.update({
        where: { id },
        data: dataProducto,
      })

      // Si vienen variantes, reemplazarlas
      if (body.variants && Array.isArray(body.variants)) {
        const variantImages = (body.variantImages || {}) as Record<string, string[]>
        const images = (body.images || []) as string[]

        // Detectar colores unicos en el orden en que aparecen
        const coloresUnicos: string[] = []
        for (const v of body.variants) {
          const c = v.attributes?.color
          if (c && !coloresUnicos.includes(c)) coloresUnicos.push(c)
        }

        // Asignar fotos por orden si variantImages esta vacio
        const fotosPorColor: Record<string, string> = {}

        // Primero, respetar variantImages si tiene datos
        for (const [color, urls] of Object.entries(variantImages)) {
          if (urls && urls.length > 0) {
            fotosPorColor[color] = urls[0]
          }
        }

        // Segundo, si no hay asignacion manual, asignar por orden
        // Fotos 1, 2, 3... -> colores 1, 2, 3...
        if (Object.keys(fotosPorColor).length === 0 && images.length > 0) {
          for (let i = 0; i < coloresUnicos.length; i++) {
            if (images[i]) {
              fotosPorColor[coloresUnicos[i]] = images[i]
            }
          }
        }

        // Borrar las variantes viejas
        await prisma.productVariant.deleteMany({ where: { productId: id } })

        // Crear las nuevas
        for (const v of body.variants) {
          const colorVal = v.attributes?.color
          let imgUrl = v.imageUrl || null

          // Si no viene imageUrl explicito, buscar en fotosPorColor
          if (!imgUrl && colorVal && fotosPorColor[colorVal]) {
            imgUrl = fotosPorColor[colorVal]
          }

          await prisma.productVariant.create({
            data: {
              productId: id,
              attributes: v.attributes || {},
              stock: Math.floor(Number(v.stock) || 0),
              imageUrl: imgUrl,
            },
          })
        }
      }

      const productoFinal = await prisma.product.findUnique({
        where: { id },
        include: { variants: true, category: true },
      })

      return NextResponse.json({ product: productoFinal })
    }

    const data: Record<string, boolean> = {}
    if (typeof body.active === "boolean") data.active = body.active
    if (typeof body.featured === "boolean") data.featured = body.featured

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: "Error: " + msg }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const user = session.user as { role?: string }
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Solo admin" }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.cartItem.deleteMany({
      where: { variant: { productId: id } },
    })

    const orderItemsCount = await prisma.orderItem.count({
      where: { variant: { productId: id } },
    })

    if (orderItemsCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { active: false },
      })
      return NextResponse.json({
        ok: true,
        softDeleted: true,
        message: `El producto tiene ${orderItemsCount} ventas registradas. Se desactivo en vez de borrar.`,
      })
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ ok: true, softDeleted: false })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    const msg = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: "Error al eliminar: " + msg },
      { status: 500 }
    )
  }
}
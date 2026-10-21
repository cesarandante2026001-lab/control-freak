import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams

  const categorias = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, name: true },
  })

  const productos = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoria ? { category: { slug: categoria } } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  const categoriaActual = categorias.find((c) => c.slug === categoria)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-3 uppercase">
            {categoriaActual ? "Categoría" : "Catálogo"}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            {categoriaActual ? categoriaActual.name : "Todos los productos"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {productos.length} producto{productos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <aside className="md:col-span-1">
            <h2 className="text-xs tracking-widest uppercase text-gray-500 mb-4">
              Categorías
            </h2>
            <nav className="flex flex-col gap-2">
              <Link
                href="/productos"
                className={`text-sm py-2 border-b border-gray-100 transition ${
                  !categoria
                    ? "text-black font-medium"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                Todos
              </Link>
              {categorias.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className={`text-sm py-2 border-b border-gray-100 transition ${
                    categoria === cat.slug
                      ? "text-black font-medium"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="md:col-span-3">
            {productos.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
                <p className="text-gray-500 mb-2">
                  No hay productos en esta categoría
                </p>
                <Link
                  href="/productos"
                  className="text-sm text-black underline"
                >
                  Ver todos los productos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/producto/${p.slug}`}
                    className="group"
                  >
                    <div className="aspect-square bg-white rounded-lg overflow-hidden mb-3 border border-gray-200 shadow-sm group-hover:shadow-md transition duration-300">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : null}
                    </div>
                    <p className="text-sm font-medium mb-1">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      ${p.price.toLocaleString("es-CL")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
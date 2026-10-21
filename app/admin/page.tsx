import Link from "next/link"

export default function AdminPage() {
  const secciones = [
    { href: "/admin/dashboard", title: "Dashboard", desc: "KPIs de ventas, productos y ordenes." },
    { href: "/admin/ordenes", title: "Ordenes", desc: "Ver compras, cambiar estado y tracking." },
    { href: "/admin/productos", title: "Productos", desc: "Administrar productos, precios y stock." },
    { href: "/admin/categorias", title: "Categorias", desc: "Crear, editar y ordenar categorias." },
    { href: "/admin/banners", title: "Banners", desc: "Carrusel promocional del home." },
    { href: "/admin/envios", title: "Envios", desc: "Costos por region y umbral de envio gratis." },
    { href: "/admin/contenido", title: "Contenido", desc: "Textos e imagenes del home." },
    { href: "/admin/paginas", title: "Paginas", desc: "Terminos, envios, devoluciones, etc." },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">Panel admin</h1>
          <p className="text-sm text-gray-500">Administra tu tienda desde aqui.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-black transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Ver tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secciones.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-gray-200 rounded-lg p-8 hover:border-black transition"
          >
            <h2 className="text-xl font-medium mb-2">{s.title}</h2>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
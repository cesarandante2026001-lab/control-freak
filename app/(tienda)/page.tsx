import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { BannerCarousel } from "@/components/BannerCarousel"

function reemplazar(texto: string, valores: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, key) => valores[key] ?? `{{${key}}}`)
}

export default async function HomePage() {
  const configsRaw = await prisma.siteConfig.findMany()
  const config: Record<string, string> = {}
  for (const c of configsRaw) config[c.key] = c.value

  const contentsRaw = await prisma.siteContent.findMany()
  const contents: Record<string, string> = {}
  for (const c of contentsRaw) contents[c.key] = c.value

  const year = new Date().getFullYear().toString()
  const placeholders: Record<string, string> = {
    storeName: config.storeName ?? "Mi Tienda",
    yearFounded: config.yearFounded ?? year,
    country: config.country ?? "Chile",
    slogan: config.slogan ?? "Productos para todos",
    categoryLabel: config.categoryLabel ?? "productos",
    email: config.email ?? "",
    phone: config.phone ?? "",
    whatsapp: config.whatsapp ?? "",
    address: config.address ?? "",
    instagram: config.instagram ?? "#",
    facebook: config.facebook ?? "#",
    year,
  }

  function txt(key: string, fallback: string): string {
    const raw = contents[key] ?? fallback
    return reemplazar(raw, placeholders)
  }

  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  })

  const categorias = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  })

  const destacados = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  const pasos = [
    { titulo: txt("home.howto.step1", "Elige tus productos"), desc: txt("home.howto.step1.desc", "Explora el catálogo y encuentra lo que buscas.") },
    { titulo: txt("home.howto.step2", "Confirma tu carrito"), desc: txt("home.howto.step2.desc", "Revisa tu carrito y ajusta las cantidades.") },
    { titulo: txt("home.howto.step3", "Paga seguro"), desc: txt("home.howto.step3.desc", "Paga con MercadoPago: tarjetas, transferencia o efectivo.") },
    { titulo: txt("home.howto.step4", "Recibe en tu hogar"), desc: txt("home.howto.step4.desc", "Despachamos a todo Chile con seguimiento en línea.") },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* CARRUSEL DE BANNERS */}
      {banners.length > 0 && (
        <BannerCarousel
          banners={banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            imageUrl: b.imageUrl,
            linkUrl: b.linkUrl,
            linkText: b.linkText,
          }))}
        />
      )}

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 uppercase">
          {txt("home.hero.eyebrow", "NUEVA COLECCIÓN")}
        </p>
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
          {txt("home.hero.title", placeholders.slogan)}
        </h1>
        <p className="text-base text-gray-600 mb-10 max-w-xl mx-auto">
          {txt("home.hero.subtitle", "Descubre nuestra colección. Envío a todo Chile con la mejor calidad.")}
        </p>
        <Link
          href={contents["home.hero.ctaUrl"] || "/productos"}
          className="inline-block px-10 py-4 bg-black text-white text-sm tracking-widest uppercase font-medium hover:bg-gray-800 transition"
        >
          {txt("home.hero.ctaText", "VER COLECCIÓN")}
        </Link>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light tracking-tight mb-2">
            {txt("home.categories.title", "Categorías")}
          </h2>
          <p className="text-sm text-gray-500">
            {txt("home.categories.subtitle", "Explora por sección")}
          </p>
        </div>
        {categorias.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
            <p className="text-sm text-gray-400">Aún no hay categorías.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="group border border-gray-200 rounded-lg p-8 text-center hover:border-black transition"
              >
                <p className="text-base font-medium tracking-wide uppercase mb-1 group-hover:text-gray-500 transition">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BANNER CTA */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl font-semibold tracking-wide uppercase mb-1">
              {txt("home.ctaBanner.title", "¿LISTO PARA REALIZAR TU PEDIDO?")}
            </h3>
            <p className="text-gray-500 text-xs font-light">
              {txt("home.ctaBanner.subtitle", "Explora nuestro catálogo completo con despacho directo a tu casa.")}
            </p>
          </div>
          <Link
            href={contents["home.ctaBanner.buttonUrl"] || "/productos"}
            className="bg-black text-white px-8 py-3.5 text-xs tracking-[0.15em] font-semibold uppercase hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap"
          >
            {txt("home.ctaBanner.buttonText", "IR A LA TIENDA →")}
          </Link>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-light tracking-tight mb-2">
              {txt("home.featured.title", "Productos destacados")}
            </h2>
            <p className="text-sm text-gray-500">
              {txt("home.featured.subtitle", "Lo más popular del momento")}
            </p>
          </div>
          <Link
            href="/productos"
            className="text-xs tracking-widest uppercase text-gray-700 hover:text-black border-b border-black pb-1"
          >
            {txt("home.featured.viewAllText", "VER TODO")}
          </Link>
        </div>

        {destacados.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg p-16 text-center">
            <p className="text-sm text-gray-400">Pronto verás aquí nuestra selección destacada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {destacados.map((p) => (
              <Link key={p.id} href={`/producto/${p.slug}`} className="group">
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
                <p className="text-sm text-gray-500">${p.price.toLocaleString("es-CL")}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="w-full h-[360px] sm:h-[420px] bg-gray-200 rounded-lg overflow-hidden">
            {contents["home.about.imageUrl"] ? (
              <img
                src={contents["home.about.imageUrl"]}
                alt="Sobre nosotros"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Sube una imagen desde el admin
              </div>
            )}
          </div>
          <div className="lg:pr-8">
            <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
              {txt("home.about.eyebrow", `SOBRE ${placeholders.storeName}`)}
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight mb-5">
              {txt("home.about.title", `Diseñado en ${placeholders.country}, pensado para durar`)}
            </h2>
            <p className="text-sm sm:text-base font-light text-gray-600 mb-7 leading-relaxed">
              {txt("home.about.text", `${placeholders.storeName} nació en ${placeholders.yearFounded} con una misión simple: ofrecer ${placeholders.categoryLabel} de la más alta calidad, seleccionada con cuidado y con despacho a todo ${placeholders.country}.`)}
            </p>
            <Link
              href={contents["home.about.linkUrl"] || "/sobre-nosotros"}
              className="inline-block text-xs tracking-[0.15em] uppercase font-semibold text-black border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
            >
              {txt("home.about.linkText", "Conoce nuestra historia")} →
            </Link>
          </div>
        </div>
      </section>

      {/* CÓMO COMPRAR */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl tracking-[0.05em] uppercase font-semibold">
              {txt("home.howto.title", "Cómo Comprar")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pasos.map((paso, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold mb-5">
                  {i + 1}
                </div>
                <h3 className="text-sm font-medium text-black mb-2">{paso.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <div className="border-y border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xs tracking-[0.1em] uppercase font-semibold">
              {txt("home.benefits.1", `ENVÍO A TODO ${placeholders.country}`)}
            </h3>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.1em] uppercase font-semibold">
              {txt("home.benefits.2", "PAGO 100% SEGURO")}
            </h3>
          </div>
          <div>
            <h3 className="text-xs tracking-[0.1em] uppercase font-semibold">
              {txt("home.benefits.3", "ATENCIÓN POR WHATSAPP")}
            </h3>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <section className="bg-black text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 tracking-wide">
            {txt("home.newsletter.title", "Recibe nuestras novedades")}
          </h2>
          <p className="text-sm text-gray-400 mb-7 max-w-md mx-auto">
            {txt("home.newsletter.subtitle", "Ofertas exclusivas y lanzamientos, directo a tu correo.")}
          </p>
          <form className="flex flex-col sm:flex-row justify-center items-center max-w-md mx-auto gap-3 sm:gap-0">
            <input
              type="email"
              placeholder={txt("home.newsletter.placeholder", "Tu correo electrónico")}
              className="w-full sm:w-auto flex-1 px-5 py-4 bg-transparent border border-white text-white text-xs outline-none placeholder:text-gray-500 focus:border-gray-400 transition-colors"
            />
            <button
              type="button"
              className="w-full sm:w-auto bg-white text-black px-7 py-4 text-[11px] tracking-[0.15em] font-semibold uppercase hover:bg-gray-200 transition-colors duration-200"
            >
              {txt("home.newsletter.buttonText", "SUSCRIBIRME")}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
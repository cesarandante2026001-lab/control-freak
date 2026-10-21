import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "8qlick - Sistemas para tu negocio",
  description: "Plataforma de sistemas empresariales: ecommerce, agendamientos, CRM. Para pymes y empresas en Chile.",
}

export default function QlickLanding() {
  const apps = [
    {
      nombre: "Ecommerce",
      icono: "🛒",
      descripcion: "Vende online con catalogo, carrito, pagos con MercadoPago y despacho a todo Chile.",
      estado: "disponible",
      url: "/",
      cta: "Ver demo",
    },
    {
      nombre: "Agendamiento",
      icono: "📅",
      descripcion: "Gestiona citas, reservas y horarios. Para clinicas, hoteles, restaurantes y gimnasios.",
      estado: "proximamente",
      url: "#",
      cta: "Proximamente",
    },
    {
      nombre: "CRM con IA",
      icono: "🤖",
      descripcion: "Administra clientes, oportunidades y seguimiento con inteligencia artificial.",
      estado: "proximamente",
      url: "#",
      cta: "Proximamente",
    },
    {
      nombre: "Gestion de Almacenes",
      icono: "📦",
      descripcion: "Controla stock, movimientos y trazabilidad de tus productos.",
      estado: "proximamente",
      url: "#",
      cta: "Proximamente",
    },
    {
      nombre: "Gestion de Compras",
      icono: "🧾",
      descripcion: "Ordenes de compra, proveedores y control de gastos.",
      estado: "proximamente",
      url: "#",
      cta: "Proximamente",
    },
    {
      nombre: "Facturacion Electronica",
      icono: "📄",
      descripcion: "Boletas y facturas integradas con el SII.",
      estado: "proximamente",
      url: "#",
      cta: "Proximamente",
    },
  ]

  const planes = [
    {
      nombre: "Inicial",
      precio: "$4.750",
      periodo: "CLP / mes",
      descripcion: "Para empezar a vender",
      features: [
        "Hasta 10 productos",
        "Carrito y checkout",
        "Pago con MercadoPago",
        "Envio por region",
        "Soporte por email",
      ],
      cta: "Contratar",
      destacado: false,
    },
    {
      nombre: "Pro",
      precio: "$9.990",
      periodo: "CLP / mes",
      descripcion: "Para negocios en crecimiento",
      features: [
        "Hasta 100 productos",
        "Todo lo del plan Inicial",
        "Multiples fotos por producto",
        "Banners promocionales",
        "Dashboard con KPIs",
        "Soporte prioritario",
      ],
      cta: "Contratar",
      destacado: true,
    },
    {
      nombre: "Libre",
      precio: "$49.990",
      periodo: "CLP / mes",
      descripcion: "Sin limites",
      features: [
        "Productos ilimitados",
        "Todo lo del plan Pro",
        "Dominio propio",
        "Personalizacion avanzada",
        "Soporte dedicado",
      ],
      cta: "Contratar",
      destacado: false,
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/8qlick" className="flex items-center gap-3">
            <Image
              src="/logo-8qlick.png"
              alt="8qlick"
              width={400}
              height={130}
              priority
              className="h-24 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#sistemas" className="text-gray-700 hover:text-black">
              Sistemas
            </a>
            <a href="#planes" className="text-gray-700 hover:text-black">
              Planes
            </a>
            <a href="#contacto" className="text-gray-700 hover:text-black">
              Contacto
            </a>
          </nav>
          <a
            href="#contacto"
            className="bg-black text-white px-5 py-2 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Contratar
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-[0.3em] text-gray-500 mb-6 uppercase">
          Plataforma de sistemas empresariales
        </p>
        <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight leading-tight">
          Todo lo que tu negocio necesita,
          <br />
          <span className="font-semibold">en un solo lugar</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Ecommerce, agendamiento, CRM. Sistemas profesionales para pymes
          y empresas en Chile. Sin instalar nada, sin manejar servidores.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#sistemas"
            className="bg-black text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Ver sistemas
          </a>
          <a
            href="#planes"
            className="border border-gray-300 px-8 py-4 text-xs tracking-widest uppercase font-medium hover:border-black transition"
          >
            Ver planes
          </a>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium mx-auto mb-4">
              1
            </div>
            <h3 className="font-medium mb-2">Elige tus sistemas</h3>
            <p className="text-sm text-gray-600">
              Contrata solo los que necesites. Puedes activar mas cuando quieras.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium mx-auto mb-4">
              2
            </div>
            <h3 className="font-medium mb-2">Configura tu negocio</h3>
            <p className="text-sm text-gray-600">
              Personaliza tu marca, sube tu catalogo y empieza a operar.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium mx-auto mb-4">
              3
            </div>
            <h3 className="font-medium mb-2">Empieza a vender</h3>
            <p className="text-sm text-gray-600">
              Cobra con MercadoPago, despacha a todo Chile y crece.
            </p>
          </div>
        </div>
      </section>

      <section id="sistemas" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 uppercase">
            Sistemas disponibles
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Todo lo que tu negocio necesita
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Cada sistema se contrata por separado. Paga solo por lo que usas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.nombre}
              className={`border rounded-lg p-8 transition ${
                app.estado === "disponible"
                  ? "border-gray-200 hover:border-black"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="text-4xl mb-4">{app.icono}</div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-medium">{app.nombre}</h3>
                {app.estado === "disponible" ? (
                  <span className="text-[10px] tracking-widest uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Disponible
                  </span>
                ) : (
                  <span className="text-[10px] tracking-widest uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                    Proximamente
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {app.descripcion}
              </p>
              {app.estado === "disponible" ? (
                <Link
                  href={app.url}
                  className="text-xs tracking-widest uppercase font-medium text-black hover:underline"
                >
                  {app.cta} -
                </Link>
              ) : (
                <span className="text-xs tracking-widest uppercase font-medium text-gray-400">
                  {app.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="planes" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 uppercase">
              Planes Ecommerce
            </p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              Precios simples, sin sorpresas
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Cada sistema se cobra por separado. Si contratas mas de uno, se
              suman los valores. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {planes.map((plan) => (
              <div
                key={plan.nombre}
                className={`rounded-lg p-8 bg-white ${
                  plan.destacado
                    ? "border-2 border-black shadow-lg relative"
                    : "border border-gray-200"
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] tracking-widest uppercase px-3 py-1 rounded">
                    Recomendado
                  </span>
                )}
                <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">
                  {plan.nombre}
                </p>
                <p className="text-xs text-gray-400 mb-4">{plan.descripcion}</p>
                <p className="text-4xl font-light mb-1">{plan.precio}</p>
                <p className="text-xs text-gray-500 mb-6">{plan.periodo}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">-</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className={`block w-full text-center py-3 text-xs tracking-widest uppercase font-medium transition ${
                    plan.destacado
                      ? "bg-black text-white hover:bg-gray-800"
                      : "border border-gray-300 hover:border-black"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 mt-8">
            Los precios no incluyen IVA. Facturacion mensual.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Por que elegir 8qlick
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-medium mb-3">Todo en uno</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              No necesitas 5 sistemas diferentes. Todos nuestros modulos se
              integran entre si y comparten datos.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Hecho en Chile</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Precios en CLP, soporte en espanol, integrado con MercadoPago,
              SII y las 16 regiones del pais.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Sin instalar nada</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Todo funciona en la nube. No necesitas servidores, backups ni
              personal tecnico. Nosotros nos encargamos.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Pago seguro</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pagos procesados por MercadoPago. Acepta tarjetas, transferencias
              y efectivo.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Crece con tu negocio</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Empieza con el plan Inicial y escala cuando lo necesites. Sin
              contratos largos, sin penalizaciones.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Soporte real</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Personas reales atendiendo por WhatsApp y email. Respuesta en
              menos de 24 horas habiles.
            </p>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-black text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Listo para digitalizar tu negocio?
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            Cuentanos que necesitas y te ayudamos a elegir los sistemas
            adecuados. Sin compromiso.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:contacto@8qlick.com"
              className="bg-white text-black px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-gray-200 transition"
            >
              contacto@8qlick.com
            </a>
            <a
              href="https://wa.me/56995741590"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-black transition"
            >
              WhatsApp
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-10">
            Lun-Vie 9:00-18:00 - Talagante, Chile
          </p>
        </div>
      </section>

      <footer className="bg-black text-white border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>2026 8qlick - Todos los derechos reservados</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition">
              Ver tienda demo
            </Link>
            <a href="#contacto" className="hover:text-white transition">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
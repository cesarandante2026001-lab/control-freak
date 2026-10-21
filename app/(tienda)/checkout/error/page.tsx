import Link from "next/link"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const params = await searchParams
  const orderId = params.order

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b91c1c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <h1 className="text-3xl font-light mb-3">El pago no se completó</h1>
        <p className="text-sm text-gray-500 mb-8">
          Hubo un problema con tu pago. Puedes intentarlo nuevamente o elegir otro
          método de pago.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/carrito"
            className="inline-block px-8 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Volver al carrito
          </Link>
          <Link
            href="/productos"
            className="inline-block px-8 py-4 border border-gray-300 text-xs tracking-widest uppercase font-medium hover:bg-gray-50 transition"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  )
}
"use client"

import Link from "next/link"
import { useState } from "react"

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setEnviando(true)

    const res = await fetch("/api/usuario/olvide-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    setEnviando(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al procesar")
      return
    }

    setEnviado(true)
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-light mb-3">Revisa tu correo</h1>
          <p className="text-sm text-gray-500 mb-8">
            Si el email existe, te enviamos un link para restablecer tu contraseña.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            <strong>Modo desarrollo:</strong> como no hay envío de emails todavía,
            el link aparece en la consola donde corre <code>npm run dev</code>.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Volver al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Olvidé mi contraseña</h1>
        <p className="text-sm text-gray-500 mb-10">
          Ingresa tu email y te enviaremos un link para restablecerla.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full px-6 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar link"}
          </button>

          <Link
            href="/login"
            className="block text-center text-xs text-gray-500 hover:text-black"
          >
            Volver al login
          </Link>
        </form>
      </div>
    </main>
  )
}
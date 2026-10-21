"use client"

import Link from "next/link"
import { useState } from "react"

export default function CambiarPasswordClient() {
  const [actual, setActual] = useState("")
  const [nueva, setNueva] = useState("")
  const [repetir, setRepetir] = useState("")
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [guardando, setGuardando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setOk("")

    if (nueva !== repetir) {
      setError("Las contraseñas nuevas no coinciden")
      return
    }

    setGuardando(true)

    const res = await fetch("/api/usuario/cambiar-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva }),
    })

    const data = await res.json()
    setGuardando(false)

    if (!res.ok) {
      setError(data.error || "Error al cambiar contraseña")
      return
    }

    setOk("Contraseña cambiada correctamente")
    setActual("")
    setNueva("")
    setRepetir("")
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-12">
        <Link
          href="/mi-cuenta"
          className="inline-block text-xs tracking-widest uppercase text-gray-500 hover:text-black mb-6"
        >
          ← Volver a mi cuenta
        </Link>

        <h1 className="text-3xl font-light mb-2">Cambiar contraseña</h1>
        <p className="text-sm text-gray-500 mb-10">
          Mínimo 8 caracteres, una mayúscula y un número.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Contraseña actual *
            </label>
            <input
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Contraseña nueva *
            </label>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Repetir contraseña nueva *
            </label>
            <input
              type="password"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
              {error}
            </div>
          )}
          {ok && (
            <div className="text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
              {ok}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full px-6 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {guardando ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </main>
  )
}
"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"

function RecuperarForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") ?? ""

  const [nueva, setNueva] = useState("")
  const [repetir, setRepetir] = useState("")
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Falta el token. Usa el link que te enviamos.")
      return
    }

    if (nueva !== repetir) {
      setError("Las contraseñas no coinciden")
      return
    }

    setGuardando(true)

    const res = await fetch("/api/usuario/recuperar-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, passwordNueva: nueva }),
    })

    const data = await res.json()
    setGuardando(false)

    if (!res.ok) {
      setError(data.error || "Error al restablecer")
      return
    }

    setOk(true)
    setTimeout(() => router.push("/login"), 2500)
  }

  if (ok) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-light mb-3">Contraseña actualizada</h1>
          <p className="text-sm text-gray-500 mb-6">
            Ya puedes ingresar con tu nueva contraseña.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition"
          >
            Ir al login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-3xl font-light mb-2">Nueva contraseña</h1>
        <p className="text-sm text-gray-500 mb-10">
          Mínimo 8 caracteres, una mayúscula y un número.
        </p>

        <form onSubmit={submit} className="space-y-5">
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
              Repetir contraseña *
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

          <button
            type="submit"
            disabled={guardando}
            className="w-full px-6 py-4 bg-black text-white text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function RecuperarPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>}>
      <RecuperarForm />
    </Suspense>
  )
}
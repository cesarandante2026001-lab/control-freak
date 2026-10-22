"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrarse")
        setLoading(false)
        return
      }

      router.push("/login")
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-tight mb-2">
            Crear cuenta
          </h1>
          <p className="text-sm text-gray-500">
            Únete a control-freak
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 transition"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 transition"
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-black outline-none text-gray-900 transition"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </main>
  )
}
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email } })

    // Respuesta siempre OK (por seguridad, no revelar si existe)
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString("hex")
    const expira = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: { token, expira },
      create: { userId: user.id, token, expira },
    })

    // TODO: enviar email con el link /recuperar-password?token=XXX
    console.log("===========================================")
    console.log("LINK DE RECUPERACION (copiar y pegar):")
    console.log(`http://localhost:3000/recuperar-password?token=${token}`)
    console.log("===========================================")

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Email inválido" },
        { status: 400 }
      )
    }
    console.error("Error olvide password:", error)
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 })
  }
}
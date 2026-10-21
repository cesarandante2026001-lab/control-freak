import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  token: z.string().min(1),
  passwordNueva: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const reset = await prisma.passwordReset.findUnique({
      where: { token: data.token },
    })

    if (!reset || reset.expira < new Date()) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      )
    }

    const nuevoHash = await bcrypt.hash(data.passwordNueva, 10)

    await prisma.user.update({
      where: { id: reset.userId },
      data: { password: nuevoHash },
    })

    await prisma.passwordReset.delete({ where: { token: data.token } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      )
    }
    console.error("Error recuperar password:", error)
    return NextResponse.json({ error: "Error al recuperar" }, { status: 500 })
  }
}
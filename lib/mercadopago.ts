import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("Falta MP_ACCESS_TOKEN en .env")
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

export const mpPreference = new Preference(mpClient)
export const mpPayment = new Payment(mpClient)
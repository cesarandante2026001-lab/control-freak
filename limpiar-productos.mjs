import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Borrando todos los productos y variantes...")

  // 1. Borrar OrderItems (por si hay órdenes con estos productos)
  const orderItems = await prisma.orderItem.deleteMany({})
  console.log(`OrderItems borrados: ${orderItems.count}`)

  // 2. Borrar CartItems
  const cartItems = await prisma.cartItem.deleteMany({})
  console.log(`CartItems borrados: ${cartItems.count}`)

  // 3. Borrar Variants
  const variants = await prisma.productVariant.deleteMany({})
  console.log(`Variantes borradas: ${variants.count}`)

  // 4. Borrar Products
  const products = await prisma.product.deleteMany({})
  console.log(`Productos borrados: ${products.count}`)

  // 5. Borrar Orders (opcional, para limpiar pruebas)
  const orders = await prisma.order.deleteMany({})
  console.log(`Órdenes borradas: ${orders.count}`)

  console.log("Listo. Base limpia.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
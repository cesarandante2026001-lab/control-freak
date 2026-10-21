import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"
import type { UserRole } from "@prisma/client"

const f = createUploadthing()

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "OWNER", "ADMIN"]

export const ourFileRouter = {
  productImage: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("No autenticado")

      const user = session.user as { id?: string; role?: UserRole }
      if (!user.role || !ADMIN_ROLES.includes(user.role)) {
        throw new Error("Solo admin puede subir imágenes de productos")
      }

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
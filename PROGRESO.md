# 8doce — Ecommerce (Progreso)

## Stack
- Next.js 16.4.0 (Turbopack) + TypeScript
- Prisma 7.10.0 + PostgreSQL (Neon)
- Auth: NextAuth v5 (credentials)
- UI: Tailwind
- Uploads: UploadThing v7
- Pagos: MercadoPago (Checkout Pro, modo test)

## Visión de plataforma
- 8qlick = empresa de sistemas. Vende apps verticales a terceros (SaaS)
- App 1: ECOMMERCE (MVP completo, modo test, listo para producción)
- App 2: BOOKINGS / Agendamientos (pendiente)
- Otros sistemas futuros: Clínicas, Hoteles, Restaurantes, Gimnasios, CRM+IA, Almacenes, Compras, etc.
- Modelo planeado: Tenant = negocio; TenantApp = apps activas por negocio
- Cada tenant tendrá su propia home institucional + páginas legales

## Estado actual
Fecha: 2026-10-10

### Hecho (núcleo ecommerce) ✅
- Schema Prisma completo: User, PasswordReset, Category, Product,
  ProductVariant, CartItem, ShippingRate, Setting, SiteConfig,
  SiteContent, Page, Order, OrderItem
- Enum UserRole (SUPERADMIN / OWNER / ADMIN / CUSTOMER)
- Enum CategoryKind con variantes por edad/tipo
- Category.attributes (Json) personalizables
- Category.showInNavbar + Category.active
- Product.variantImages (Json) para asociar fotos a variantes
- ProductVariant.imageUrl
- Home editorial con secciones dinámicas (SiteContent + SiteConfig):
  Hero, Categorías, Banner CTA, Destacados, Sobre nosotros,
  Cómo comprar (con descripciones), Beneficios, Newsletter

### Hecho (carrito + checkout + pago) ✅
- Carrito completo con tabla CartItem
- Contador en navbar con actualización en vivo
- Página /carrito con items, cantidades, eliminar, total
- Envío gratis sobre umbral configurable
- Página /checkout con formulario de envío
- Selección de región desde tabla ShippingRate (16 regiones)
- Cálculo de envío automático según región + umbral
- Páginas /checkout/exito, /checkout/error, /checkout/pendiente
- Webhook /api/webhooks/mercadopago
- Integración MercadoPago Checkout Pro (test)

### Hecho (admin) ✅
- /admin (índice con tarjetas)
- /admin/ordenes (lista con filtros por estado)
- /admin/ordenes/[id] (detalle con cambio de estado + tracking)
- /admin/categorias (CRUD + editor de atributos + "Cargar sugeridas")
- /admin/productos (lista con botón eliminar + stock editable)
- /admin/productos/nuevo (atributos dinámicos + múltiples fotos + asociación a color)
- /admin/envios (precios por región + umbral)
- /admin/contenido (editar textos del home, datos de tienda, imágenes)
- UploadThing (múltiples fotos, hasta 10)
- Registro: email en ADMIN_EMAILS → SUPERADMIN
- /admin/* protegido

### Hecho (cuenta de usuario) ✅
- /mi-cuenta (ver pedidos + editar datos)
- /mi-cuenta/cambiar-password
- /olvide-password (solicitud de link)
- /recuperar-password?token=XXX (nueva contraseña)
- Link "¿Olvidaste tu contraseña?" en el login
- Validación: mínimo 8 caracteres, 1 mayúscula, 1 número
- En modo dev: el link de recuperación aparece en la consola de npm run dev

### Hecho (galería visual) ✅
- Galería tipo Amazon en /producto/[slug]
- Miniaturas verticales clickeables
- Cambio automático al elegir color
- Cambio al pinchar miniatura
- Imagen por variante (ProductVariant.imageUrl)

### Hecho (páginas institucionales) ✅
- Carpeta /Institucional con 8 archivos .md (textos base):
  sobre-nosotros, como-comprar, envios, devoluciones,
  preguntas-frecuentes, terminos, privacidad, contacto
- Seed-paginas.mjs carga los .md a la tabla Page
- /p/[slug] renderiza markdown con placeholders
- /sobre-nosotros, /terminos, etc. redirigen a /p/...

### Hecho (sistema de contenido) ✅
- SiteConfig: datos globales de la tienda (nombre, email, WhatsApp, etc.)
- SiteContent: textos editables con placeholders {{...}}
- Admin /admin/contenido para editar textos e imágenes

### Categorías actuales
| Orden | Slug | Nombre | Tipo | Activa | Navbar |
|-------|------|--------|------|--------|--------|
| 1 | hombre | Hombre | Ropa adulto | Sí | Sí |
| 2 | mujer | Mujer | Ropa adulto | Sí | Sí |
| 3 | nino | Niño | Ropa niño/a | Sí | Sí |
| 4 | nina | Niña | Ropa niño/a | Sí | Sí |
| 5 | perfumes | Perfumes | Perfume | Sí | No |
| 6 | ebook | eBooks | Digital | Sí | No |
| 7 | electronica | Electrónicos | Electrónica | Sí | No |
| 8 | zapatos | Zapatos Adultos | Zapatos adulto | Sí | No |

### Regiones con envío
16 regiones de Chile, precios editables desde /admin/envios
Umbral de envío gratis: configurable (por defecto $50.000)

### Configuración
- .env → ADMIN_EMAILS=cesar@8doce.cl
- .env → MP_ACCESS_TOKEN, MP_PUBLIC_KEY (test)
- SUPERADMIN activo: cesar@8doce.cl
- Store name: 8doce
- Email: info.8doce@gmail.com
- Dirección: Talagante, Región Metropolitana, Chile

### Credenciales MercadoPago (test)
- App: 8doce Ecommerce
- Seller Test User: test_user_8800981642824537...
- Buyer Test User: test_user_466536765195264...
- Tarjetas: Visa 4168 8188 4444 7115 / Mastercard 5416 7526 0258 2580

### Flujo completo probado ✅
1. Cliente entra al home institucional
2. Ve categorías, destacados, cómo comprar
3. Entra al catálogo, elige producto
4. Cambia color → cambia foto
5. Agrega al carrito
6. Va al carrito, ajusta cantidades
7. Va al checkout, llena datos + elige región
8. Click "Pagar con MercadoPago" → redirige a MP
9. Paga con tarjeta de prueba
10. MP redirige a /checkout/exito
11. Orden se marca como "paid" automáticamente
12. Admin la ve en /admin/ordenes
13. Admin cambia estado a "shipped" + tracking
14. Admin cambia estado a "delivered"

### Problemas conocidos
- ⚠️ Rotar password Neon + token UploadThing + credenciales MP antes de producción
- ⚠️ Multi-tenant no implementado (Tenant + TenantApp)
- ⚠️ Sin notificaciones por email (compra, envío, recuperación)
- ⚠️ Sin admin /admin/paginas (falta UI para editar los .md)
- ⚠️ Footer básico sin links a páginas institucionales
- ⚠️ Sin filtros de historial en admin de productos
- ⚠️ Sin KPIs/dashboard en admin
- ⚠️ Sin sistema de banners promocionales (carrusel)

### Próximos pasos
1. [ ] Footer completo con links a páginas institucionales
2. [ ] Admin /admin/paginas (editar los .md desde UI)
3. [ ] Dashboard con KPIs en /admin (Recharts)
4. [ ] Sistema de banners promocionales (carrusel)
5. [ ] Refactor multi-tenant (Tenant + TenantApp + tenantId en todo)
6. [ ] Landing 8qlick + Signup + Billing
7. [ ] Módulo BOOKINGS / Agendamientos
8. [ ] CRM con IA
9. [ ] Otros sistemas (clínicas, hoteles, restaurantes, etc.)

## Comandos útiles
- npm run dev
- npx prisma studio
- npx prisma migrate status
- npx prisma generate
- node seed-envios.mjs
- node seed-paginas.mjs
- node seed-contenido.mjs
- node actualizar-config.mjs

## Scripts de mantenimiento
- migrar-kinds.mjs
- marcar-navbar.mjs
- seed-envios.mjs
- seed-contenido.mjs
- seed-paginas.mjs
- seed-como-comprar.mjs
- actualizar-config.mjs
- fix-direccion.mjs
- fix-faq.mjs

## Pendiente de seguridad importante 🔴
- [ ] Cambio de contraseña (HECHO en 8doce, falta en RETROLOG)
- [ ] Rotar credenciales expuestas

## Banners promocionales (pendiente)
Cuando se implemente:
- Modelo Banner con: title, subtitle, imageUrl, linkUrl, linkText, order, active, startDate, endDate
- Admin /admin/banners para crear/editar
- Carrusel en home (debajo del navbar) tipo Paris/Amazon
- Rotación automática cada 5 segundos + flechas manuales
- Dimensiones de imagen: ancho 1920px, alto 600-800px, máximo 500KB
## IMPORTANTE: BD compartida entre desarrollo y produccion
- Desarrollo (localhost) y Produccion (8doce.vercel.app) usan LA MISMA BD de Neon
- Efecto: si agregas algo al carrito en produccion, aparece tambien en desarrollo
  (porque ambos apuntan al mismo DATABASE_URL y usan el mismo usuario)
- NO es un bug, es comportamiento esperado mientras se use 1 sola BD
- PROS: una sola fuente de datos, no hay que mantener 2 BDs
- CONTRAS: desarrollo toca datos reales de produccion
- RECOMENDACION: dejarlo asi por ahora. Cuando haya clientes reales,
  crear una BD separada para desarrollo en Neon y cambiar el DATABASE_URL local

## Pendientes concretos (definidos 2026-10-17)

### BUG 1: Flete se desmarca pero igual se cobra
- En /carrito o /checkout hay un checkbox de envio
- Al desmarcarlo, el total sigue incluyendo el costo de envio
- Revisar: logica del calculo de total en carrito y checkout
- Archivos probables: app/carrito/page.tsx, app/checkout/page.tsx,
  lib/cart.ts o similar, y el endpoint que calcula totales

### BUG 2: Verificar que compra rebaje stock
- Hacer una compra de prueba
- Verificar que ProductVariant.stock baje
- Si no baja: revisar webhook /api/webhooks/mercadopago
  y endpoint de creacion de orden

### Otros pendientes (heredados del PROGRESO viejo)
1. [ ] Footer completo con links a paginas institucionales
2. [ ] Admin /admin/paginas (editar los .md desde UI)
3. [ ] Dashboard con KPIs en /admin
4. [ ] Sistema de banners promocionales (carrusel)
5. [ ] Pagina principal de 8qlick (esta dentro de este proyecto)
6. [ ] Refactor multi-tenant (DESCARTADO: se usara 1 instalacion por cliente)

## Notas criticas
- Desarrollo y produccion usan la MISMA BD de Neon (cuidado al probar)
- Rotar credenciales antes de produccion real:
  - password Neon
  - token UploadThing
  - credenciales MercadoPago
- SUPERADMIN: cesar@8doce.cl

## Pendientes concretos (definidos 2026-10-17)

### BUG 1: Flete se desmarca pero igual se cobra
- En /carrito o /checkout hay un checkbox de envio
- Al desmarcarlo, el total sigue incluyendo el costo de envio
- Revisar: logica del calculo de total en carrito y checkout
- Archivos probables: app/carrito/page.tsx, app/checkout/page.tsx,
  lib/cart.ts o similar, y el endpoint que calcula totales

### BUG 2: Verificar que compra rebaje stock
- Hacer una compra de prueba
- Verificar que ProductVariant.stock baje
- Si no baja: revisar webhook /api/webhooks/mercadopago
  y endpoint de creacion de orden

### Otros pendientes (heredados del PROGRESO viejo)
1. [ ] Footer completo con links a paginas institucionales
2. [ ] Admin /admin/paginas (editar los .md desde UI)
3. [ ] Dashboard con KPIs en /admin
4. [ ] Sistema de banners promocionales (carrusel)
5. [ ] Pagina principal de 8qlick (esta dentro de este proyecto)
6. [ ] Refactor multi-tenant (DESCARTADO: se usara 1 instalacion por cliente)

## Notas criticas
- Desarrollo y produccion usan la MISMA BD de Neon (cuidado al probar)
- Rotar credenciales antes de produccion real:
  - password Neon
  - token UploadThing
  - credenciales MercadoPago
- SUPERADMIN: cesar@8doce.cl

### Pendientes 8Doce (20-Oct-2026)
- **REBAJA DE STOCK:** Verificar e implementar la reducci�n de stock (decrement) en el backend (Webhook de MercadoPago) al confirmar la compra exitosa.
- **Flete en el carrito:** El carrito ya no asume regi�n. Debe mostrar "Env�o a calcular" o seleccionar regi�n.

## Actualizacion 8Doce - 21 de Octubre 2026
- **Logica de envios:** Se cambio el modelo de envios de "por region" a "por comuna".
- **Base de datos:** Se limpio la tabla ShippingRate y se cargaron las primeras 51 comunas.
- **Admin de envios:** Se creo el CRUD completo (crear, leer, actualizar, eliminar) de comunas.
- **Checkout:** El selector de comuna ahora depende de la region elegida. Se agrego boton para guardar la direccion en el perfil.
- **Mi Cuenta:** Se agregaron los campos de Region y Comuna para que el usuario actualice sus datos.
- **Stock:** La logica de rebaja de stock ya esta programada en el Webhook de MercadoPago.
- **Pendiente:** Probar el pago real con las credenciales de produccion de MercadoPago para verificar que el webhook baje el stock y envie el correo.

## CIERRE DE FASE DE DESARROLLO (21-Oct-2026)
- Proyecto 8Doce terminado y estable.
- Base de datos sincronizada (Regi�n + Comuna).
- CRUD de env�os operativo en el panel de admin.
- Pre-carga de datos desde "Mi Cuenta" al Checkout funcionando.
- Respaldos .bak eliminados.
- PENDIENTE: Prueba de pago real (MercadoPago) para validar Webhook (Stock y Correo).

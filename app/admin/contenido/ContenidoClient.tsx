"use client"

import { useState } from "react"
import { UploadDropzone } from "@/lib/uploadthing"

type Tab = "config" | "home" | "imagenes"

export default function ContenidoClient({
  initialConfig,
  initialContent,
}: {
  initialConfig: Record<string, string>
  initialContent: Record<string, string>
}) {
  const [tab, setTab] = useState<Tab>("config")
  const [config, setConfig] = useState(initialConfig)
  const [content, setContent] = useState(initialContent)
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState("")

  async function guardar() {
    setGuardando(true)
    setOk("")
    const res = await fetch("/api/admin/contenido", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, content }),
    })
    setGuardando(false)
    if (res.ok) {
      setOk("Cambios guardados. Refresca el home para ver los cambios.")
      setTimeout(() => setOk(""), 4000)
    }
  }

  function setC(key: string, valor: string) {
    setConfig((prev) => ({ ...prev, [key]: valor }))
  }

  function setCt(key: string, valor: string) {
    setContent((prev) => ({ ...prev, [key]: valor }))
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-light mb-1">Contenido del sitio</h1>
            <p className="text-sm text-gray-500">
              Edita los textos, datos de contacto e imágenes de tu tienda.
            </p>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-gray-800 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {ok && (
          <div className="mb-6 text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
            {ok}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-8">
          {[
            { id: "config", label: "Datos de la tienda" },
            { id: "home", label: "Textos del home" },
            { id: "imagenes", label: "Imágenes" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`text-xs tracking-widest uppercase py-3 px-4 border-b-2 transition ${
                tab === t.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONFIG */}
        {tab === "config" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo
                label="Nombre de la tienda"
                valor={config.storeName ?? ""}
                onChange={(v) => setC("storeName", v)}
                placeholder="control-freak"
              />
              <Campo
                label="Año de fundación"
                valor={config.yearFounded ?? ""}
                onChange={(v) => setC("yearFounded", v)}
                placeholder="2026"
              />
              <Campo
                label="País"
                valor={config.country ?? ""}
                onChange={(v) => setC("country", v)}
                placeholder="Chile"
              />
              <Campo
                label="Eslogan"
                valor={config.slogan ?? ""}
                onChange={(v) => setC("slogan", v)}
                placeholder="Ropa para todos"
              />
              <Campo
                label="Qué vendes (categoría)"
                valor={config.categoryLabel ?? ""}
                onChange={(v) => setC("categoryLabel", v)}
                placeholder="ropa, electrónica, comida, etc."
              />
              <Campo
                label="Email de contacto"
                valor={config.email ?? ""}
                onChange={(v) => setC("email", v)}
                placeholder="info.control-freak@gmail.com"
              />
              <Campo
                label="Teléfono"
                valor={config.phone ?? ""}
                onChange={(v) => setC("phone", v)}
                placeholder="+56 9 XXXX XXXX"
              />
              <Campo
                label="WhatsApp"
                valor={config.whatsapp ?? ""}
                onChange={(v) => setC("whatsapp", v)}
                placeholder="+56 9 XXXX XXXX"
              />
            </div>
            <Campo
              label="Dirección"
              valor={config.address ?? ""}
              onChange={(v) => setC("address", v)}
              placeholder="Talagante, Región Metropolitana, Chile"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo
                label="Instagram (URL)"
                valor={config.instagram ?? ""}
                onChange={(v) => setC("instagram", v)}
                placeholder="https://instagram.com/..."
              />
              <Campo
                label="Facebook (URL)"
                valor={config.facebook ?? ""}
                onChange={(v) => setC("facebook", v)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        )}

        {/* HOME */}
        {tab === "home" && (
          <div className="space-y-5">
            <p className="text-xs text-gray-500">
              Puedes usar variables como{" "}
              <code className="bg-gray-100 px-1">{"{{storeName}}"}</code>,{" "}
              <code className="bg-gray-100 px-1">{"{{country}}"}</code>,{" "}
              <code className="bg-gray-100 px-1">{"{{yearFounded}}"}</code>,{" "}
              <code className="bg-gray-100 px-1">{"{{categoryLabel}}"}</code>,{" "}
              <code className="bg-gray-100 px-1">{"{{email}}"}</code>,{" "}
              <code className="bg-gray-100 px-1">{"{{whatsapp}}"}</code>.
            </p>

            <h3 className="text-sm font-medium pt-4">Hero</h3>
            <Campo
              label="Etiqueta superior"
              valor={content["home.hero.eyebrow"] ?? ""}
              onChange={(v) => setCt("home.hero.eyebrow", v)}
              placeholder="NUEVA COLECCIÓN"
            />
            <Campo
              label="Título"
              valor={content["home.hero.title"] ?? ""}
              onChange={(v) => setCt("home.hero.title", v)}
              placeholder="{{slogan}}"
            />
            <Campo
              label="Subtítulo"
              valor={content["home.hero.subtitle"] ?? ""}
              onChange={(v) => setCt("home.hero.subtitle", v)}
              textarea
            />
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Texto del botón"
                valor={content["home.hero.ctaText"] ?? ""}
                onChange={(v) => setCt("home.hero.ctaText", v)}
              />
              <Campo
                label="URL del botón"
                valor={content["home.hero.ctaUrl"] ?? ""}
                onChange={(v) => setCt("home.hero.ctaUrl", v)}
                placeholder="/productos"
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Categorías</h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Título"
                valor={content["home.categories.title"] ?? ""}
                onChange={(v) => setCt("home.categories.title", v)}
              />
              <Campo
                label="Subtítulo"
                valor={content["home.categories.subtitle"] ?? ""}
                onChange={(v) => setCt("home.categories.subtitle", v)}
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Banner CTA</h3>
            <Campo
              label="Título"
              valor={content["home.ctaBanner.title"] ?? ""}
              onChange={(v) => setCt("home.ctaBanner.title", v)}
            />
            <Campo
              label="Subtítulo"
              valor={content["home.ctaBanner.subtitle"] ?? ""}
              onChange={(v) => setCt("home.ctaBanner.subtitle", v)}
              textarea
            />
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Texto botón"
                valor={content["home.ctaBanner.buttonText"] ?? ""}
                onChange={(v) => setCt("home.ctaBanner.buttonText", v)}
              />
              <Campo
                label="URL botón"
                valor={content["home.ctaBanner.buttonUrl"] ?? ""}
                onChange={(v) => setCt("home.ctaBanner.buttonUrl", v)}
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Productos destacados</h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Título"
                valor={content["home.featured.title"] ?? ""}
                onChange={(v) => setCt("home.featured.title", v)}
              />
              <Campo
                label="Subtítulo"
                valor={content["home.featured.subtitle"] ?? ""}
                onChange={(v) => setCt("home.featured.subtitle", v)}
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Sobre nosotros</h3>
            <Campo
              label="Etiqueta superior"
              valor={content["home.about.eyebrow"] ?? ""}
              onChange={(v) => setCt("home.about.eyebrow", v)}
            />
            <Campo
              label="Título"
              valor={content["home.about.title"] ?? ""}
              onChange={(v) => setCt("home.about.title", v)}
            />
            <Campo
              label="Texto"
              valor={content["home.about.text"] ?? ""}
              onChange={(v) => setCt("home.about.text", v)}
              textarea
            />
            <div className="grid grid-cols-2 gap-4">
              <Campo
                label="Texto del link"
                valor={content["home.about.linkText"] ?? ""}
                onChange={(v) => setCt("home.about.linkText", v)}
              />
              <Campo
                label="URL del link"
                valor={content["home.about.linkUrl"] ?? ""}
                onChange={(v) => setCt("home.about.linkUrl", v)}
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Cómo comprar</h3>
            <Campo
              label="Título de la sección"
              valor={content["home.howto.title"] ?? ""}
              onChange={(v) => setCt("home.howto.title", v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo
                label="Paso 1"
                valor={content["home.howto.step1"] ?? ""}
                onChange={(v) => setCt("home.howto.step1", v)}
              />
              <Campo
                label="Paso 2"
                valor={content["home.howto.step2"] ?? ""}
                onChange={(v) => setCt("home.howto.step2", v)}
              />
              <Campo
                label="Paso 3"
                valor={content["home.howto.step3"] ?? ""}
                onChange={(v) => setCt("home.howto.step3", v)}
              />
              <Campo
                label="Paso 4"
                valor={content["home.howto.step4"] ?? ""}
                onChange={(v) => setCt("home.howto.step4", v)}
              />
            </div>

            <h3 className="text-sm font-medium pt-6">Beneficios</h3>
            <Campo
              label="Beneficio 1"
              valor={content["home.benefits.1"] ?? ""}
              onChange={(v) => setCt("home.benefits.1", v)}
            />
            <Campo
              label="Beneficio 2"
              valor={content["home.benefits.2"] ?? ""}
              onChange={(v) => setCt("home.benefits.2", v)}
            />
            <Campo
              label="Beneficio 3"
              valor={content["home.benefits.3"] ?? ""}
              onChange={(v) => setCt("home.benefits.3", v)}
            />

            <h3 className="text-sm font-medium pt-6">Newsletter</h3>
            <Campo
              label="Título"
              valor={content["home.newsletter.title"] ?? ""}
              onChange={(v) => setCt("home.newsletter.title", v)}
            />
            <Campo
              label="Subtítulo"
              valor={content["home.newsletter.subtitle"] ?? ""}
              onChange={(v) => setCt("home.newsletter.subtitle", v)}
              textarea
            />
            <Campo
              label="Texto del botón"
              valor={content["home.newsletter.buttonText"] ?? ""}
              onChange={(v) => setCt("home.newsletter.buttonText", v)}
            />
          </div>
        )}

        {/* IMAGENES */}
        {tab === "imagenes" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium mb-2">Imagen de "Sobre nosotros"</h3>
              <p className="text-xs text-gray-500 mb-4">
                Se muestra en la sección Sobre nosotros del home. Recomendado: 1024x1024 px, menos de 2 MB.
              </p>

              {content["home.about.imageUrl"] ? (
                <div className="flex items-center gap-4">
                  <img
                    src={content["home.about.imageUrl"]}
                    alt="Sobre nosotros"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setCt("home.about.imageUrl", "")}
                    className="text-xs text-red-600 underline"
                  >
                    Quitar imagen
                  </button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="productImage"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.ufsUrl) {
                      setCt("home.about.imageUrl", res[0].ufsUrl)
                    }
                  }}
                  appearance={{
                    container:
                      "border-2 border-dashed border-gray-300 bg-white rounded-md p-6 ut-uploading:opacity-50",
                    button:
                      "bg-black text-white text-xs tracking-widest uppercase px-6 py-3 rounded-md hover:bg-gray-800",
                    allowedContent: "text-xs text-gray-400",
                    label: "text-sm text-gray-600 hover:text-black",
                  }}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-gray-800 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar todos los cambios"}
          </button>
        </div>
      </div>
    </main>
  )
}

function Campo({
  label,
  valor,
  onChange,
  placeholder,
  textarea,
}: {
  label: string
  valor: string
  onChange: (v: string) => void
  placeholder?: string
  textarea?: boolean
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-gray-500 mb-2">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black outline-none text-sm resize-none"
        />
      ) : (
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-black outline-none text-sm"
        />
      )}
    </div>
  )
}
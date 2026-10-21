// Renderizador de markdown minimalista (sin dependencias)
// Soporta: # ## ###, **bold**, *italic*, [link](url), tablas, listas, párrafos

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function reemplazarPlaceholders(texto: string, valores: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, key) => valores[key] ?? `{{${key}}}`)
}

function renderInline(texto: string): string {
  // Escapar HTML primero
  let html = escapeHTML(texto)

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

  // Italic *text*
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-black underline hover:text-gray-600">$1</a>'
  )

  return html
}

export function renderMarkdown(
  markdown: string,
  placeholders: Record<string, string> = {}
): string {
  const texto = reemplazarPlaceholders(markdown, placeholders)
  const lineas = texto.split("\n")
  const salida: string[] = []

  let enLista = false
  let enTabla = false
  let tablaFilas: string[][] = []

  function cerrarLista() {
    if (enLista) {
      salida.push("</ul>")
      enLista = false
    }
  }

  function cerrarTabla() {
    if (enTabla && tablaFilas.length > 0) {
      const header = tablaFilas[0]
      const rows = tablaFilas.slice(1)
      salida.push(
        '<div class="overflow-x-auto my-6"><table class="w-full text-sm border-collapse">'
      )
      salida.push("<thead><tr>")
      for (const h of header) {
        salida.push(
          `<th class="text-left py-2 px-3 border-b border-gray-200 text-xs tracking-widest uppercase text-gray-500">${renderInline(
            h
          )}</th>`
        )
      }
      salida.push("</tr></thead><tbody>")
      for (const row of rows) {
        salida.push("<tr>")
        for (const cell of row) {
          salida.push(
            `<td class="py-2 px-3 border-b border-gray-100">${renderInline(cell)}</td>`
          )
        }
        salida.push("</tr>")
      }
      salida.push("</tbody></table></div>")
      tablaFilas = []
      enTabla = false
    }
  }

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i]
    const lineaTrim = linea.trim()

    // Tabla: | col | col |
    if (lineaTrim.startsWith("|") && lineaTrim.endsWith("|")) {
      const celdas = lineaTrim
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim())

      // Ignorar la línea separadora |---|---|
      if (celdas.every((c) => /^-+$/.test(c))) {
        continue
      }

      if (!enTabla) {
        enTabla = true
        cerrarLista()
      }
      tablaFilas.push(celdas)
      continue
    } else if (enTabla) {
      cerrarTabla()
    }

    // Encabezados
    if (lineaTrim.startsWith("### ")) {
      cerrarLista()
      salida.push(
        `<h3 class="text-lg font-medium mt-8 mb-3">${renderInline(lineaTrim.slice(4))}</h3>`
      )
      continue
    }
    if (lineaTrim.startsWith("## ")) {
      cerrarLista()
      salida.push(
        `<h2 class="text-2xl font-light mt-10 mb-4 tracking-tight">${renderInline(
          lineaTrim.slice(3)
        )}</h2>`
      )
      continue
    }
    if (lineaTrim.startsWith("# ")) {
      cerrarLista()
      salida.push(
        `<h1 class="text-4xl font-light mb-6 tracking-tight">${renderInline(
          lineaTrim.slice(2)
        )}</h1>`
      )
      continue
    }

    // Lista - item
    if (lineaTrim.startsWith("- ")) {
      if (!enLista) {
        salida.push('<ul class="list-disc pl-6 my-4 space-y-1">')
        enLista = true
      }
      salida.push(`<li>${renderInline(lineaTrim.slice(2))}</li>`)
      continue
    } else if (enLista) {
      cerrarLista()
    }

    // Línea vacía
    if (lineaTrim === "") {
      continue
    }

    // Párrafo
    salida.push(
      `<p class="my-4 text-gray-700 leading-relaxed">${renderInline(lineaTrim)}</p>`
    )
  }

  cerrarLista()
  cerrarTabla()

  return salida.join("\n")
}
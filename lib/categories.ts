import type { CategoryKind } from "@prisma/client"

export type AttributeType = "select" | "text" | "number" | "color"

export type AttributeDef = {
  key: string
  label: string
  type: AttributeType
  options?: string[]
  unit?: string
  placeholder?: string
}

export type KindConfig = {
  label: string
  description: string
  attributes: AttributeDef[]
}

export const KIND_CONFIG: Record<CategoryKind, KindConfig> = {
  APPAREL_ADULT: {
    label: "Ropa adulto",
    description: "Talla S-XXL + color",
    attributes: [
      {
        key: "talla",
        label: "Talla",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL"],
        placeholder: "Ej: S, M, L",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Gris", "Beige"],
        placeholder: "Ej: Negro, Blanco",
      },
    ],
  },
  APPAREL_KIDS: {
    label: "Ropa niño/a",
    description: "Talla T2-T16 + color",
    attributes: [
      {
        key: "talla",
        label: "Talla",
        type: "select",
        options: ["T2", "T4", "T6", "T8", "T10", "T12", "T14", "T16"],
        placeholder: "Ej: T4, T6",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Rosa", "Amarillo"],
        placeholder: "Ej: Azul, Rosa",
      },
    ],
  },
  APPAREL_BABY: {
    label: "Ropa bebé",
    description: "Talla por meses",
    attributes: [
      {
        key: "talla",
        label: "Talla",
        type: "select",
        options: [
          "RN",
          "0-3m",
          "3-6m",
          "6-9m",
          "9-12m",
          "12-18m",
          "18-24m",
        ],
        placeholder: "Ej: 0-3m, 6-9m",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Blanco", "Celeste", "Rosado", "Amarillo", "Verde", "Gris"],
        placeholder: "Ej: Celeste, Rosado",
      },
    ],
  },
  SHOES_ADULT: {
    label: "Zapatos adulto",
    description: "Talla 35-46",
    attributes: [
      {
        key: "talla",
        label: "Talla",
        type: "select",
        options: [
          "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46",
        ],
        placeholder: "Ej: 38, 40",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Blanco", "Café", "Azul", "Gris", "Beige"],
        placeholder: "Ej: Negro, Café",
      },
    ],
  },
  SHOES_KIDS: {
    label: "Zapatos niño/a",
    description: "Talla 20-34",
    attributes: [
      {
        key: "talla",
        label: "Talla",
        type: "select",
        options: [
          "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
          "31", "32", "33", "34",
        ],
        placeholder: "Ej: 24, 28",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Blanco", "Azul", "Rosa", "Rojo"],
        placeholder: "Ej: Azul, Rosa",
      },
    ],
  },
  PERFUME: {
    label: "Perfume",
    description: "Contenido (ml)",
    attributes: [
      {
        key: "contenido",
        label: "Contenido",
        type: "select",
        options: ["30ML", "50ML", "100ML", "150ML", "200ML"],
        unit: "ml",
        placeholder: "Ej: 50ML, 100ML",
      },
    ],
  },
  ELECTRONICS: {
    label: "Electrónica",
    description: "Modelo + color",
    attributes: [
      {
        key: "modelo",
        label: "Modelo",
        type: "text",
        placeholder: "Ej: iPhone 15, Galaxy S24",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Blanco", "Plata", "Azul", "Dorado"],
        placeholder: "Ej: Negro, Plata",
      },
    ],
  },
  DIGITAL: {
    label: "Digital",
    description: "Sin atributos físicos",
    attributes: [],
  },
  FOOD: {
    label: "Comida",
    description: "Peso",
    attributes: [
      {
        key: "peso",
        label: "Peso",
        type: "select",
        options: ["100g", "250g", "500g", "1kg", "2kg"],
        unit: "g",
        placeholder: "Ej: 250g, 500g",
      },
    ],
  },
  ACCESSORY: {
    label: "Accesorio",
    description: "Material + color",
    attributes: [
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Ej: Acero, Cuero, Plata",
      },
      {
        key: "color",
        label: "Color",
        type: "select",
        options: ["Negro", "Plateado", "Dorado", "Blanco"],
        placeholder: "Ej: Negro, Dorado",
      },
    ],
  },
  GENERIC: {
    label: "Genérico",
    description: "Atributos libres",
    attributes: [],
  },
}

export function getAttributesForKind(kind: CategoryKind): AttributeDef[] {
  return KIND_CONFIG[kind]?.attributes ?? []
}

export function getKindLabel(kind: CategoryKind): string {
  return KIND_CONFIG[kind]?.label ?? kind
}

export function generarCombinaciones(
  values: Record<string, string[]>
): Record<string, string>[] {
  const keys = Object.keys(values).filter((k) => values[k].length > 0)
  if (keys.length === 0) return [{}]
  return keys.reduce<Record<string, string>[]>(
    (acc, key) => {
      const result: Record<string, string>[] = []
      for (const combo of acc) {
        for (const value of values[key]) {
          result.push({ ...combo, [key]: value })
        }
      }
      return result
    },
    [{}]
  )
}

export type CategoriaSugerida = {
  slug: string
  name: string
  kind: CategoryKind
  order: number
}

export const CATEGORIAS_SUGERIDAS: CategoriaSugerida[] = [
  { slug: "hombre", name: "Hombre", kind: "APPAREL_ADULT", order: 1 },
  { slug: "mujer", name: "Mujer", kind: "APPAREL_ADULT", order: 2 },
  { slug: "nino", name: "Niño", kind: "APPAREL_KIDS", order: 3 },
  { slug: "nina", name: "Niña", kind: "APPAREL_KIDS", order: 4 },
  { slug: "bebe", name: "Bebé", kind: "APPAREL_BABY", order: 5 },
  { slug: "zapatos-hombre", name: "Zapatos Hombre", kind: "SHOES_ADULT", order: 6 },
  { slug: "zapatos-mujer", name: "Zapatos Mujer", kind: "SHOES_ADULT", order: 7 },
  { slug: "zapatos-nino", name: "Zapatos Niño", kind: "SHOES_KIDS", order: 8 },
  { slug: "zapatos-bebe", name: "Zapatos Bebé", kind: "SHOES_KIDS", order: 9 },
  { slug: "perfumes", name: "Perfumes", kind: "PERFUME", order: 10 },
  { slug: "electronicos", name: "Electrónicos", kind: "ELECTRONICS", order: 11 },
  { slug: "ebooks", name: "Ebooks", kind: "DIGITAL", order: 12 },
  { slug: "accesorios", name: "Accesorios", kind: "ACCESSORY", order: 13 },
  { slug: "comida", name: "Comida", kind: "FOOD", order: 14 },
]
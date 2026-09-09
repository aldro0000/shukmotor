/**
 * Marca cada logo como claro u oscuro mirando el SVG.
 *
 * Hace falta porque hay logos blancos: sobre un chip blanco desaparecen. Los
 * que son claros van sobre chip oscuro y al revés, así se ven siempre.
 *
 * Correr con: npm run clasificar:logos
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DATA = join(process.cwd(), 'src', 'data')
const MANIFIESTO = join(DATA, 'logos-reales.json')
const LOGOS = join(process.cwd(), 'public', 'logos')

type LogoReal = { archivo: string; credito: string; licencia: string; pagina: string; fondo?: 'claro' | 'oscuro' }

if (!existsSync(MANIFIESTO)) {
  console.log('No hay logos todavía.')
  process.exit(0)
}

const manifiesto: Record<string, LogoReal> = JSON.parse(readFileSync(MANIFIESTO, 'utf8'))

/** Devuelve la luminancia media de los colores que aparecen en el SVG. */
function claridad(svg: string): number {
  const colores: number[] = []

  // #fff, #ffffff
  for (const m of svg.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)) {
    const h = m[1]
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    colores.push((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255)
  }
  // nombres frecuentes
  for (const _ of svg.matchAll(/\b(fill|stroke)\s*[:=]\s*["']?white["']?/gi)) colores.push(1)
  for (const _ of svg.matchAll(/\b(fill|stroke)\s*[:=]\s*["']?black["']?/gi)) colores.push(0)
  // rgb(255,255,255)
  for (const m of svg.matchAll(/rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/g)) {
    const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
    colores.push((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255)
  }

  // Un SVG sin colores declarados hereda currentColor: lo tratamos como oscuro.
  if (colores.length === 0) return 0
  return colores.reduce((a, c) => a + c, 0) / colores.length
}

let claros = 0
let oscuros = 0

for (const [id, l] of Object.entries(manifiesto)) {
  const ruta = join(LOGOS, l.archivo)
  if (!existsSync(ruta)) continue
  const svg = readFileSync(ruta, 'utf8')
  const c = claridad(svg)
  // Por encima de 0.7 el logo es casi blanco: necesita fondo oscuro.
  l.fondo = c > 0.7 ? 'claro' : 'oscuro'
  if (l.fondo === 'claro') {
    claros++
    console.log(`${id}: logo claro (luminancia ${c.toFixed(2)}) → chip oscuro`)
  } else {
    oscuros++
  }
}

writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
console.log(`\nLogos oscuros (chip claro): ${oscuros} · logos claros (chip oscuro): ${claros}`)

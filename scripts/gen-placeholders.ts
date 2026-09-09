/**
 * Genera placeholders SVG con la proporción correcta y nombres descriptivos
 * para fotos de modelos, miniaturas de video, imágenes de novedades y logos.
 * Correr con: npm run gen:placeholders
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { marcas } from '../src/data/marcas'
import { modelos } from '../src/data/modelos'
import { novedades } from '../src/data/novedades'

const PUBLIC = join(process.cwd(), 'public')

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Silueta muy simple de un auto para que el placeholder se lea como auto. */
function silueta(w: number, h: number, tipo: string) {
  const cx = w / 2
  const cy = h * 0.55
  const ancho = w * 0.6
  const alto = h * 0.26
  const x = cx - ancho / 2
  const y = cy - alto / 2
  const stroke = '#3A424B'
  if (tipo === 'interior' || tipo === 'tablero' || tipo === 'baul') {
    return `<rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="12" fill="none" stroke="${stroke}" stroke-width="6"/>
<line x1="${x + ancho * 0.2}" y1="${y}" x2="${x + ancho * 0.2}" y2="${y + alto}" stroke="${stroke}" stroke-width="6"/>
<line x1="${x + ancho * 0.8}" y1="${y}" x2="${x + ancho * 0.8}" y2="${y + alto}" stroke="${stroke}" stroke-width="6"/>`
  }
  if (tipo === 'frente' || tipo === 'trasera') {
    return `<rect x="${x + ancho * 0.15}" y="${y - alto * 0.5}" width="${ancho * 0.7}" height="${alto * 0.6}" rx="18" fill="none" stroke="${stroke}" stroke-width="6"/>
<rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="18" fill="none" stroke="${stroke}" stroke-width="6"/>
<circle cx="${x + ancho * 0.18}" cy="${y + alto * 0.5}" r="${alto * 0.14}" fill="${stroke}"/>
<circle cx="${x + ancho * 0.82}" cy="${y + alto * 0.5}" r="${alto * 0.14}" fill="${stroke}"/>`
  }
  const rueda = alto * 0.42
  return `<path d="M${x} ${y + alto} h${ancho} v-${alto * 0.55} h-${ancho * 0.18} l-${ancho * 0.14} -${alto * 0.45} h-${ancho * 0.36} l-${ancho * 0.14} ${alto * 0.45} h-${ancho * 0.18} z" fill="none" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/>
<circle cx="${x + ancho * 0.22}" cy="${y + alto}" r="${rueda}" fill="#171B20" stroke="${stroke}" stroke-width="6"/>
<circle cx="${x + ancho * 0.78}" cy="${y + alto}" r="${rueda}" fill="#171B20" stroke="${stroke}" stroke-width="6"/>`
}

function svg(w: number, h: number, titulo: string, sub: string, tipo: string) {
  const fs = Math.round(w / 28)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(titulo)}">
<rect width="${w}" height="${h}" fill="#171B20"/>
${silueta(w, h, tipo)}
<text x="${w / 2}" y="${h * 0.86}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fs}" font-weight="700" fill="#ECEFF2">${esc(titulo)}</text>
<text x="${w / 2}" y="${h * 0.86 + fs * 1.4}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(fs * 0.7)}" fill="#9AA3AD">${esc(sub)}</text>
</svg>
`
}

function play(w: number, h: number) {
  const r = h * 0.14
  return `<circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="#ECEFF2" opacity="0.9"/><path d="M${w / 2 - r * 0.3} ${h / 2 - r * 0.45} l${r * 0.8} ${r * 0.45} l-${r * 0.8} ${r * 0.45} z" fill="#0E1114"/>`
}

function colorDe(nombre: string) {
  // Color por hash del nombre: no codifica origen ni nada.
  let h = 0
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const hue = h % 360
  return `hsl(${hue} 55% 42%)`
}

function logo(nombre: string) {
  const partes = nombre.replace(/[&]/g, ' ').split(/[\s-]+/).filter(Boolean)
  const ini = partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : nombre.slice(0, 2).toUpperCase()
  const color = colorDe(nombre)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="${esc(nombre)}">
<circle cx="48" cy="48" r="44" fill="${color}"/>
<circle cx="48" cy="48" r="36" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="3"/>
<text x="48" y="60" text-anchor="middle" font-family="Arial Narrow, Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF">${esc(ini)}</text>
</svg>
`
}

// OJO: no borramos public/fotos. Ahí viven las fotos REALES bajadas de
// Wikimedia Commons (scripts/fetch-fotos.ts) y borrarlas sería perderlas.
// Los placeholders se sobrescriben por nombre y conviven con las reales.
mkdirSync(join(PUBLIC, 'logos'), { recursive: true })
mkdirSync(join(PUBLIC, 'fotos', 'novedades'), { recursive: true })

let n = 0
for (const marca of marcas) {
  // Escribimos SIEMPRE al nombre genérico. marca.logo puede apuntar al logo
  // real bajado de Commons y escribir ahí lo pisaría con las iniciales.
  writeFileSync(join(PUBLIC, 'logos', `${marca.slug}.svg`), logo(marca.nombre))
  n++
}

const marcaNombre = Object.fromEntries(marcas.map((m) => [m.id, m.nombre]))

for (const m of modelos) {
  const dir = join(PUBLIC, 'fotos', m.slug)
  mkdirSync(dir, { recursive: true })
  const nombre = `${marcaNombre[m.marcaId]} ${m.nombre}`
  // Solo escribimos .svg: si el modelo ya usa una foto real (.jpg), no la pisamos.
  for (const f of m.fotos) {
    if (!f.url.endsWith('.svg')) continue
    const file = f.url.replace(`/fotos/${m.slug}/`, '')
    writeFileSync(join(dir, file), svg(f.width, f.height, nombre, `${m.version} · ${f.tipo}`, f.tipo))
    n++
  }
  for (const v of m.videoReviews) {
    if (!v.miniatura.endsWith('.svg')) continue
    const file = v.miniatura.replace(`/fotos/${m.slug}/`, '')
    const body = svg(1280, 720, v.titulo, v.canal, 'perfil').replace('</svg>', `${play(1280, 720)}</svg>`)
    writeFileSync(join(dir, file), body)
    n++
  }
}

for (const nov of novedades) {
  if (!nov.imagen.endsWith('.svg')) continue
  const file = nov.imagen.replace('/fotos/novedades/', '')
  writeFileSync(join(PUBLIC, 'fotos', 'novedades', file), svg(1600, 1000, nov.categoria.toUpperCase(), nov.titulo.slice(0, 70), 'perfil'))
  n++
}

console.log(`Generados ${n} archivos SVG en public/`)

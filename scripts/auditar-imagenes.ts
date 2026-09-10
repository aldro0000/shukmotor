/**
 * Audita TODA ruta de imagen del proyecto contra los archivos que existen en
 * public/. Es la fuente de verdad de qué falta.
 *
 * Correr con: npm run auditar:imagenes
 */
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { marcas } from '../src/data/marcas'
import { modelos } from '../src/data/modelos'
import { novedades } from '../src/data/novedades'

const PUBLIC = join(process.cwd(), 'public')

export type RutaImagen = { url: string; donde: string }

/** Junta todas las rutas de imagen que la app puede llegar a renderizar. */
export function todasLasRutas(): RutaImagen[] {
  const rutas: RutaImagen[] = []
  for (const m of marcas) rutas.push({ url: m.logo, donde: `logo de ${m.nombre}` })
  for (const m of modelos) {
    for (const f of m.fotos) rutas.push({ url: f.url, donde: `foto ${f.tipo} de ${m.slug}` })
    for (const v of m.videoReviews) rutas.push({ url: v.miniatura, donde: `miniatura de video de ${m.slug}` })
  }
  for (const n of novedades) if (n.imagen) rutas.push({ url: n.imagen, donde: `imagen de nota ${n.slug}` })
  return rutas
}

/** Las variantes del srcset también tienen que existir o el navegador falla. */
function variantes(url: string): string[] {
  if (!/-720\.webp$/.test(url)) return [url]
  const base = url.replace(/-720\.webp$/, '')
  return [360, 720].map((w) => `${base}-${w}.webp`)
}

export function faltantes(): RutaImagen[] {
  const rotas: RutaImagen[] = []
  for (const r of todasLasRutas()) {
    for (const v of variantes(r.url)) {
      if (!existsSync(join(PUBLIC, v.replace(/^\//, '')))) rotas.push({ url: v, donde: r.donde })
    }
  }
  return rotas
}

if (process.argv[1]?.includes('auditar-imagenes')) {
  const todas = todasLasRutas()
  const falta = faltantes()
  const unicasFaltan = [...new Set(falta.map((f) => f.url))]

  console.log(`Rutas de imagen declaradas: ${todas.length}`)
  console.log(`Rutas rotas: ${falta.length} (${unicasFaltan.length} archivos distintos)\n`)

  const porTipo: Record<string, string[]> = {}
  for (const f of falta) {
    const tipo = f.url.startsWith('/logos/') ? 'logos' : f.url.includes('/novedades/') ? 'notas' : f.url.includes('-video-') ? 'miniaturas de video' : 'fotos de modelo'
    ;(porTipo[tipo] ??= []).push(`${f.url}  ←  ${f.donde}`)
  }
  for (const [tipo, lista] of Object.entries(porTipo)) {
    console.log(`── ${tipo}: ${lista.length}`)
    for (const l of [...new Set(lista)].slice(0, 40)) console.log(`   ${l}`)
    if (new Set(lista).size > 40) console.log(`   … y ${new Set(lista).size - 40} más`)
    console.log()
  }

  writeFileSync(join(process.cwd(), 'imagenes-rotas.txt'), unicasFaltan.join('\n'))
  console.log(`Lista completa en imagenes-rotas.txt`)
  if (falta.length) process.exit(1)
}

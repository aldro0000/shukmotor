/**
 * Saca de los manifiestos toda entrada cuyo archivo no exista en public/.
 *
 * Es la red de seguridad contra el bug que ya nos pasó: un script escribe sobre
 * un archivo real, o una descarga queda a medias, y el manifiesto sigue
 * apuntando a algo que no está. Con esto, lo que el manifiesto declara siempre
 * existe, y la app nunca renderiza un <img> a la nada.
 *
 * Correr con: npm run sanear
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')

let quitadas = 0

// ---- Fotos de modelos -------------------------------------------------------
const rutaFotos = join(DATA, 'fotos-reales.json')
if (existsSync(rutaFotos)) {
  const fotos: Record<string, { archivo: string }[]> = JSON.parse(readFileSync(rutaFotos, 'utf8'))
  for (const [slug, lista] of Object.entries(fotos)) {
    const vivas = lista.filter((f) => existsSync(join(PUBLIC, 'fotos', slug, f.archivo)))
    quitadas += lista.length - vivas.length
    fotos[slug] = vivas
  }
  writeFileSync(rutaFotos, JSON.stringify(fotos, null, 2))
}

// ---- Logos ------------------------------------------------------------------
const rutaLogos = join(DATA, 'logos-reales.json')
if (existsSync(rutaLogos)) {
  const logos: Record<string, { archivo: string }> = JSON.parse(readFileSync(rutaLogos, 'utf8'))
  for (const [id, l] of Object.entries(logos)) {
    if (!existsSync(join(PUBLIC, 'logos', l.archivo))) {
      delete logos[id]
      quitadas++
    }
  }
  writeFileSync(rutaLogos, JSON.stringify(logos, null, 2))
}

// ---- Imágenes de notas ------------------------------------------------------
const rutaNotas = join(DATA, 'fotos-novedades.json')
if (existsSync(rutaNotas)) {
  const notas: Record<string, { archivo: string }> = JSON.parse(readFileSync(rutaNotas, 'utf8'))
  for (const [slug, n] of Object.entries(notas)) {
    if (!existsSync(join(PUBLIC, 'fotos', 'novedades', n.archivo))) {
      delete notas[slug]
      quitadas++
    }
  }
  writeFileSync(rutaNotas, JSON.stringify(notas, null, 2))
}

console.log(quitadas === 0 ? 'Manifiestos sanos: nada que quitar.' : `Quitadas ${quitadas} entradas que apuntaban a archivos inexistentes.`)

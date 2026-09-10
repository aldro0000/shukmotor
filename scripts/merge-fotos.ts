/**
 * Junta los manifiestos de fotos de todos los procesos paralelos en
 * src/data/fotos-reales.json, que es el que lee la app.
 *
 * Correr con: npm run merge:fotos
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { modelosBase } from '../src/data/modelos-base'

const DATA = join(process.cwd(), 'src', 'data')
const DESTINO = join(DATA, 'fotos-reales.json')
const FOTOS = join(process.cwd(), 'public', 'fotos')

/** Orden: los primeros mandan si un modelo aparece en más de uno. */
const PARCIALES = [
  'fotos-reales.json',
  'fotos-reales-b.json',
  'fotos-lote1.json',
  'fotos-lote2.json',
  'fotos-lote3.json',
  'fotos-wiki.json',
  'fotos-nuevos.json',
  'fotos-rescate.json',
  'fotos-inventario.json',
  'fotos-inventario-wiki.json',
  'fotos-codex.json',
]

type Foto = { archivo: string; [k: string]: unknown }
const final: Record<string, Foto[]> = {}
let leidos = 0

for (const nombre of PARCIALES) {
  const ruta = join(DATA, nombre)
  if (!existsSync(ruta)) continue
  leidos++
  const datos: Record<string, Foto[]> = JSON.parse(readFileSync(ruta, 'utf8'))
  for (const [slug, fotos] of Object.entries(datos)) {
    // Un parcial viejo puede conservar metadatos de archivos que ya no existen.
    // Sólo dejamos competir conjuntos íntegros para no pisar fotos válidas.
    const disponibles = fotos.filter((foto) =>
      existsSync(join(FOTOS, slug, foto.archivo)),
    )
    if (!final[slug] || disponibles.length > final[slug].length) {
      final[slug] = disponibles
    }
  }
}

// Sacamos entradas de modelos que ya no existen en el catálogo.
const validos = new Set(modelosBase.map((m) => m.slug))
for (const slug of Object.keys(final)) if (!validos.has(slug)) delete final[slug]

writeFileSync(DESTINO, JSON.stringify(final, null, 2))

const conFotos = Object.values(final).filter((v) => v.length).length
const totalFotos = Object.values(final).reduce((a, v) => a + v.length, 0)
const sin = modelosBase.filter((m) => !final[m.slug]?.length).map((m) => m.slug)

writeFileSync(join(process.cwd(), 'sin-fotos.txt'), sin.join(','))

console.log(`Manifiestos leídos: ${leidos}`)
console.log(`Modelos con foto real: ${conFotos}/${modelosBase.length}`)
console.log(`Fotos totales: ${totalFotos}`)
console.log(`Sin foto: ${sin.length} (lista en sin-fotos.txt)`)

// Los parciales ya no hacen falta.
if (process.argv.includes('--limpiar')) {
  for (const nombre of PARCIALES.slice(1)) {
    const ruta = join(DATA, nombre)
    if (existsSync(ruta)) unlinkSync(ruta)
  }
  console.log('Parciales borrados.')
}

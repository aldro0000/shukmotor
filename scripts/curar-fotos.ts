/**
 * Aplica la curaduría a todo lo ya bajado: descarta las fotos que no pasan el
 * filtro, reordena las que quedan y marca como no visibles los modelos que
 * quedaron con menos de dos fotos.
 *
 * Correr con: npm run curar          (informe, no toca nada)
 *             npm run curar -- --aplicar
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { modelosBase } from '../src/data/modelos-base'
import { evaluarFoto, tituloOriginal, MINIMO_FOTOS } from './curaduria'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')
const RUTA = join(DATA, 'fotos-reales.json')
const aplicar = process.argv.includes('--aplicar')

type FotoJson = { archivo: string; pagina?: string; width: number; tipo: string; [k: string]: unknown }

const fotos: Record<string, FotoJson[]> = JSON.parse(readFileSync(RUTA, 'utf8'))
const anioDe = Object.fromEntries(modelosBase.map((m) => [m.slug, m.anio ?? 2026]))

const motivos: Record<string, number> = {}
let descartadas = 0
let conservadas = 0
const aBorrar: string[] = []
const resultado: Record<string, FotoJson[]> = {}

for (const [slug, lista] of Object.entries(fotos)) {
  const buenas: { f: FotoJson; puntaje: number }[] = []
  for (const f of lista) {
    const titulo = tituloOriginal(f.pagina, f.archivo)
    const v = evaluarFoto(titulo, f.width, anioDe[slug] ?? 2026)
    if (v.ok) {
      buenas.push({ f, puntaje: v.puntaje })
      conservadas++
    } else {
      descartadas++
      motivos[v.motivo.replace(/\s*\([^)]*\)/, '')] = (motivos[v.motivo.replace(/\s*\([^)]*\)/, '')] ?? 0) + 1
      aBorrar.push(join(PUBLIC, 'fotos', slug, f.archivo))
    }
  }
  buenas.sort((a, b) => b.puntaje - a.puntaje)
  resultado[slug] = buenas.map((b) => b.f)
}

const visibles = modelosBase.filter((m) => (resultado[m.slug]?.length ?? 0) >= MINIMO_FOTOS)
const ocultos = modelosBase.filter((m) => (resultado[m.slug]?.length ?? 0) < MINIMO_FOTOS)

console.log(`Fotos evaluadas: ${conservadas + descartadas}`)
console.log(`  conservadas: ${conservadas}`)
console.log(`  descartadas: ${descartadas}\n`)
console.log('Motivos de descarte:')
for (const [m, n] of Object.entries(motivos).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${m}`)
console.log(`\nModelos visibles (>= ${MINIMO_FOTOS} fotos): ${visibles.length}/${modelosBase.length}`)
console.log(`Modelos que se ocultan: ${ocultos.length}`)
if (ocultos.length) console.log('  ' + ocultos.map((m) => `${m.slug}(${resultado[m.slug]?.length ?? 0})`).join(', '))

if (!aplicar) {
  console.log('\nInforme nada más. Corré con --aplicar para escribir los cambios.')
  process.exit(0)
}

writeFileSync(RUTA, JSON.stringify(resultado, null, 2))
writeFileSync(join(DATA, 'modelos-ocultos.json'), JSON.stringify(ocultos.map((m) => m.slug), null, 2))

let borrados = 0
for (const ruta of aBorrar) {
  if (existsSync(ruta)) {
    unlinkSync(ruta)
    borrados++
  }
}
console.log(`\nAplicado. Archivos borrados: ${borrados}. Modelos ocultos escritos en modelos-ocultos.json.`)

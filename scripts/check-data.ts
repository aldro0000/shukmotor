/**
 * Valida invariantes de los datos de ejemplo. Correr con: npm run check:data
 */
import { marcas } from '../src/data/marcas'
import { modelos, todosLosModelos } from '../src/data/modelos'
import { novedades } from '../src/data/novedades'
import { opiniones } from '../src/data/opiniones'
import { faltantes } from './auditar-imagenes'

const errores: string[] = []
const ids = new Set(modelos.map((m) => m.id))
const marcasIds = new Set(marcas.map((m) => m.id))

if (marcas.length < 40) errores.push(`Hay ${marcas.length} marcas, se piden al menos 40`)
if (modelos.length < 120) errores.push(`Hay ${modelos.length} modelos publicados, se piden al menos 120`)
if (opiniones.length < 380) errores.push(`Hay ${opiniones.length} opiniones, se piden al menos 380`)
if (novedades.length !== 20) errores.push(`Hay ${novedades.length} novedades, se piden 20`)

const slugsMarca = new Set<string>()
for (const m of marcas) {
  if (slugsMarca.has(m.slug)) errores.push(`Marca duplicada: ${m.slug}`)
  slugsMarca.add(m.slug)
  if (!todosLosModelos.some((x) => x.marcaId === m.id)) errores.push(`Marca sin modelos: ${m.nombre}`)
}

const slugsModelo = new Set<string>()
for (const m of modelos) {
  if (slugsModelo.has(m.slug)) errores.push(`Modelo duplicado: ${m.slug}`)
  slugsModelo.add(m.slug)
  if (!marcasIds.has(m.marcaId)) errores.push(`${m.slug}: marca inexistente ${m.marcaId}`)
  if (m.fotos.length < 2) errores.push(`${m.slug}: ${m.fotos.length} fotos, un modelo publicado necesita al menos 2`)
  if (m.fotos.some((f) => f.esIlustracion)) errores.push(`${m.slug}: publicado con una ilustración entre las fotos`)
  for (const f of m.fotos) {
    if (!f.credito.trim() || !f.fuente.trim()) errores.push(`${m.slug}: foto sin crédito o fuente (${f.tipo})`)
    if (!f.width || !f.height) errores.push(`${m.slug}: foto sin width/height (${f.tipo})`)
  }
  if (m.videoReviews.length > 3) errores.push(`${m.slug}: ${m.videoReviews.length} videos, el máximo es 3`)
  for (const v of m.videoReviews) {
    if (v.miniatura.endsWith('.svg')) errores.push(`${m.slug}: video con miniatura vectorial en vez de foto`)
  }
  if (m.rivales.length < 2) errores.push(`${m.slug}: menos de 2 rivales`)
  for (const r of m.rivales) {
    if (!ids.has(r)) errores.push(`${m.slug}: rival inexistente ${r}`)
    if (r === m.id) errores.push(`${m.slug}: es rival de sí mismo`)
  }
  // Un modelo que todavía no llegó no tiene dueños, así que no tiene opiniones.
  if (m.estado === 'vigente' && m.opinionesResumen.cantidad < 1) errores.push(`${m.slug}: sin opiniones`)
  if (m.precioCalleARS <= 0 || m.precioListaARS <= 0) errores.push(`${m.slug}: precio inválido`)
  if (m.usos.length === 0) errores.push(`${m.slug}: sin usos`)
}

for (const o of opiniones) {
  if (!todosLosModelos.some((m) => m.id === o.modeloId)) errores.push(`Opinión ${o.id} apunta a modelo inexistente ${o.modeloId}`)
  if (o.puntaje < 1 || o.puntaje > 5) errores.push(`Opinión ${o.id}: puntaje fuera de rango`)
}

// Densidad por rango de precio (millones ARS, precio de calle)
const rangos = [
  [0, 35], [35, 45], [45, 60], [60, 80], [80, 200],
] as const
console.log('Modelos por rango de precio de calle:')
for (const [a, b] of rangos) {
  const n = modelos.filter((m) => m.precioCalleARS >= a * 1e6 && m.precioCalleARS < b * 1e6).length
  console.log(`  ${String(a).padStart(3)}–${String(b).padStart(3)} M: ${n}`)
}
const porSeg: Record<string, number> = {}
for (const m of modelos) porSeg[m.segmento] = (porSeg[m.segmento] ?? 0) + 1
console.log('Por segmento:', porSeg)

// Cobertura de fotos reales (Wikimedia Commons) vs ilustraciones
const ocultos = todosLosModelos.filter((m) => !m.visible)
console.log(`Modelos ocultos por falta de fotos: ${ocultos.length}`)
const conReal = modelos.filter((m) => m.fotos.some((f) => !f.esIlustracion))
const fotosReales = modelos.reduce((a, m) => a + m.fotos.filter((f) => !f.url.endsWith('.svg')).length, 0)
const notasConReal = novedades.filter((n) => !n.imagen.endsWith('.svg')).length
console.log(`Fotos reales: ${fotosReales} en ${conReal.length}/${modelos.length} modelos; ${notasConReal}/${novedades.length} notas`)

// Ninguna foto real puede quedar sin autor identificable
for (const m of modelos) {
  for (const f of m.fotos) {
    if (f.url.endsWith('.svg')) continue
    if (!f.credito.trim() || f.credito.length < 2) errores.push(`${m.slug}: foto real sin autor`)
    if (!f.pagina || !/commons\.wikimedia\.org/.test(f.pagina)) errores.push(`${m.slug}: foto real sin enlace a la página de origen`)
  }
}
for (const n of novedades) {
  if (n.imagen.endsWith('.svg')) continue
  if (!n.imagenCredito.trim()) errores.push(`${n.slug}: imagen de nota sin autor`)
}
console.log(`Marcas: ${marcas.length}, modelos: ${modelos.length}, opiniones: ${opiniones.length}, novedades: ${novedades.length}`)

// Ninguna ruta de imagen puede apuntar a un archivo que no existe. Si esto
// falla, la app renderizaría un <img> roto y eso no llega a producción.
const rotas = faltantes()
if (rotas.length) {
  const unicas = [...new Set(rotas.map((r) => r.url))]
  errores.push(`${rotas.length} rutas de imagen apuntan a archivos inexistentes (${unicas.length} archivos):`)
  for (const u of unicas.slice(0, 15)) errores.push(`   ${u}`)
  if (unicas.length > 15) errores.push(`   … y ${unicas.length - 15} más`)
}

if (errores.length) {
  console.error(`\n${errores.length} errores:`)
  for (const e of errores) console.error(' -', e)
  process.exit(1)
}
console.log('Datos OK')

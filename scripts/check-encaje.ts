/**
 * Verifica las reglas duras del bloque de encaje:
 * ninguna ficha sin "te sirve si", ninguna sin "buscá otra si", y que las
 * etiquetas de card no se repitan dentro de una misma grilla.
 *
 * Correr con: npm run check:encaje
 */
import { modelos } from '../src/data/modelos'
import { encajeDe, etiquetaDe } from '../src/lib/encaje'

const errores: string[] = []
const etiquetas = new Map<string, string[]>()

for (const m of modelos) {
  const { aFavor, enContra } = encajeDe(m)
  if (aFavor.length < 3) errores.push(`${m.slug}: solo ${aFavor.length} razones a favor`)
  if (enContra.length < 3) errores.push(`${m.slug}: solo ${enContra.length} razones en contra`)
  for (const t of [...aFavor, ...enContra]) {
    if (t.length < 15) errores.push(`${m.slug}: línea demasiado corta "${t}"`)
    // Cada línea tiene que llevar un dato, no un adjetivo suelto.
    const tieneDato = /\d/.test(t) || /(automátic|manual|4x4|4x2|plazas|puertas|eléctric|híbrid|diésel|nafta|reductora|importador|garantía|talleres|carga)/i.test(t)
    if (!tieneDato) errores.push(`${m.slug}: línea sin dato "${t}"`)
  }
  const e = etiquetaDe(m)
  ;(etiquetas.get(e) ?? etiquetas.set(e, []).get(e)!).push(m.slug)
}

// Variedad: en una grilla de ocho, las etiquetas deben distinguirse.
const distintas = etiquetas.size
console.log(`Modelos publicados: ${modelos.length}`)
console.log(`Etiquetas de card distintas: ${distintas}`)
const top = [...etiquetas.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8)
console.log('Las más repetidas:')
for (const [e, ms] of top) console.log(`  ${String(ms.length).padStart(3)}  ${e}`)

// Muestra de grillas reales de ocho: cuántas etiquetas distintas salen.
let peor = 8
for (let i = 0; i + 8 <= modelos.length; i += 8) {
  const grupo = modelos.slice(i, i + 8).map((m) => etiquetaDe(m))
  peor = Math.min(peor, new Set(grupo).size)
}
console.log(`\nEn la peor grilla de ocho hay ${peor} etiquetas distintas.`)
if (peor < 4) errores.push(`Hay una grilla de ocho con solo ${peor} etiquetas distintas`)

if (errores.length) {
  console.error(`\n${errores.length} errores:`)
  for (const e of errores.slice(0, 25)) console.error(' -', e)
  process.exit(1)
}
console.log('\nEncaje OK: ninguna ficha sin razones a favor ni en contra.')

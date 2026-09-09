/**
 * Corre de una todos los criterios de aceptación que se pueden medir sin
 * navegador. Los que necesitan navegador (imágenes rotas, scroll horizontal,
 * errores de consola) se verifican aparte.
 *
 * Correr con: npm run verificar
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { modelos, todosLosModelos } from '../src/data/modelos'
import { novedades } from '../src/data/novedades'
import { encajeDe, etiquetaDe } from '../src/lib/encaje'
import { faltantes } from './auditar-imagenes'

const PUBLIC = join(process.cwd(), 'public')
const fallos: string[] = []
const ok = (t: string) => console.log(`  OK   ${t}`)
const mal = (t: string) => {
  console.log(`  MAL  ${t}`)
  fallos.push(t)
}

function pesoMB(dir: string): number {
  let total = 0
  const recorrer = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = join(d, e.name)
      if (e.isDirectory()) recorrer(r)
      else total += statSync(r).size
    }
  }
  recorrer(dir)
  return Math.round((total / 1024 / 1024) * 10) / 10
}

console.log('CRITERIOS DE ACEPTACIÓN\n')

// 1. Ninguna ruta de imagen apunta a un archivo inexistente.
const rotas = faltantes()
rotas.length === 0
  ? ok('Ninguna ruta de imagen apunta a un archivo inexistente')
  : mal(`${rotas.length} rutas de imagen rotas (ej. ${rotas[0].url})`)

// 2. Ninguna galería declara más fotos de las que carga.
const conIlustracion = modelos.filter((m) => m.fotos.some((f) => f.esIlustracion))
conIlustracion.length === 0
  ? ok('Ninguna galería mezcla ilustraciones con fotos')
  : mal(`${conIlustracion.length} modelos con ilustración dentro de la galería`)

const pocasFotos = modelos.filter((m) => m.fotos.length < 2)
pocasFotos.length === 0
  ? ok('Todo modelo publicado tiene al menos dos fotos')
  : mal(`${pocasFotos.length} modelos publicados con menos de dos fotos`)

// 3. Ninguna miniatura de video es vectorial.
const videoSvg = modelos.filter((m) => m.videoReviews.some((v) => v.miniatura.endsWith('.svg')))
videoSvg.length === 0
  ? ok('Ninguna card de video usa una ilustración de miniatura')
  : mal(`${videoSvg.length} modelos con miniatura vectorial`)

// 4. Etiquetas distintas en cualquier grilla de ocho.
let peor = 99
for (let i = 0; i + 8 <= modelos.length; i += 8) {
  peor = Math.min(peor, new Set(modelos.slice(i, i + 8).map((m) => etiquetaDe(m))).size)
}
peor >= 4
  ? ok(`En la peor grilla de ocho hay ${peor} etiquetas distintas`)
  : mal(`Hay una grilla de ocho con solo ${peor} etiquetas distintas`)

// 5. Ninguna ficha sin "buscá otra si" ni sin "te sirve si".
const sinContras = modelos.filter((m) => encajeDe(m).enContra.length < 3)
const sinFavor = modelos.filter((m) => encajeDe(m).aFavor.length < 3)
sinContras.length === 0 ? ok('Ninguna ficha sin razones en contra') : mal(`${sinContras.length} fichas sin tres contras`)
sinFavor.length === 0 ? ok('Ninguna ficha sin razones a favor') : mal(`${sinFavor.length} fichas sin tres a favor`)

// 6. Peso de la carpeta pública.
const peso = pesoMB(PUBLIC)
peso < 60 ? ok(`La carpeta public pesa ${peso} MB`) : mal(`La carpeta public pesa ${peso} MB, el objetivo es menos de 60`)

// 7. Toda foto real tiene crédito y fuente.
const sinCredito = modelos.filter((m) => m.fotos.some((f) => !f.credito.trim() || !f.fuente.trim()))
sinCredito.length === 0 ? ok('Toda foto lleva crédito y fuente') : mal(`${sinCredito.length} modelos con foto sin crédito`)

console.log('\nRESUMEN')
console.log(`  Modelos publicados: ${modelos.length} de ${todosLosModelos.length}`)
console.log(`  Modelos ocultos por falta de fotos: ${todosLosModelos.length - modelos.length}`)
console.log(`  Fotos publicadas: ${modelos.reduce((a, m) => a + m.fotos.length, 0)}`)
console.log(`  Notas con foto real: ${novedades.filter((n) => !n.imagen.endsWith('.svg')).length} de ${novedades.length}`)
console.log(`  Etiquetas de card distintas: ${new Set(modelos.map((m) => etiquetaDe(m))).size}`)
console.log(`  Peso de public: ${peso} MB`)

if (fallos.length) {
  console.error(`\n${fallos.length} criterios sin cumplir.`)
  process.exit(1)
}
console.log('\nTodos los criterios medibles sin navegador se cumplen.')

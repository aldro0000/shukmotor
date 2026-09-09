/**
 * Recorta el peso muerto de public/:
 *
 * 1. Logos desmesurados. Un logo de marca no puede pesar más que toda la
 *    galería de un modelo. El de Audi venía en 10 MB de SVG con detalle
 *    vectorial que a 40 px no se ve. Los que pasan el tope salen del
 *    manifiesto y la marca cae a sus iniciales, que es la regla del producto.
 * 2. Ilustraciones de respaldo de modelos que ya tienen fotos reales.
 *
 * Correr con: npm run limpiar:peso
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync, statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')

/** Un SVG de logo por encima de esto no aporta nada a 40 px de alto. */
const TOPE_LOGO_KB = 60

let liberados = 0

// ---- 1. Logos pesados -------------------------------------------------------
const rutaLogos = join(DATA, 'logos-reales.json')
if (existsSync(rutaLogos)) {
  const logos: Record<string, { archivo: string }> = JSON.parse(readFileSync(rutaLogos, 'utf8'))
  for (const [id, l] of Object.entries(logos)) {
    const ruta = join(PUBLIC, 'logos', l.archivo)
    if (!existsSync(ruta)) continue
    const kb = statSync(ruta).size / 1024
    if (kb > TOPE_LOGO_KB) {
      console.log(`  ${id}: ${Math.round(kb)} KB, fuera del manifiesto (cae a iniciales)`)
      unlinkSync(ruta)
      delete logos[id]
      liberados += kb * 1024
    }
  }
  writeFileSync(rutaLogos, JSON.stringify(logos, null, 2))
}

// ---- 2. Ilustraciones que ya no se usan -------------------------------------
const rutaFotos = join(DATA, 'fotos-reales.json')
const fotos: Record<string, unknown[]> = existsSync(rutaFotos) ? JSON.parse(readFileSync(rutaFotos, 'utf8')) : {}
let svgBorrados = 0

for (const entrada of readdirSync(join(PUBLIC, 'fotos'), { withFileTypes: true })) {
  if (!entrada.isDirectory() || entrada.name === 'novedades') continue
  const tieneFotos = (fotos[entrada.name]?.length ?? 0) >= 2
  if (!tieneFotos) continue
  const dir = join(PUBLIC, 'fotos', entrada.name)
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.svg')) continue
    const ruta = join(dir, f)
    liberados += statSync(ruta).size
    unlinkSync(ruta)
    svgBorrados++
  }
}

console.log(`\nIlustraciones borradas de modelos con fotos reales: ${svgBorrados}`)
console.log(`Espacio liberado: ${(liberados / 1024 / 1024).toFixed(1)} MB`)

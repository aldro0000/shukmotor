/**
 * La misma curaduría que a las fotos de autos, aplicada a las imágenes de las
 * notas. La portada es lo primero que se ve: una foto mala ahí cuesta más que
 * no tener foto.
 *
 * Correr con: npm run curar:novedades [-- --aplicar]
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { evaluarFoto, tituloOriginal } from './curaduria'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')
const RUTA = join(DATA, 'fotos-novedades.json')
const aplicar = process.argv.includes('--aplicar')

type Nota = { archivo: string; pagina?: string; width: number; [k: string]: unknown }

if (!existsSync(RUTA)) {
  console.log('No hay imágenes de notas.')
  process.exit(0)
}

const notas: Record<string, Nota> = JSON.parse(readFileSync(RUTA, 'utf8'))
const quedan: Record<string, Nota> = {}
const fuera: string[] = []

for (const [slug, n] of Object.entries(notas)) {
  const titulo = tituloOriginal(n.pagina, n.archivo)
  const v = evaluarFoto(titulo, n.width)
  if (v.ok) quedan[slug] = n
  else fuera.push(`${slug}: ${v.motivo}`)
}

console.log(`Imágenes de nota: ${Object.keys(notas).length}`)
console.log(`  pasan el filtro: ${Object.keys(quedan).length}`)
console.log(`  descartadas: ${fuera.length}`)
for (const f of fuera) console.log(`    ${f}`)

if (!aplicar) {
  console.log('\nInforme nada más. Corré con --aplicar para escribir los cambios.')
  process.exit(0)
}

for (const [slug, n] of Object.entries(notas)) {
  if (quedan[slug]) continue
  const ruta = join(PUBLIC, 'fotos', 'novedades', n.archivo)
  if (existsSync(ruta)) unlinkSync(ruta)
}
writeFileSync(RUTA, JSON.stringify(quedan, null, 2))
console.log('\nAplicado.')

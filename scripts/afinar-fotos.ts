/**
 * Segunda pasada de peso. La primera conversión a WebP bajó de 559 a 271 MB,
 * que sigue siendo inviable en un celular con datos. Acá se hacen tres cosas:
 *
 * 1. Borrar todo archivo que ya no esté en el manifiesto (modelos ocultos,
 *    fotos descartadas por la curaduría, originales que quedaron sueltos).
 * 2. Recortar a tres fotos por modelo: frente, perfil y trasera, que es el
 *    orden de preferencia del producto y pesa la mitad.
 * 3. Rearmar los tres tamaños con el ancho y la calidad justos para pantalla.
 *
 * Correr con: npm run afinar
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, statSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')
const FOTOS = join(PUBLIC, 'fotos')

/**
 * 360 para grillas, 720 para cards grandes, 1200 para la galería.
 * Tres fotos por modelo: frente, perfil y trasera, que es exactamente el orden
 * de preferencia del producto. La cuarta sumaba un tercio de peso sin agregar
 * información.
 */
export const ANCHOS = [360, 720] as const
const CALIDAD: Record<number, number> = { 360: 60, 720: 58 }
/** El ancho más grande es el que queda como `archivo` en el manifiesto. */
const GRANDE = ANCHOS[ANCHOS.length - 1]
const MAX_POR_MODELO = 3

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

type FotoJson = { archivo: string; width: number; height: number; [k: string]: unknown }

async function main() {
  const antes = pesoMB(FOTOS)
  console.log(`Peso antes: ${antes} MB`)

  const rutaFotos = join(DATA, 'fotos-reales.json')
  const fotos: Record<string, FotoJson[]> = JSON.parse(readFileSync(rutaFotos, 'utf8'))

  // 1. Recortar por modelo (ya vienen ordenadas por la curaduría).
  let recortadas = 0
  for (const [slug, lista] of Object.entries(fotos)) {
    if (lista.length > MAX_POR_MODELO) {
      recortadas += lista.length - MAX_POR_MODELO
      fotos[slug] = lista.slice(0, MAX_POR_MODELO)
    }
  }

  // 2. Rearmar tamaños desde la versión más grande que exista.
  let convertidas = 0
  const vivos = new Set<string>()

  for (const [slug, lista] of Object.entries(fotos)) {
    for (const f of lista) {
      const dir = join(FOTOS, slug)
      const base = f.archivo.replace(/-\d+\.webp$/, '').replace(/\.(jpe?g|png|webp)$/i, '')
      const fuente = [1600, 1400, 1200, 900, 720].map((w) => join(dir, `${base}-${w}.webp`)).find((r) => existsSync(r)) ?? join(dir, f.archivo)
      if (!existsSync(fuente)) continue

      let dims: { w: number; h: number } | null = null
      for (const ancho of ANCHOS) {
        const destino = join(dir, `${base}-${ancho}.webp`)
        try {
          const salida = await sharp(readFileSync(fuente), { failOn: 'none' })
            .resize({ width: ancho, withoutEnlargement: true })
            .webp({ quality: CALIDAD[ancho], effort: 6 })
            .toBuffer({ resolveWithObject: true })
          writeFileSync(destino, salida.data)
          if (ancho === GRANDE) dims = { w: salida.info.width, h: salida.info.height }
          vivos.add(destino)
        } catch {
          /* si una falla, seguimos con las demás */
        }
      }
      if (dims) {
        f.archivo = `${base}-${GRANDE}.webp`
        f.width = dims.w
        f.height = dims.h
      }
      convertidas++
    }
  }
  writeFileSync(rutaFotos, JSON.stringify(fotos, null, 2))

  // Notas: mismo tratamiento.
  const rutaNotas = join(DATA, 'fotos-novedades.json')
  if (existsSync(rutaNotas)) {
    const notas: Record<string, FotoJson> = JSON.parse(readFileSync(rutaNotas, 'utf8'))
    for (const nota of Object.values(notas)) {
      const dir = join(FOTOS, 'novedades')
      const base = nota.archivo.replace(/-\d+\.webp$/, '').replace(/\.(jpe?g|png|webp)$/i, '')
      const fuente = [1600, 1400, 1200, 900, 720].map((w) => join(dir, `${base}-${w}.webp`)).find((r) => existsSync(r))
      if (!fuente) continue
      let dims: { w: number; h: number } | null = null
      for (const ancho of ANCHOS) {
        const destino = join(dir, `${base}-${ancho}.webp`)
        try {
          const salida = await sharp(readFileSync(fuente), { failOn: 'none' })
            .resize({ width: ancho, withoutEnlargement: true })
            .webp({ quality: CALIDAD[ancho], effort: 6 })
            .toBuffer({ resolveWithObject: true })
          writeFileSync(destino, salida.data)
          if (ancho === GRANDE) dims = { w: salida.info.width, h: salida.info.height }
        } catch {
          // Un archivo trabado en Windows no puede abortar la pasada entera:
          // el paso que sigue borra todo lo que no quedó vivo.
        }
        // Vivo igual: si ya existía, no hay que borrarlo por no haberlo reescrito.
        if (existsSync(destino)) vivos.add(destino)
      }
      if (dims) {
        nota.archivo = `${base}-${GRANDE}.webp`
        nota.width = dims.w
        nota.height = dims.h
      }
    }
    writeFileSync(rutaNotas, JSON.stringify(notas, null, 2))
  }

  // 3. Borrar todo lo que no quedó vivo, salvo los SVG de respaldo.
  let borrados = 0
  let noBorrados = 0
  const limpiar = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = join(d, e.name)
      if (e.isDirectory()) {
        limpiar(r)
        try {
          if (readdirSync(r).length === 0) rmdirSync(r)
        } catch {
          /* carpeta en uso, no importa */
        }
      } else if (!e.name.endsWith('.svg') && !vivos.has(r)) {
        try {
          unlinkSync(r)
          borrados++
        } catch {
          // En Windows el dev server puede tener el archivo abierto. No es
          // motivo para abortar la pasada entera.
          noBorrados++
        }
      }
    }
  }
  limpiar(FOTOS)

  const despues = pesoMB(FOTOS)
  console.log(`Fotos recortadas del manifiesto: ${recortadas}`)
  console.log(`Imágenes rearmadas: ${convertidas} en ${ANCHOS.length} tamaños`)
  console.log(`Archivos borrados: ${borrados}${noBorrados ? ` (${noBorrados} bloqueados, corré de nuevo con el dev server apagado)` : ''}`)
  console.log(`Peso después: ${despues} MB (antes ${antes} MB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

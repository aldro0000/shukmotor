/**
 * Convierte las fotos a WebP en tres anchos y borra los originales.
 *
 * La carpeta pública pesaba más de medio giga en JPG, que es inviable en un
 * celular con datos. Con WebP y tres tamaños, la grilla pide la versión chica y
 * la ficha la grande, y el peso baja un orden de magnitud.
 *
 * Correr con: npm run optimizar
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const DATA = join(process.cwd(), 'src', 'data')
const PUBLIC = join(process.cwd(), 'public')
const FOTOS = join(PUBLIC, 'fotos')

/** 400 para grillas, 800 para cards grandes, 1600 para la galería. */
export const ANCHOS = [400, 800, 1600] as const

const CALIDAD: Record<number, number> = { 400: 72, 800: 74, 1600: 78 }

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

async function convertir(origen: string, base: string): Promise<{ w: number; h: number } | null> {
  try {
    const img = sharp(origen, { failOn: 'none' })
    const meta = await img.metadata()
    const anchoOriginal = meta.width ?? 0
    if (!anchoOriginal) return null

    let dims: { w: number; h: number } | null = null
    for (const ancho of ANCHOS) {
      const destino = `${base}-${ancho}.webp`
      const objetivo = Math.min(ancho, anchoOriginal)
      const salida = await sharp(origen, { failOn: 'none' })
        .rotate()
        .resize({ width: objetivo, withoutEnlargement: true })
        .webp({ quality: CALIDAD[ancho], effort: 5 })
        .toFile(destino)
      if (ancho === 1600) dims = { w: salida.width, h: salida.height }
    }
    return dims
  } catch {
    return null
  }
}

async function main() {
  const antes = pesoMB(FOTOS)
  console.log(`Peso antes: ${antes} MB`)

  // ---- Fotos de modelos ----
  const rutaFotos = join(DATA, 'fotos-reales.json')
  const fotos: Record<string, { archivo: string; width: number; height: number; [k: string]: unknown }[]> = JSON.parse(
    readFileSync(rutaFotos, 'utf8'),
  )
  let n = 0
  const borrar: string[] = []

  for (const [slug, lista] of Object.entries(fotos)) {
    for (const f of lista) {
      const origen = join(FOTOS, slug, f.archivo)
      if (!existsSync(origen)) continue
      if (f.archivo.endsWith('.webp')) continue
      const sinExt = f.archivo.replace(/\.(jpe?g|png)$/i, '')
      const dims = await convertir(origen, join(FOTOS, slug, sinExt))
      if (!dims) continue
      f.archivo = `${sinExt}-1600.webp`
      f.width = dims.w
      f.height = dims.h
      borrar.push(origen)
      n++
      if (n % 100 === 0) console.log(`  ${n} fotos convertidas`)
    }
  }
  writeFileSync(rutaFotos, JSON.stringify(fotos, null, 2))

  // ---- Imágenes de notas ----
  const rutaNotas = join(DATA, 'fotos-novedades.json')
  if (existsSync(rutaNotas)) {
    const notas: Record<string, { archivo: string; width: number; height: number; [k: string]: unknown }> = JSON.parse(
      readFileSync(rutaNotas, 'utf8'),
    )
    for (const nota of Object.values(notas)) {
      const origen = join(FOTOS, 'novedades', nota.archivo)
      if (!existsSync(origen) || nota.archivo.endsWith('.webp')) continue
      const sinExt = nota.archivo.replace(/\.(jpe?g|png)$/i, '')
      const dims = await convertir(origen, join(FOTOS, 'novedades', sinExt))
      if (!dims) continue
      nota.archivo = `${sinExt}-1600.webp`
      nota.width = dims.w
      nota.height = dims.h
      borrar.push(origen)
      n++
    }
    writeFileSync(rutaNotas, JSON.stringify(notas, null, 2))
  }

  for (const r of borrar) if (existsSync(r)) unlinkSync(r)

  const despues = pesoMB(FOTOS)
  console.log(`\nConvertidas: ${n} imágenes a ${ANCHOS.length} tamaños cada una.`)
  console.log(`Originales borrados: ${borrar.length}`)
  console.log(`Peso después: ${despues} MB (antes ${antes} MB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

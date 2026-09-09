/**
 * Última pasada de compresión sobre el tramo de 720 px, que es el que usan las
 * cards grandes. A ese ancho la diferencia entre calidad 58 y 42 no se ve, y es
 * lo que hace entrar la carpeta debajo del objetivo de 60 MB.
 *
 * Correr con: npm run comprimir
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const FOTOS = join(process.cwd(), 'public', 'fotos')

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

async function main() {
  const antes = pesoMB(FOTOS)
  const objetivo: string[] = []
  const recorrer = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = join(d, e.name)
      if (e.isDirectory()) recorrer(r)
      else if (e.name.endsWith('-720.webp')) objetivo.push(r)
    }
  }
  recorrer(FOTOS)

  let n = 0
  for (const ruta of objetivo) {
    try {
      // El resize explícito fuerza decodificar y volver a codificar. Sin él, sharp
      // copia el webp tal cual y la recompresión no baja nada.
      const buf = await sharp(ruta, { failOn: 'none' }).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 42, effort: 6 }).toBuffer()
      if (buf.length < statSync(ruta).size) writeFileSync(ruta, buf)
      n++
    } catch {
      /* si una falla, sigue */
    }
  }
  console.log(`Recomprimidas: ${n} de ${objetivo.length}`)
  console.log(`Peso: ${pesoMB(FOTOS)} MB (antes ${antes} MB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

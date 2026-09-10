/**
 * Recorre las 56 marcas de la Guía Oficial de Precios de ACARA y arma el
 * snapshot del día en data/snapshots/precios-YYYY-MM-DD.json.
 *
 * Ese archivo es un ledger que no se borra nunca: es la serie histórica de
 * precios oficiales, y algún día va a alimentar el índice de reventa. Por eso
 * la regla dura es no escribir nunca un snapshot a medias: si una sola marca
 * falla o la página cambió de estructura, se aborta todo y no se toca nada.
 *
 * ACARA actualiza esta guía una vez por mes (la Comisión de Valuación se
 * reúne "a la finalización de cada mes"), no todos los días. Correr esto dos
 * veces al día y escribir 1,7 MB cada vez generaría cientos de megas al año
 * de archivos casi idénticos entre una actualización y la siguiente. Por eso,
 * si el contenido es igual al último snapshot real, no se crea un archivo
 * nuevo: se anota en `registro.json` que ese día se chequeó y no hubo cambio,
 * y se sigue apuntando al snapshot vigente. El historial queda igual de
 * completo día por día, sin duplicar datos idénticos.
 *
 * Correr con: npm run snapshot:precios
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { MARCAS_ACARA, traerMarca, type FilaCruda } from './acara-cliente'

const DIR = join(process.cwd(), 'data', 'snapshots')
const REGISTRO = join(DIR, 'registro.json')

export type Snapshot = {
  fecha: string
  fuente: string
  items: FilaCruda[]
}

type Chequeo = { fecha: string; cambio: boolean; archivo: string }

function ultimoSnapshotReal(antesDe: string): Snapshot | null {
  if (!existsSync(DIR)) return null
  const archivos = readdirSync(DIR)
    .filter((f) => /^precios-\d{4}-\d{2}-\d{2}\.json$/.test(f) && f < `precios-${antesDe}.json`)
    .sort()
  const ultimo = archivos.at(-1)
  if (!ultimo) return null
  return JSON.parse(readFileSync(join(DIR, ultimo), 'utf8'))
}

function mismosItems(a: FilaCruda[], b: FilaCruda[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

async function main() {
  const fecha = new Date().toISOString().slice(0, 10)
  const destino = join(DIR, `precios-${fecha}.json`)

  if (existsSync(destino)) {
    console.log(`Ya existe un snapshot de hoy (${fecha}). No se pisa; se sale sin hacer nada.`)
    return
  }

  const items: FilaCruda[] = []
  const errores: string[] = []
  let vistas = 0

  for (const marca of MARCAS_ACARA) {
    const r = await traerMarca(marca)
    if ('error' in r) {
      errores.push(`${marca}: ${r.error}`)
      continue
    }
    items.push(...r.filas)
    vistas++
    console.log(`${marca}: ${r.filas.length} filas`)
  }

  if (errores.length > 0) {
    console.error(`\n${errores.length} marcas fallaron, no se escribe nada:`)
    for (const e of errores) console.error(`  - ${e}`)
    process.exitCode = 1
    return
  }

  mkdirSync(DIR, { recursive: true })
  const registro: Chequeo[] = existsSync(REGISTRO) ? JSON.parse(readFileSync(REGISTRO, 'utf8')) : []
  const anterior = ultimoSnapshotReal(fecha)

  if (anterior && mismosItems(anterior.items, items)) {
    const archivoVigente = `precios-${anterior.fecha}.json`
    registro.push({ fecha, cambio: false, archivo: archivoVigente })
    writeFileSync(REGISTRO, JSON.stringify(registro, null, 1))
    console.log(`\nSin cambios respecto a ${archivoVigente}. No se escribe snapshot nuevo, sólo se registra el chequeo.`)
    return
  }

  const snapshot: Snapshot = { fecha, fuente: 'https://www.acaramotos.org.ar/guia-oficial-de-precios.php?tipo=AUTOS', items }
  writeFileSync(destino, JSON.stringify(snapshot, null, 1))
  registro.push({ fecha, cambio: true, archivo: `precios-${fecha}.json` })
  writeFileSync(REGISTRO, JSON.stringify(registro, null, 1))

  console.log(`\nSnapshot nuevo: ${destino}`)
  console.log(`${vistas} marcas, ${items.length} filas, ${items.filter((i) => i.precioLista !== null).length} con precio 0km`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})

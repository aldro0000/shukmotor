/**
 * Compara el snapshot de hoy contra el estado conocido y clasifica cada
 * diferencia. Escribe src/data/movimientos.ts, que se publica solo porque es
 * dato puro: no hay una línea de prosa que revisar antes de subirlo.
 *
 * No relee todo el historial de snapshots en cada corrida -eso se pondría
 * cada vez más lento a medida que pasan los años-, sino que mantiene un
 * ledger compacto en data/precios-estado.json con el último valor conocido de
 * cada fila. El historial completo sigue en data/snapshots/, intacto, para
 * quien lo necesite después.
 *
 * Correr con: npm run diff:precios
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { MovimientoPrecio, TipoMovimientoPrecio } from '../src/types'
import { emparejar, nombreMarca } from './emparejar-modelo'
import type { Snapshot } from './snapshot-precios'
import { movimientos as historicos } from '../src/data/movimientos'
import { createHash } from 'node:crypto'
import { ejecutado } from './pipeline-utils'

const DIR_SNAPSHOTS = join(process.cwd(), 'data', 'snapshots')
const ESTADO = join(process.cwd(), 'data', 'precios-estado.json')
const DESTINO = join(process.cwd(), 'src', 'data', 'movimientos.ts')

/** Última fila conocida de cada versión, sólo lo necesario para diffear. */
type EstadoFila = {
  moneda: '$' | 'u$s'
  precioLista: number | null
  fechaUltimoCambio: string
}
export type Estado = Record<string, EstadoFila>

function clave(marca: string, modelo: string, version: string): string {
  return `${marca}|${modelo}|${version}`
}

function ultimoSnapshot(): Snapshot | null {
  if (!existsSync(DIR_SNAPSHOTS)) return null
  const archivos = readdirSync(DIR_SNAPSHOTS)
    .filter((f) => /^precios-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
  const ultimo = archivos.at(-1)
  return ultimo ? JSON.parse(readFileSync(join(DIR_SNAPSHOTS, ultimo), 'utf8')) : null
}

function diasEntre(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

export function detectarCambios(snapshot: Snapshot, estadoViejo: Estado) {
  const estadoNuevo: Estado = {}
  const marcasViejas = new Set(Object.keys(estadoViejo).map((k) => k.split('|')[0]))
  const marcasNuevasVistas = new Set<string>()
  const movimientos: MovimientoPrecio[] = []

  const agregar = (tipo: TipoMovimientoPrecio, marca: string, modelo: string, version: string, opts: Partial<MovimientoPrecio> = {}) => {
    movimientos.push({
      id: `mov-${snapshot.fecha}-${createHash('sha256').update(`${tipo}|${marca}|${modelo}|${version}`).digest('hex').slice(0, 16)}`,
      moneda: '$',
      precioLista: null,
      precioAnterior: null,
      tipo,
      marca: nombreMarca(marca),
      modelo,
      version,
      fecha: snapshot.fecha,
      precioListaARS: null,
      precioAnteriorARS: null,
      porcentaje: null,
      diasDesdeCambioAnterior: null,
      modeloSlug: emparejar(marca, modelo),
      ...opts,
    })
    const mov = movimientos.at(-1)!
    mov.moneda = snapshot.items.find(i => i.marca === marca && i.modelo === modelo && i.version === version)?.moneda
      ?? estadoViejo[clave(marca, modelo, version)]?.moneda ?? '$'
    mov.precioLista = mov.precioListaARS
    mov.precioAnterior = mov.precioAnteriorARS
    if (mov.moneda !== '$') { mov.precioListaARS = null; mov.precioAnteriorARS = null }
  }

  for (const item of snapshot.items) {
    const k = clave(item.marca, item.modelo, item.version)
    const previa = estadoViejo[k]
    marcasNuevasVistas.add(item.marca)

    if (!previa) {
      // Fila que no existía en el estado anterior. Si nunca vimos esta marca,
      // es la marca la que es noticia, no la versión puntual.
      if (item.precioLista !== null && !marcasViejas.has(item.marca) && Object.keys(estadoViejo).length > 0) {
        agregar('marca_nueva', item.marca, item.modelo, item.version, { precioListaARS: item.precioLista })
      } else if (item.precioLista !== null && Object.keys(estadoViejo).length > 0) {
        agregar('version_nueva', item.marca, item.modelo, item.version, { precioListaARS: item.precioLista })
      }
      estadoNuevo[k] = { moneda: item.moneda, precioLista: item.precioLista, fechaUltimoCambio: snapshot.fecha }
      continue
    }

    estadoNuevo[k] = previa
    if (previa.moneda !== item.moneda) {
      // Cambió la moneda en la que ACARA cotiza esta versión: no es un
      // aumento ni una baja, es otra cosa. Se actualiza el estado sin emitir
      // un movimiento que compararía peras con manzanas.
      estadoNuevo[k] = { moneda: item.moneda, precioLista: item.precioLista, fechaUltimoCambio: snapshot.fecha }
      continue
    }
    if (previa.precioLista === item.precioLista) continue

    if (previa.precioLista !== null && item.precioLista === null) {
      agregar('version_baja', item.marca, item.modelo, item.version, { precioAnteriorARS: previa.precioLista })
    } else if (previa.precioLista === null && item.precioLista !== null) {
      agregar('version_nueva', item.marca, item.modelo, item.version, { precioListaARS: item.precioLista })
    } else if (previa.precioLista !== null && item.precioLista !== null) {
      const pct = Math.round(((item.precioLista - previa.precioLista) / previa.precioLista) * 1000) / 10
      agregar(item.precioLista > previa.precioLista ? 'suba' : 'baja', item.marca, item.modelo, item.version, {
        precioListaARS: item.precioLista,
        precioAnteriorARS: previa.precioLista,
        porcentaje: pct,
        diasDesdeCambioAnterior: diasEntre(previa.fechaUltimoCambio, snapshot.fecha),
      })
    }
    estadoNuevo[k] = { moneda: item.moneda, precioLista: item.precioLista, fechaUltimoCambio: snapshot.fecha }
  }

  // Filas que estaban en el estado viejo y ya no aparecen en el snapshot: la
  // versión (o la marca entera) desapareció de la guía.
  for (const k of Object.keys(estadoViejo)) {
    if (k in estadoNuevo) continue
    const [marca, modelo, version] = k.split('|')
    if (!marcasNuevasVistas.has(marca) && marcasViejas.has(marca)) {
      agregar('marca_desaparece', marca, modelo, version, { precioAnteriorARS: estadoViejo[k].precioLista })
    } else {
      agregar('version_baja', marca, modelo, version, { precioAnteriorARS: estadoViejo[k].precioLista })
    }
  }

  return { estadoNuevo, movimientos }
}

export function acumularMovimientos(previos: MovimientoPrecio[], nuevos: MovimientoPrecio[]) {
  return [...new Map([...previos, ...nuevos].map(m => [m.id, m])).values()]
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id))
}

function main() {
  const snapshot = ultimoSnapshot()
  if (!snapshot) throw new Error('No hay snapshot: ejecutar snapshot:precios antes del diff.')
  const estadoViejo: Estado = existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, 'utf8')) : {}
  const { estadoNuevo, movimientos } = detectarCambios(snapshot, estadoViejo)
  const acumulados = acumularMovimientos(historicos, movimientos)
  const registro: { fecha: string }[] = existsSync(join(DIR_SNAPSHOTS, 'registro.json'))
    ? JSON.parse(readFileSync(join(DIR_SNAPSHOTS, 'registro.json'), 'utf8')) : []
  const relevamiento = registro.at(-1)?.fecha ?? snapshot.fecha

  const cuerpo = `// Se genera con \`npm run diff:precios\`. No editar a mano: se pisa en cada corrida.
import type { MovimientoPrecio } from '../types'

/** Último relevamiento: ${snapshot.fecha}, fuente ${snapshot.fuente} */
export const FECHA_ULTIMO_RELEVAMIENTO = '${relevamiento}'

export const movimientos: MovimientoPrecio[] = ${JSON.stringify(acumulados, null, 1)}
`
  writeFileSync(DESTINO, cuerpo)
  // El historial se escribe primero: si se interrumpe, la próxima corrida deduplica por ID.
  writeFileSync(ESTADO, JSON.stringify(estadoNuevo, null, 1))
  console.log(`${movimientos.length} movimientos detectados. Escrito en ${DESTINO}.`)
  for (const tipo of ['suba', 'baja', 'version_nueva', 'version_baja', 'marca_nueva', 'marca_desaparece'] as const) {
    const n2 = movimientos.filter((m) => m.tipo === tipo).length
    if (n2) console.log(`  ${tipo}: ${n2}`)
  }
}

if (ejecutado(import.meta.url)) main()

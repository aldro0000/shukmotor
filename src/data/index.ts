import type { Marca, Modelo, Opinion, Veredicto } from '../types'
import { marcas, marcasPorId, logoEsClaro } from './marcas'
import { modelos, modelosALaVenta, modelosPorId, modelosProximos, todosLosModelos } from './modelos'
import { novedades, novedadesPorSlug } from './novedades'
import { opiniones, opinionesPorModelo } from './opiniones'

export { marcas, marcasPorId, logoEsClaro, modelos, modelosALaVenta, modelosProximos, modelosPorId, todosLosModelos, novedades, novedadesPorSlug, opiniones, opinionesPorModelo }

/** Tipo de cambio de referencia para mostrar "por USD X más entrás a estos". Ilustrativo. */
export const DOLAR_REFERENCIA_ARS = 1450

/** Leyenda obligatoria en toda pantalla que muestre precios. */
export const LEYENDA_DATOS = 'Datos de ejemplo'

export const marcasOrdenadas: Marca[] = [...marcas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export function getMarca(slug: string): Marca | undefined {
  return marcasPorId[slug]
}

export function getModelo(slug: string): Modelo | undefined {
  return modelosPorId[slug]
}

export function modelosDeMarca(marcaId: string): Modelo[] {
  return modelos.filter((m) => m.marcaId === marcaId).sort((a, b) => a.precioListaARS - b.precioListaARS)
}

export function opinionesDeModelo(modeloId: string): Opinion[] {
  return opinionesPorModelo[modeloId] ?? []
}

export function nombreCompleto(m: Modelo): string {
  return `${marcasPorId[m.marcaId].nombre} ${m.nombre}`
}

export const precioMinimoARS = Math.min(...modelos.map((m) => m.precioCalleARS))
export const precioMaximoARS = Math.max(...modelos.map((m) => m.precioCalleARS))

export const promedioReventa12m = Math.round(marcas.reduce((a, m) => a + m.reventa12mPct, 0) / marcas.length)
export const promedioReventa36m = Math.round(marcas.reduce((a, m) => a + m.reventa36mPct, 0) / marcas.length)

/** "Los más mirados de la semana": ids fijos, ilustrativos. */
export const masMiradosIds = [
  'toyota-hilux-srv',
  'renault-kardian-evolution',
  'byd-song-pro-dmi',
  'fiat-cronos-drive-cvt',
  'chery-tiggo-4-pro',
  'toyota-corolla-cross-xli',
  'ford-ranger-xlt',
  'volkswagen-polo-highline',
]
export const masMirados: Modelo[] = masMiradosIds.map((id) => modelosPorId[id])

const fmtARS = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const fmtNum = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

export function formatARS(n: number): string {
  return fmtARS.format(n)
}

/** "$ 31,2 M" para cards y sliders. */
export function formatMillones(n: number): string {
  const m = n / 1_000_000
  return `$ ${m.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
}

export function formatNumero(n: number): string {
  return fmtNum.format(n)
}

export function formatUSD(ars: number): string {
  const usd = Math.round(ars / DOLAR_REFERENCIA_ARS / 100) * 100
  return `USD ${fmtNum.format(usd)}`
}

export function formatDuracion(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const ETIQUETA_ORIGEN: Record<Marca['origen'], string> = {
  nacional: 'Argentina',
  brasil: 'Brasil',
  china: 'China',
  europa: 'Europa',
  japon: 'Japón',
  corea: 'Corea del Sur',
  usa: 'Estados Unidos',
  india: 'India',
}

export const ETIQUETA_SEGMENTO: Record<Modelo['segmento'], string> = {
  hatch: 'Hatchback',
  sedan: 'Sedán',
  suv: 'SUV',
  pickup: 'Pickup',
  utilitario: 'Utilitario',
  monovolumen: 'Monovolumen',
}

export const ETIQUETA_COMBUSTIBLE: Record<Modelo['combustible'], string> = {
  nafta: 'Nafta',
  diesel: 'Diésel',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
}

export const ETIQUETA_USO: Record<Modelo['usos'][number], string> = {
  ciudad: 'Ciudad',
  ruta: 'Ruta',
  familia: 'Familia',
  trabajo: 'Trabajo',
  'primer auto': 'Primer auto',
  'off-road': 'Campo u off-road',
  carga: 'Cargar mucho',
}

export { eventosCalendario, ETIQUETA_TIPO_EVENTO } from './calendario'
export { planesFinanciacion, ofertasFinanciacion, cuotaFrances, cftAproximado } from './financiacion'
export { patrocinios } from './patrocinios'

export const ETIQUETA_VEREDICTO: Record<Veredicto, string> = {
  conviene: 'Conviene',
  'con reparos': 'Con reparos',
  'no conviene': 'No conviene',
}
export {
  indiceReventaMarcas,
  indiceReventaModelos,
  indicePorMarca,
  indicePorModelo,
  METODOLOGIA_REVENTA,
  FECHA_CORTE,
  MUESTRA_CHICA,
} from './indice'
export { posventaRelevada, posventaPorMarca, METODOLOGIA_POSVENTA, FECHA_CORTE_POSVENTA } from './posventa-relevada'

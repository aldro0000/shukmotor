import type { Modelo, Uso } from '../types'
import { formatMillones, marcasPorId, modelosALaVenta, promedioReventa36m } from '../data'

/**
 * Lógica pura del buscador por presupuesto: estado en la URL, matching,
 * motivo de una línea por card, orden y filtros posteriores.
 */

export const PRESUPUESTO_MIN = 20_000_000
export const PRESUPUESTO_MAX = 140_000_000
export const PRESUPUESTO_PASO = 500_000
export const PRESUPUESTO_DEFAULT = 38_000_000

export type Requisito = 'automatica' | 'cinco-puertas' | 'baul-grande' | 'bajo-consumo' | 'electrificado' | '4x4'

export const REQUISITOS: { id: Requisito; label: string; corto: string }[] = [
  { id: 'automatica', label: 'Caja automática', corto: 'automático' },
  { id: 'cinco-puertas', label: 'Cinco puertas', corto: 'cinco puertas' },
  { id: 'baul-grande', label: 'Baúl grande', corto: 'baúl grande' },
  { id: 'bajo-consumo', label: 'Bajo consumo', corto: 'gasta poco' },
  { id: 'electrificado', label: 'Híbrido o eléctrico', corto: 'electrificado' },
  { id: '4x4', label: 'Tracción 4x4', corto: '4x4' },
]

export const USOS: { id: Uso; label: string; corto: string }[] = [
  { id: 'ciudad', label: 'Ciudad', corto: 'ciudad' },
  { id: 'ruta', label: 'Ruta', corto: 'ruta' },
  { id: 'familia', label: 'Familia', corto: 'familia' },
  { id: 'trabajo', label: 'Trabajo', corto: 'trabajo' },
  { id: 'primer auto', label: 'Primer auto', corto: 'primer auto' },
  { id: 'off-road', label: 'Campo u off-road', corto: 'campo' },
  { id: 'carga', label: 'Cargar mucho', corto: 'carga' },
]

export type Orden = 'match' | 'precio-asc' | 'precio-desc' | 'reventa' | 'opiniones' | 'consumo'
export const ORDENES: { id: Orden; label: string }[] = [
  { id: 'match', label: 'Mejor match' },
  { id: 'precio-asc', label: 'Precio: menor a mayor' },
  { id: 'precio-desc', label: 'Precio: mayor a menor' },
  { id: 'reventa', label: 'Mejor reventa' },
  { id: 'opiniones', label: 'Mejor puntuados por dueños' },
  { id: 'consumo', label: 'Menor consumo' },
]

export type Estado = {
  paso: 1 | 2 | 3 | 4
  presupuesto: number
  usado: number
  usos: Uso[]
  requisitos: Requisito[]
  orden: Orden
  segmentos: Modelo['segmento'][]
  combustibles: Modelo['combustible'][]
  tipoMarca: 'todas' | 'tradicional' | 'nueva'
}

const USOS_VALIDOS = new Set<string>(USOS.map((u) => u.id))
const REQ_VALIDOS = new Set<string>(REQUISITOS.map((r) => r.id))
const SEG_VALIDOS = new Set(['hatch', 'sedan', 'suv', 'pickup', 'utilitario', 'monovolumen'])
const COMB_VALIDOS = new Set(['nafta', 'diesel', 'hibrido', 'electrico'])
const ORDEN_VALIDOS = new Set<string>(ORDENES.map((o) => o.id))

function lista<T extends string>(raw: string | null, valid: Set<string>): T[] {
  if (!raw) return []
  return [...new Set(raw.split(',').filter((x) => valid.has(x)))] as T[]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function leerEstado(params: URLSearchParams): Estado {
  const p = Number(params.get('p'))
  const u = Number(params.get('u'))
  const pasoRaw = Number(params.get('paso'))
  const paso = ([1, 2, 3, 4] as const).includes(pasoRaw as 1) ? (pasoRaw as Estado['paso']) : params.has('p') ? 4 : 1
  return {
    paso,
    presupuesto: Number.isFinite(p) && p > 0 ? clamp(Math.round(p / PRESUPUESTO_PASO) * PRESUPUESTO_PASO, PRESUPUESTO_MIN, PRESUPUESTO_MAX) : PRESUPUESTO_DEFAULT,
    usado: Number.isFinite(u) && u > 0 ? Math.round(u) : 0,
    usos: lista<Uso>(params.get('usos'), USOS_VALIDOS),
    requisitos: lista<Requisito>(params.get('req'), REQ_VALIDOS),
    orden: (ORDEN_VALIDOS.has(params.get('orden') ?? '') ? params.get('orden') : 'match') as Orden,
    segmentos: lista(params.get('seg'), SEG_VALIDOS),
    combustibles: lista(params.get('comb'), COMB_VALIDOS),
    tipoMarca: (['tradicional', 'nueva'].includes(params.get('marca') ?? '') ? params.get('marca') : 'todas') as Estado['tipoMarca'],
  }
}

export function escribirEstado(e: Estado): URLSearchParams {
  const q = new URLSearchParams()
  q.set('p', String(e.presupuesto))
  if (e.usado) q.set('u', String(e.usado))
  if (e.usos.length) q.set('usos', e.usos.join(','))
  if (e.requisitos.length) q.set('req', e.requisitos.join(','))
  if (e.orden !== 'match') q.set('orden', e.orden)
  if (e.segmentos.length) q.set('seg', e.segmentos.join(','))
  if (e.combustibles.length) q.set('comb', e.combustibles.join(','))
  if (e.tipoMarca !== 'todas') q.set('marca', e.tipoMarca)
  if (e.paso !== 4) q.set('paso', String(e.paso))
  return q
}

export function cumpleRequisito(m: Modelo, r: Requisito): boolean {
  switch (r) {
    case 'automatica':
      return m.transmision === 'automatica'
    case 'cinco-puertas':
      return m.puertas >= 5 || (m.segmento === 'sedan' && m.puertas === 4) || m.segmento === 'pickup'
    case 'baul-grande':
      return m.baulLitros >= 420
    case 'bajo-consumo':
      return m.combustible === 'electrico' || m.combustible === 'hibrido' || m.consumoLitros100km <= 6.5
    case 'electrificado':
      return m.combustible === 'electrico' || m.combustible === 'hibrido'
    case '4x4':
      return m.traccion === '4x4' || m.traccion === 'awd'
  }
}

export type Resultado = {
  modelo: Modelo
  score: number
  motivo: string
  diferencia: number
}

/** Puntaje 0..100 y motivo en una línea. `total` es presupuesto + usado. */
export function evaluar(m: Modelo, e: Estado, total: number): Resultado {
  const marca = marcasPorId[m.marcaId]
  const diferencia = m.precioCalleARS - total
  const sobra = -diferencia

  // Precio: cuanto más cerca del presupuesto por abajo, mejor. Muy por abajo pierde algo.
  const ratio = m.precioCalleARS / total
  let sPrecio = 0
  if (ratio <= 1) sPrecio = ratio >= 0.85 ? 40 : ratio >= 0.7 ? 32 : ratio >= 0.5 ? 22 : 12
  else sPrecio = ratio <= 1.05 ? 10 : 0

  // Usos
  const usosOk = e.usos.filter((u) => m.usos.includes(u))
  const sUsos = e.usos.length ? (usosOk.length / e.usos.length) * 30 : 20

  // Requisitos (son filtro duro, pero suman por si se relajaron)
  const reqOk = e.requisitos.filter((r) => cumpleRequisito(m, r))
  const sReq = e.requisitos.length ? (reqOk.length / e.requisitos.length) * 10 : 8

  const sReventa = ((marca.reventa36mPct - 45) / (80 - 45)) * 10
  const sOp = ((m.opinionesResumen.promedio - 2.5) / 2.5) * 6
  const sPosta = m.posta.veredicto === 'conviene' ? 4 : m.posta.veredicto === 'con reparos' ? 2 : 0

  const score = Math.round(clamp(sPrecio + sUsos + sReq + sReventa + sOp + sPosta, 0, 100))

  // Motivo: precio + lo que pediste + una virtud.
  const partes: string[] = []
  if (diferencia > 0) partes.push(`te faltan ${formatMillones(diferencia)}`)
  else if (ratio >= 0.9) partes.push('entra justo')
  else if (ratio >= 0.72) partes.push('entra cómodo')
  else partes.push(`te sobran ${formatMillones(sobra)}`)

  // Lo que pediste: un requisito primero, si no un uso.
  const pedido: string[] = []
  for (const r of reqOk) pedido.push(REQUISITOS.find((x) => x.id === r)!.corto)
  for (const u of usosOk) pedido.push(`sirve para ${USOS.find((x) => x.id === u)!.corto}`)

  // Una virtud propia del auto, distinta en cada caso para que las cards no se repitan.
  let virtud = ''
  if (marca.reventa36mPct >= promedioReventa36m + 8) virtud = 'es de los que mejor mantienen valor'
  else if (m.opinionesResumen.promedio >= 4.3 && m.opinionesResumen.cantidad >= 2) virtud = `los dueños le ponen ${m.opinionesResumen.promedio.toLocaleString('es-AR')}`
  else if (m.precioCalleARS < m.precioListaARS * 0.96) virtud = 'se consigue con descuento'
  else if (m.posta.veredicto === 'conviene') virtud = 'La Posta dice que conviene'
  else if (m.entregaDias <= 7) virtud = 'hay entrega inmediata'
  else if (m.combustible === 'hibrido' || m.combustible === 'electrico') virtud = 'gasta la mitad que uno a nafta'
  else if (marca.garantiaAnios >= 5) virtud = `tiene ${marca.garantiaAnios} años de garantía`

  if (pedido.length) partes.push(pedido[0])
  if (virtud) partes.push(virtud)
  else if (pedido[1]) partes.push(pedido[1])

  const motivo =
    (partes.length > 2 ? `${partes[0]}, ${partes[1]} y ${partes[2]}` : partes.join(' y ')).replace(/^./, (c) => c.toUpperCase()) + '.'
  return { modelo: m, score, motivo, diferencia }
}

function pasaFiltros(m: Modelo, e: Estado): boolean {
  if (e.segmentos.length && !e.segmentos.includes(m.segmento)) return false
  if (e.combustibles.length && !e.combustibles.includes(m.combustible)) return false
  if (e.tipoMarca !== 'todas' && marcasPorId[m.marcaId].tipo !== e.tipoMarca) return false
  return true
}

export function ordenar(lista: Resultado[], orden: Orden): Resultado[] {
  const l = [...lista]
  switch (orden) {
    case 'precio-asc':
      return l.sort((a, b) => a.modelo.precioCalleARS - b.modelo.precioCalleARS)
    case 'precio-desc':
      return l.sort((a, b) => b.modelo.precioCalleARS - a.modelo.precioCalleARS)
    case 'reventa':
      return l.sort((a, b) => marcasPorId[b.modelo.marcaId].reventa36mPct - marcasPorId[a.modelo.marcaId].reventa36mPct || b.score - a.score)
    case 'opiniones':
      return l.sort((a, b) => b.modelo.opinionesResumen.promedio - a.modelo.opinionesResumen.promedio || b.score - a.score)
    case 'consumo':
      return l.sort((a, b) => a.modelo.consumoLitros100km - b.modelo.consumoLitros100km || b.score - a.score)
    default:
      return l.sort((a, b) => b.score - a.score || a.modelo.precioCalleARS - b.modelo.precioCalleARS)
  }
}

export type Busqueda = {
  total: number
  /** Dentro del presupuesto y con todos los requisitos */
  entran: Resultado[]
  /** Por arriba del presupuesto, los más cercanos */
  arriba: Resultado[]
  /** Por abajo, los más cercanos (solo cuando no entra nada) */
  abajo: Resultado[]
  /** Requisitos que hubo que relajar para no devolver vacío */
  relajados: Requisito[]
  /** Diferencia al más barato de "arriba" */
  saltoArriba: number
}

export function buscar(e: Estado): Busqueda {
  const total = e.presupuesto + e.usado
  const base = modelosALaVenta.filter((m) => pasaFiltros(m, e))

  let requisitos = [...e.requisitos]
  let relajados: Requisito[] = []
  let candidatos = base.filter((m) => requisitos.every((r) => cumpleRequisito(m, r)))

  // Si con los requisitos no hay nada ni cerca, se relajan de a uno (el último primero).
  while (candidatos.length === 0 && requisitos.length > 0) {
    relajados = [requisitos.pop()!, ...relajados]
    candidatos = base.filter((m) => requisitos.every((r) => cumpleRequisito(m, r)))
  }
  if (candidatos.length === 0) candidatos = base.length ? base : modelosALaVenta

  const estadoEfectivo: Estado = { ...e, requisitos }
  const evaluados = candidatos.map((m) => evaluar(m, estadoEfectivo, total))
  const entran = ordenar(evaluados.filter((r) => r.diferencia <= 0), e.orden)
  const arriba = evaluados
    .filter((r) => r.diferencia > 0)
    .sort((a, b) => a.diferencia - b.diferencia)
    .slice(0, entran.length ? 3 : 6)
  const abajo = entran.length
    ? []
    : evaluados.filter((r) => r.diferencia <= 0).sort((a, b) => b.modelo.precioCalleARS - a.modelo.precioCalleARS).slice(0, 6)

  return { total, entran, arriba, abajo, relajados, saltoArriba: arriba[0]?.diferencia ?? 0 }
}

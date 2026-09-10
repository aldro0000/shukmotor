import type { BorradorNota, MovimientoPrecio } from '../src/types'
import { movimientos, FECHA_ULTIMO_RELEVAMIENTO } from '../src/data/movimientos'
import { borradores as anteriores } from '../src/data/borradores'
import { historialPrecios } from '../src/data/historial-precios'
import { todosLosModelos } from '../src/data/modelos'
import { PRESUPUESTO_MIN, PRESUPUESTO_MAX } from '../src/lib/buscador'
import type { Radar } from './radar'
import { ejecutado, guardarJSON, guardarTS, hash, leerJSON } from './pipeline-utils'

export const dinero = (n: number | null, moneda: string) => n === null ? 'sin cotización' : `${moneda === '$' ? 'ARS' : 'USD'} ${n.toLocaleString('es-AR')}`
export function generarNotas(ms: MovimientoPrecio[], fecha: string): BorradorNota[] {
  const salida: BorradorNota[] = []
  const mes = fecha.slice(0, 7)
  const delMes = ms.filter(m => m.fecha.startsWith(mes))
  const crear = (clave: string, titulo: string, cuerpo: string, evidencia: string[]) => salida.push({
    id: `auto-${clave}-${hash(evidencia.join('|')).slice(0, 12)}`, titulo,
    bajada: 'Cambios en la guía oficial de ACARA, con sus fechas y versiones. Valores de referencia, no ofertas de concesionarias.',
    cuerpo, fecha, categoria: 'precios', origen: 'movimiento_precio', evidencia, estado: 'borrador',
  })
  if (delMes.length) {
    const subas = delMes.filter(m => m.tipo === 'suba')
    const bajas = delMes.filter(m => m.tipo === 'baja')
    crear(`mes-${mes}`, `Los precios de ${new Date(`${mes}-01T12:00:00Z`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}: qué subió y qué bajó`,
      `En los relevamientos de este mes detectamos ${subas.length} subas y ${bajas.length} bajas de versiones en la guía de ACARA. Una baja de referencia no prueba un descuento comercial.\n\n` +
      'Entre los cambios registrados:\n\n' + [...subas, ...bajas].slice(0, 12).map(m => `${m.marca} ${m.modelo} ${m.version}: ${dinero(m.precioAnterior, m.moneda)} → ${dinero(m.precioLista, m.moneda)} (${m.porcentaje}%), relevado el ${m.fecha}.`).join('\n\n'), [`src/data/movimientos.ts:mes=${mes}`, ...delMes.slice(0, 12).map(m => m.id)])
  }
  for (const m of delMes.filter(m => m.tipo === 'version_nueva')) {
    crear(`version-${m.id}`, `Apareció ${m.marca} ${m.modelo} ${m.version} en la lista oficial`,
      `La versión figura con referencia ${dinero(m.precioLista, m.moneda)} en el relevamiento del ${m.fecha}. No tenía cotización 0km en el estado anterior.\n\nEsto describe un cambio en la guía de ACARA; no confirma un lanzamiento, disponibilidad comercial ni que no se hubiera anunciado antes.`, [m.id])
  }
  for (const marca of new Set(delMes.map(m => m.marca))) {
    const subas = ms.filter(m => m.marca === marca && m.tipo === 'suba' && m.fecha.startsWith(fecha.slice(0, 4)) && m.fecha <= fecha)
    const fechas = [...new Set(subas.map(m => m.fecha))]
    if (fechas.length >= 3) crear(`frecuencia-${mes}-${hash(marca).slice(0, 8)}`, `${marca}: versiones con aumentos en ${fechas.length} relevamientos del año`,
      `Encontramos subas de una o más versiones de ${marca} en ${fechas.length} fechas distintas: ${fechas.join(', ')}. Se cuentan fechas de relevamiento, no versiones, y no se infiere una suba de toda la marca.`, subas.map(m => m.id))
  }
  return salida
}
export function generarBorradores() {
  const vistos = leerJSON<string[]>('data/borradores-vistos.json', [])
  const conocidos = new Set([...vistos, ...anteriores.map(n => n.id)])
  const notas = generarNotas(movimientos, FECHA_ULTIMO_RELEVAMIENTO)
  const mes = FECHA_ULTIMO_RELEVAMIENTO.slice(0, 7)
  const previo = new Date(`${mes}-01T12:00:00Z`); previo.setUTCMonth(previo.getUTCMonth() - 1)
  const mesAnterior = previo.toISOString().slice(0, 7)
  for (const presupuesto of [35, 45, 60, 80].map(n => n * 1e6).filter(n => n >= PRESUPUESTO_MIN && n <= PRESUPUESTO_MAX)) {
    const entran = historialPrecios.flatMap(s => {
      const catalogo = todosLosModelos.find(m => m.slug === s.modeloSlug)
      if (!s.vigente || s.moneda !== '$' || !catalogo?.visible || catalogo.estado !== 'vigente') return []
      const antes = s.puntos.filter(p => p.fecha.startsWith(mesAnterior)).at(-1)
      const ahora = s.puntos.filter(p => p.fecha.startsWith(mes)).at(-1)
      return antes && ahora && antes.precio > presupuesto && ahora.precio <= presupuesto ? [{ s, antes, ahora }] : []
    })
    if (!entran.length) continue
    const evidencia = entran.map(e => `${e.s.id}:${e.antes.fecha}:${e.ahora.fecha}:${e.ahora.precio}`)
    notas.push({ id: `auto-presupuesto-${presupuesto}-${hash(evidencia.join('|')).slice(0, 12)}`, titulo: `Con ${presupuesto / 1e6} millones: versiones que ahora entran en la referencia de ACARA`,
      bajada: 'Comparación entre el último registro de cada mes. La referencia oficial puede diferir del precio de calle.', fecha: FECHA_ULTIMO_RELEVAMIENTO,
      cuerpo: entran.map(e => `${e.s.marca} ${e.s.modelo} ${e.s.version}: ${dinero(e.antes.precio, '$')} el ${e.antes.fecha} y ${dinero(e.ahora.precio, '$')} el ${e.ahora.fecha}.`).join('\n\n') + '\n\nUsamos los límites del buscador y modelos vigentes del catálogo. Las versiones son las de ACARA; el buscador usa precios de calle, que pueden ser diferentes.',
      categoria: 'precios', origen: 'movimiento_precio', evidencia, estado: 'borrador' })
  }
  const nuevos = notas.filter(n => !conocidos.has(n.id)).slice(0, 8)
  guardarTS('src/data/borradores.ts', 'BorradorNota', 'borradores', [...anteriores, ...nuevos])
  guardarJSON('data/.tmp/borradores-nuevos.json', nuevos)
  guardarJSON('data/.tmp/borradores-vistos.json', [...new Set([...vistos, ...nuevos.map(n => n.id)])])
  const radar = leerJSON<Radar>('data/.tmp/radar.json', { entradas: [], errores: [] })
  // El cruce sólo orienta la revisión en el PR; nunca lleva titulares ajenos al sitio.
  guardarJSON('data/.tmp/cruces.json', radar.entradas.filter(e => e.modelos.some(s => movimientos.some(m => m.modeloSlug === s))).map(e => e.link))
  console.log(`${nuevos.length} borradores nuevos, ${radar.entradas.length} referencias externas para revisión`)
}
if (ejecutado(import.meta.url)) generarBorradores()

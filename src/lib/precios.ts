import type { MovimientoPrecio } from '../types'

export const FUENTE_ACARA = 'https://www.acaramotos.org.ar/guia-oficial-de-precios.php?tipo=AUTOS'
export const precioOficial = (n: number, moneda: string) => `${moneda === '$' ? 'ARS' : 'USD'} ${n.toLocaleString('es-AR')}`
export const fechaPrecio = (fecha: string) => new Date(`${fecha.slice(0, 10)}T12:00:00Z`).toLocaleDateString('es-AR', { timeZone: 'UTC' })
export function ultimos30(ms: MovimientoPrecio[], fecha: string): MovimientoPrecio[] {
  const hasta = Date.parse(fecha)
  return ms.filter(m => Date.parse(m.fecha) <= hasta && Date.parse(m.fecha) >= hasta - 30 * 86400000)
}
export function resumenModelo(ms: MovimientoPrecio[], slug: string): string | null {
  const cambios = ms.filter(m => m.modeloSlug === slug && ['suba', 'baja'].includes(m.tipo) && m.porcentaje !== null)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ultimo = cambios[0]
  if (!ultimo) return null
  const fechas = new Set(cambios.filter(m => m.version === ultimo.version && m.moneda === ultimo.moneda && m.tipo === 'suba' && Date.parse(m.fecha) >= Date.parse(ultimo.fecha) - 60 * 86400000).map(m => m.fecha))
  return `ACARA · versión ${ultimo.version}: ${ultimo.tipo === 'suba' ? 'aumentó' : 'bajó'} ${Math.abs(ultimo.porcentaje!).toLocaleString('es-AR')}% el ${fechaPrecio(ultimo.fecha)}.${ultimo.tipo === 'suba' && fechas.size > 1 ? ` ${fechas.size} relevamientos con subas en 60 días.` : ''} La coincidencia con esta ficha es por modelo, no por versión exacta.`
}

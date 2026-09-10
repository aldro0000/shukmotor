/**
 * Precios en pesos o en dólares, con una sola fuente de verdad.
 *
 * Todos los precios del catálogo están guardados en pesos. Acá vive la moneda
 * elegida y la cotización, y de acá los leen los formateadores de `data/index`,
 * así que cambiar de moneda no obliga a tocar los sesenta y pico de lugares que
 * muestran plata.
 *
 * Es un módulo sin React a propósito: `lib/encaje` arma frases con montos
 * adentro y no es un componente. El proveedor de React escribe acá y fuerza el
 * re-render; los que leen no necesitan saber nada de eso.
 */

export type Moneda = 'ARS' | 'USD'

/**
 * Si la API no contesta se usa este valor y la app lo dice en pantalla. Nunca
 * se muestra un número viejo como si fuera de hoy.
 */
export const DOLAR_RESPALDO = 1535

type Estado = { moneda: Moneda; dolar: number }

let actual: Estado = { moneda: 'ARS', dolar: DOLAR_RESPALDO }

/** La escribe el proveedor de React. Nadie más debería llamarla. */
export function fijarMoneda(e: Estado): void {
  actual = e
}

export function monedaActual(): Estado {
  return actual
}

/**
 * Una firma que cambia cuando cambia lo que afecta a los textos con plata
 * adentro. Sirve para invalidar lo que se calcula una sola vez.
 */
export function firmaMoneda(): string {
  return `${actual.moneda}-${actual.dolar}`
}

const fmt = (n: number, dec: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec })

/**
 * Formato corto, el de las cards y los sliders. En pesos va en millones,
 * en dólares en miles: son las unidades en las que la gente piensa el precio
 * de un auto en cada moneda.
 */
export function formatCorto(ars: number): string {
  if (actual.moneda === 'USD') return `US$ ${fmt(ars / actual.dolar / 1000, 1)} mil`
  return `$ ${fmt(ars / 1_000_000, 1)} M`
}

/** Formato largo, con todos los dígitos. Para el precio de lista y los totales. */
export function formatLargo(ars: number): string {
  if (actual.moneda === 'USD') return `US$ ${fmt(Math.round(ars / actual.dolar), 0)}`
  return `$ ${fmt(Math.round(ars), 0)}`
}

/**
 * Un monto siempre en dólares, sin importar la moneda elegida. Lo usa la línea
 * de "por USD X más entrás a estos", que compara contra el dólar por diseño.
 */
export function formatDolares(ars: number): string {
  const usd = Math.round(ars / actual.dolar / 100) * 100
  return `USD ${fmt(usd, 0)}`
}

/** La unidad en la que se piden montos a mano: millones o miles. */
export function unidadCorta(): string {
  return actual.moneda === 'USD' ? 'miles' : 'millones'
}

/** Cuántos pesos vale una unidad de la escala corta. */
export function pasoUnidad(): number {
  return actual.moneda === 'USD' ? actual.dolar * 1000 : 1_000_000
}

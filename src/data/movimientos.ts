// Se genera con `npm run diff:precios`. No editar a mano: se pisa en cada corrida.
import type { MovimientoPrecio } from '../types'

/** Último relevamiento: 2026-09-10, fuente https://www.acaramotos.org.ar/guia-oficial-de-precios.php?tipo=AUTOS */
export const FECHA_ULTIMO_RELEVAMIENTO = '2026-09-10'

export const movimientos: MovimientoPrecio[] = []

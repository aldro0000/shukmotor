import type { IndiceReventaMarca, IndiceReventaModelo } from '../types'
import { marcas } from './marcas'

/**
 * Índice de reventa SHUKMOTOR. Datos de ejemplo.
 *
 * Regla de diseño: cada fila lleva país, fecha de corte, muestra y fuentes.
 * Sumar un país es sumar filas, no rehacer el modelo. Las marcas con menos
 * de 30 usados relevados se muestran con la etiqueta "muestra chica" y las
 * que no tienen usados de 2 o 3 años quedan en null: publicamos lo que
 * podemos sostener, no lo que queda lindo.
 */

export const FECHA_CORTE = '2026-09-01'

export const METODOLOGIA_REVENTA = {
  resumen:
    'Comparamos el precio pedido por usados de 12, 24 y 36 meses contra el precio de calle del mismo modelo 0km hoy. El resultado es el porcentaje del valor que conserva el auto.',
  pasos: [
    'Relevamos todos los meses los avisos de usados de cada marca en los tres portales más grandes del país y en concesionarias de usados de CABA, Córdoba, Rosario y Mendoza.',
    'Tomamos solo avisos con año, kilometraje y versión identificables. Descartamos los que superan 25.000 km por año o tienen precio fuera de dos desvíos de la mediana.',
    'Usamos la mediana, no el promedio, para que un aviso absurdo no mueva el número.',
    'El precio de referencia del 0km es el precio de calle que publicamos en la ficha, no el de lista, porque es lo que se paga de verdad.',
    'Cada corte guarda la muestra. Con menos de 30 avisos marcamos "muestra chica" y con menos de 10 no publicamos el número.',
    'Las marcas que llegaron hace menos de dos años no tienen dato a 24 ni a 36 meses. Ese vacío es información: nadie sabe todavía cuánto van a valer.',
  ],
  limites: [
    'Medimos precio pedido, no precio de venta. Es la misma limitación que tiene cualquier índice basado en avisos.',
    'Los porcentajes de otros países no son comparables: cada mercado mide con plazos y bases distintas.',
    'El índice es descriptivo. No es una recomendación de compra ni de venta.',
  ],
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const MESES_SERIE = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']

const FUENTES_BASE = ['MercadoLibre', 'Kavak', 'Autocosmos usados']
const FUENTES_CON_CONCESIONARIAS = [...FUENTES_BASE, 'Concesionarias de usados (CABA, Córdoba, Rosario, Mendoza)']

const NOTAS: Record<string, string> = {
  toyota: 'La Hilux y el Corolla Cross sostienen el índice: hay meses en que un usado de un año se pide por encima del 0km de lista por la demora de entrega.',
  chery: 'Es la marca china con más historia en el país y la única con muestra grande a 36 meses. Mejora despacio desde 2024.',
  haval: 'Muestra creciente desde el H6 híbrido. La caída a 12 meses se achicó cuatro puntos en el último año.',
  byd: 'Sin usados de 24 meses todavía. La muestra a 12 meses crece rápido y por ahora sostiene mejor que otras chinas nuevas.',
  jaecoo: 'Marca con menos de dos años en el país. Publicamos solo 12 meses y con muestra chica.',
  omoda: 'Marca con menos de dos años en el país. Publicamos solo 12 meses y con muestra chica.',
  gwm: 'La Poer tiene más avisos que el resto de la gama. La retención a 12 meses es la mejor entre pickups chinas.',
  baic: 'Muestra chica. Los avisos se concentran en CABA y GBA.',
  dfsk: 'De las retenciones más bajas del índice. Hay muchos avisos de flota con alto kilometraje que descartamos.',
  jac: 'Mucha muestra en pickups T8. Retención baja pero estable desde hace dos años.',
  leapmotor: 'Menos de 10 avisos a 12 meses en el último corte. No publicamos número.',
  'lynk-co': 'Menos de 10 avisos a 12 meses en el último corte. No publicamos número.',
  xpeng: 'Menos de 10 avisos a 12 meses en el último corte. No publicamos número.',
  changan: 'Marca con menos de dos años. Muestra chica a 12 meses.',
  dongfeng: 'Muestra chica, concentrada en Rich 6 de trabajo.',
  mg: 'Muestra creciente. El MG4 eléctrico pierde más que el ZS.',
  ford: 'La Ranger sostiene la marca. Los autos de pasajeros importados pierden bastante más.',
  volkswagen: 'Amarok y Taos son lo que mejor retiene. Los Polo con mucho kilometraje bajan el promedio.',
}

export const indiceReventaMarcas: IndiceReventaMarca[] = marcas.map((m) => {
  const h = hash(m.id)
  const anios = 2026 - m.anioLlegada
  const tradicional = m.tipo === 'tradicional'
  const baseMuestra = tradicional ? 120 + (h % 900) : 6 + (h % 60)
  const muestra = m.talleresOficiales >= 80 ? baseMuestra + 400 : baseMuestra
  const r12 = m.reventa12mPct
  const sinDato = muestra < 10
  const r24 = anios >= 2 && !sinDato ? Math.round((r12 + m.reventa36mPct) / 2) : null
  const r36 = anios >= 3 && !sinDato ? m.reventa36mPct : null
  // Serie: tendencia leve, determinística, alrededor del valor actual.
  const tendencia = ((h >> 3) % 5) - 2 // -2..2 puntos en seis meses
  const serie = MESES_SERIE.map((mes, i) => {
    const ruido = (((h >> (i * 2)) % 3) - 1) * 0.5
    return { mes, retencion12m: Math.round((r12 - tendencia * (1 - i / 5) + ruido) * 10) / 10 }
  })
  return {
    pais: 'AR',
    marcaId: m.id,
    fechaCorte: FECHA_CORTE,
    muestra,
    fuentes: m.talleresOficiales >= 30 ? FUENTES_CON_CONCESIONARIAS : FUENTES_BASE,
    retencion12m: sinDato ? null : r12,
    retencion24m: r24,
    retencion36m: r36,
    serie: sinDato ? [] : serie,
    nota: NOTAS[m.id],
  }
})

export const indiceReventaModelos: IndiceReventaModelo[] = [
  { pais: 'AR', modeloSlug: 'chery-tiggo-4-pro', fechaCorte: FECHA_CORTE, muestra: 184, retencion12m: 78, retencion24m: 66 },
  { pais: 'AR', modeloSlug: 'chery-tiggo-7-pro', fechaCorte: FECHA_CORTE, muestra: 96, retencion12m: 76, retencion24m: 63 },
  { pais: 'AR', modeloSlug: 'chery-tiggo-8-pro', fechaCorte: FECHA_CORTE, muestra: 41, retencion12m: 74, retencion24m: 61 },
  { pais: 'AR', modeloSlug: 'chery-tiggo-2-pro', fechaCorte: FECHA_CORTE, muestra: 122, retencion12m: 75, retencion24m: 62 },
  { pais: 'AR', modeloSlug: 'haval-jolion', fechaCorte: FECHA_CORTE, muestra: 88, retencion12m: 77, retencion24m: 64 },
  { pais: 'AR', modeloSlug: 'haval-h6-hev', fechaCorte: FECHA_CORTE, muestra: 37, retencion12m: 79, retencion24m: null, nota: 'Sin usados de 24 meses: llegó a fines de 2024.' },
  { pais: 'AR', modeloSlug: 'gwm-poer-elite', fechaCorte: FECHA_CORTE, muestra: 64, retencion12m: 80, retencion24m: null },
  { pais: 'AR', modeloSlug: 'byd-song-pro-dmi', fechaCorte: FECHA_CORTE, muestra: 29, retencion12m: 81, retencion24m: null, nota: 'Muestra chica.' },
  { pais: 'AR', modeloSlug: 'byd-dolphin-mini', fechaCorte: FECHA_CORTE, muestra: 52, retencion12m: 76, retencion24m: null },
  { pais: 'AR', modeloSlug: 'byd-yuan-pro', fechaCorte: FECHA_CORTE, muestra: 33, retencion12m: 77, retencion24m: null },
  { pais: 'AR', modeloSlug: 'jaecoo-j7', fechaCorte: FECHA_CORTE, muestra: 18, retencion12m: 77, retencion24m: null, nota: 'Muestra chica.' },
  { pais: 'AR', modeloSlug: 'omoda-c5', fechaCorte: FECHA_CORTE, muestra: 21, retencion12m: 75, retencion24m: null, nota: 'Muestra chica.' },
  { pais: 'AR', modeloSlug: 'mg-zs-comfort', fechaCorte: FECHA_CORTE, muestra: 34, retencion12m: 77, retencion24m: null },
  { pais: 'AR', modeloSlug: 'mg-4-electrico', fechaCorte: FECHA_CORTE, muestra: 15, retencion12m: 70, retencion24m: null, nota: 'Muestra chica. Los eléctricos pierden más que los nafteros de la misma marca.' },
  { pais: 'AR', modeloSlug: 'baic-x55', fechaCorte: FECHA_CORTE, muestra: 23, retencion12m: 73, retencion24m: null, nota: 'Muestra chica.' },
  { pais: 'AR', modeloSlug: 'jac-t8-plus', fechaCorte: FECHA_CORTE, muestra: 71, retencion12m: 72, retencion24m: 58 },
  { pais: 'AR', modeloSlug: 'dfsk-glory-500', fechaCorte: FECHA_CORTE, muestra: 58, retencion12m: 69, retencion24m: 54 },
  { pais: 'AR', modeloSlug: 'changan-hunter', fechaCorte: FECHA_CORTE, muestra: 16, retencion12m: 73, retencion24m: null, nota: 'Muestra chica.' },
  { pais: 'AR', modeloSlug: 'toyota-hilux-srv', fechaCorte: FECHA_CORTE, muestra: 640, retencion12m: 95, retencion24m: 88, nota: 'Referencia del mercado. Se incluye para comparar.' },
  { pais: 'AR', modeloSlug: 'toyota-corolla-cross-xli', fechaCorte: FECHA_CORTE, muestra: 310, retencion12m: 92, retencion24m: 84, nota: 'Referencia del mercado. Se incluye para comparar.' },
  { pais: 'AR', modeloSlug: 'volkswagen-taos-comfortline', fechaCorte: FECHA_CORTE, muestra: 145, retencion12m: 86, retencion24m: 76, nota: 'Referencia del mercado. Se incluye para comparar.' },
  { pais: 'AR', modeloSlug: 'jeep-compass-longitude', fechaCorte: FECHA_CORTE, muestra: 210, retencion12m: 83, retencion24m: 72, nota: 'Referencia del mercado. Se incluye para comparar.' },
]

export const indicePorMarca: Record<string, IndiceReventaMarca> = Object.fromEntries(indiceReventaMarcas.map((i) => [i.marcaId, i]))
export const indicePorModelo: Record<string, IndiceReventaModelo> = Object.fromEntries(indiceReventaModelos.map((i) => [i.modeloSlug, i]))

export const MUESTRA_CHICA = 30

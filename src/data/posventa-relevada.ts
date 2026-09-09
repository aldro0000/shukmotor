import type { PosventaRelevada } from '../types'
import { marcas } from './marcas'

/**
 * Relevamiento propio de posventa. Datos de ejemplo.
 * Lo que las marcas declaran (talleres, stock, cumplimiento) nadie lo verifica.
 * Acá va lo que medimos del otro lado del mostrador: llamadas, presupuestos
 * y tiempos de espera reales, con la muestra a la vista.
 */

export const FECHA_CORTE_POSVENTA = '2026-08-15'

export const METODOLOGIA_POSVENTA = {
  resumen:
    'Llamamos a talleres oficiales de cada marca haciéndonos pasar por dueños, pedimos presupuesto para el service de 10.000 km del modelo más vendido y preguntamos cuánto tarda un repuesto de desgaste y una pieza de carrocería.',
  pasos: [
    'Elegimos talleres al azar de la lista oficial de cada marca, repartidos entre CABA, GBA, Córdoba, Santa Fe, Mendoza y una provincia del norte y otra del sur.',
    'Cada taller se llama dos veces en días distintos. Si no atiende ninguna de las dos, cuenta como "no respondió".',
    'Preguntamos tres cosas: turno más cercano para service, precio del service de 10.000 km y demora para pastillas de freno delanteras y para una óptica delantera.',
    'Anotamos lo que dice el taller, no lo que dice la marca. Si el taller dice "hay que pedirlo a Buenos Aires, 20 días", anotamos 20 días.',
    'Publicamos la mediana por marca, cuántos talleres llamamos y cuántos respondieron. Una marca con 5 talleres llamados no se compara igual que una con 40.',
  ],
  limites: [
    'Es una foto del mes del corte. La disponibilidad de repuestos cambia con cada embarque.',
    'Preguntamos por dos piezas. Un repuesto raro puede tardar mucho más en cualquier marca.',
    'Lo repetimos dos veces por año. La serie va a valer más cuanto más corra.',
  ],
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const NOTAS: Record<string, string> = {
  toyota: 'Todos los talleres tenían pastillas en stock. Ópticas de Hilux, entre 2 y 5 días.',
  chery: 'Piezas de desgaste sin problema. Ópticas de Tiggo 7 con demora de dos a tres semanas en el interior.',
  haval: 'Buena respuesta telefónica. Carrocería del H6 entre 15 y 25 días.',
  byd: 'Los talleres respondieron todos. Repuestos de carrocería "a pedido a la casa central", 20 a 30 días.',
  jaecoo: 'Comparte red con Chery. Presupuesto de service más caro que el Tiggo 7 con la misma mecánica.',
  omoda: 'Comparte red con Chery. Óptica del C5 sin stock en ningún taller llamado.',
  gwm: 'Poer: pastillas en stock en la mayoría. Paragolpes con 30 días de demora.',
  baic: 'Dos de siete talleres no atendieron en dos llamados. Repuestos vía importador.',
  dfsk: 'Presupuestos muy dispares entre talleres para el mismo service. Óptica de Glory 500 sin fecha en tres talleres.',
  jac: 'Red chica pero responde. Repuestos de T8 en stock en Buenos Aires, 10 a 15 días en el interior.',
  leapmotor: 'Red de Stellantis: responden, pero el repuesto del C10 es "a consultar".',
  'lynk-co': 'Tres talleres, todos respondieron. Repuestos importados con 30 a 45 días.',
  xpeng: 'Un taller en CABA. Óptica sin fecha. No hay dato de service porque el auto no tiene service tradicional.',
  changan: 'Repuestos de Hunter en Buenos Aires con 10 días. En el interior, 20 a 30.',
  dongfeng: 'Red mínima. Rich 6: pastillas en stock, carrocería a 30 días.',
  foton: 'Red de camiones que también atiende la pickup. Buena respuesta en repuestos mecánicos.',
  fiat: 'La red más grande del país y el service más barato relevado en Cronos.',
  volkswagen: 'Turnos rápidos en CABA, hasta 12 días en el interior en temporada de service.',
  renault: 'Red enorme. Presupuestos parejos entre talleres.',
  chevrolet: 'Muy dispar entre concesionarias: el mismo service de Onix varía hasta 40 por ciento.',
  ford: 'Ranger con repuestos en stock en casi todos. Territory: carrocería importada, 20 días.',
  'alfa-romeo': 'Nueve talleres, siete respondieron. Repuestos de Tonale a 30 a 60 días.',
}

export const posventaRelevada: PosventaRelevada[] = marcas.map((m) => {
  const h = hash(`pv-${m.id}`)
  const llamados = Math.max(1, Math.min(40, Math.round(m.talleresOficiales * 0.35)))
  const tasaRespuesta = m.tipo === 'nueva' ? 0.7 + (h % 25) / 100 : 0.8 + (h % 20) / 100
  const respondieron = Math.max(1, Math.min(llamados, Math.round(llamados * tasaRespuesta)))
  const china = m.origen === 'china'
  const premium = ['audi', 'bmw', 'mercedes-benz', 'volvo', 'lexus', 'alfa-romeo', 'land-rover', 'mini', 'ds', 'subaru', 'smart', 'lynk-co'].includes(m.id)
  const grande = m.talleresOficiales >= 80
  const diasComun = grande ? 1 + (h % 3) : china && m.tipo === 'nueva' ? 7 + (h % 10) : china ? 4 + (h % 6) : 3 + (h % 5)
  const diasCarroceria = grande ? 4 + (h % 6) : china && m.tipo === 'nueva' ? 25 + (h % 20) : china ? 14 + (h % 12) : premium ? 20 + (h % 25) : 8 + (h % 10)
  const service = premium ? 520000 + (h % 200000) : grande ? 240000 + (h % 90000) : 300000 + (h % 120000)
  const turno = grande ? 3 + (h % 6) : 5 + (h % 10)
  const stock = Math.max(0, Math.min(respondieron, Math.round(respondieron * (grande ? 0.95 : china && m.tipo === 'nueva' ? 0.45 : china ? 0.7 : 0.8))))
  const sinDatoCarroceria = respondieron <= 2 && m.tipo === 'nueva'
  return {
    pais: 'AR',
    marcaId: m.id,
    fechaCorte: FECHA_CORTE_POSVENTA,
    talleresLlamados: llamados,
    talleresRespondieron: respondieron,
    diasRepuestoComun: diasComun,
    diasRepuestoCarroceria: sinDatoCarroceria ? null : diasCarroceria,
    presupuestoServiceARS: ['xpeng', 'avatr', 'spinner'].includes(m.id) ? null : Math.round(service / 1000) * 1000,
    diasTurno: turno,
    stockEnMostrador: stock,
    nota: NOTAS[m.id],
  }
})

export const posventaPorMarca: Record<string, PosventaRelevada> = Object.fromEntries(posventaRelevada.map((p) => [p.marcaId, p]))

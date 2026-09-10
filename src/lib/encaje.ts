import type { Modelo } from '../types'
import {
  ETIQUETA_SEGMENTO,
  formatARS,
  formatMillones,
  formatNumero,
  indicePorMarca,
  marcasPorId,
  posventaPorMarca,
  promedioReventa36m,
  todosLosModelos,
} from '../data'
import { firmaMoneda } from './moneda'

/**
 * Juicio de ENCAJE, no de calidad.
 *
 * Un auto no es bueno ni malo: le sirve a alguien y no le sirve a otro. Este
 * módulo arma, para cada modelo, tres razones para comprarlo y tres para no,
 * derivadas de su propio dato. Que salgan del dato y no de la opinión garantiza
 * dos cosas: que ninguna ficha quede sin contras, y que cada línea diga algo
 * comprobable en vez de un adjetivo que no podemos sostener.
 */

export type Linea = { texto: string; peso: number }

type Ctx = {
  m: Modelo
  marca: ReturnType<typeof marcasPorId.toString> extends never ? never : (typeof marcasPorId)[string]
  reventa36: number | null
  reventa12: number | null
  diasCarroceria: number | null
  diasRepuesto: number | null
  sobreprecio: number
  segmento: string
}

function contexto(m: Modelo): Ctx {
  const marca = marcasPorId[m.marcaId]
  const idx = indicePorMarca[m.marcaId]
  const pv = posventaPorMarca[m.marcaId]
  return {
    m,
    marca,
    reventa36: idx?.retencion36m ?? null,
    reventa12: idx?.retencion12m ?? null,
    diasCarroceria: pv?.diasRepuestoCarroceria ?? null,
    diasRepuesto: pv?.diasRepuestoComun ?? null,
    sobreprecio: m.precioCalleARS - m.precioListaARS,
    segmento: ETIQUETA_SEGMENTO[m.segmento].toLowerCase(),
  }
}

/** Kilómetros anuales a partir de los cuales el consumo empieza a pesar. */
const KM_ANUALES = 15000

function razonesAFavor(c: Ctx): Linea[] {
  const { m, marca } = c
  const l: Linea[] = []

  // Consumo
  if (m.combustible === 'electrico') {
    l.push({ texto: `cargás en casa: gasta ${m.consumoLitros100km.toLocaleString('es-AR')} kWh cada 10 km, una fracción de lo que sale la nafta`, peso: 95 })
  } else if (m.combustible === 'hibrido') {
    l.push({ texto: `hacés más de ${formatNumero(KM_ANUALES)} km por año: consume ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, peso: 92 })
  } else if (m.consumoLitros100km <= 6.5) {
    l.push({ texto: `mirás la nafta: consume ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100 km`, peso: 80 })
  }

  // Caja automática y precio
  if (m.transmision === 'automatica' && m.precioCalleARS <= 40_000_000) {
    l.push({ texto: `querés caja automática por menos de ${formatMillones(40_000_000)}`, peso: 88 })
  } else if (m.transmision === 'automatica') {
    l.push({ texto: `no querés manejar con embrague: es automático y cuesta ${formatMillones(m.precioCalleARS)}`, peso: 55 })
  }

  // Espacio
  if (m.plazas >= 7) l.push({ texto: `son ${m.plazas} plazas de verdad, no dos asientos de emergencia`, peso: 90 })
  if (m.segmento !== 'pickup' && m.baulLitros >= 500) l.push({ texto: `viajás con equipaje: el baúl es de ${formatNumero(m.baulLitros)} litros`, peso: 78 })
  if (m.segmento === 'pickup' && m.baulLitros >= 1000) l.push({ texto: `cargás en serio: soporta ${formatNumero(m.baulLitros)} kilos`, peso: 85 })

  // Campo
  if (m.traccion === '4x4') l.push({ texto: `salís del asfalto seguido: es 4x4 y no una tracción simulada`, peso: 86 })
  else if (m.traccion === 'awd') l.push({ texto: `manejás en ripio o lluvia: tiene tracción integral en las 4 ruedas`, peso: 70 })

  // Reventa
  if (c.reventa36 !== null && c.reventa36 >= promedioReventa36m + 6) {
    l.push({ texto: `lo vas a revender: conserva el ${c.reventa36}% del valor a los tres años, ${c.reventa36 - promedioReventa36m} puntos sobre el promedio`, peso: 94 })
  }

  // Red
  if (marca.talleresOficiales >= 80) l.push({ texto: `vivís lejos de una capital: hay ${marca.talleresOficiales} talleres oficiales en el país`, peso: 82 })
  if (c.diasRepuesto !== null && c.diasRepuesto <= 2) l.push({ texto: `no podés quedarte sin el auto: las pastillas estaban en mostrador en ${c.diasRepuesto} de cada 2 talleres que llamamos`, peso: 68 })

  // Garantía
  if (marca.garantiaAnios >= 5) l.push({ texto: `te sirve la garantía de ${marca.garantiaAnios} años o ${formatNumero(marca.garantiaKm)} km`, peso: 76 })

  // Plata
  if (c.sobreprecio < -500_000) l.push({ texto: `negociás: se está consiguiendo ${formatMillones(-c.sobreprecio)} por debajo de lista`, peso: 72 })
  if (m.entregaDias <= 7) l.push({ texto: `lo necesitás ya: se entrega en unos ${m.entregaDias} días`, peso: 66 })

  // Usos declarados
  if (m.usos.includes('primer auto')) l.push({ texto: `es un primer auto: el service oficial cuesta ${formatARS(m.posventa.costoServiceARS)}`, peso: 60 })
  if (m.usos.includes('trabajo')) l.push({ texto: `lo usás para trabajar: el service es cada ${formatNumero(m.posventa.intervaloKm)} km`, peso: 58 })
  if (m.usos.includes('ciudad') && m.usos.length <= 2) l.push({ texto: `andás casi todo en ciudad: consume ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, peso: 62 })

  // Service
  if (m.posventa.intervaloKm >= 15000) l.push({ texto: `hacés muchos kilómetros: el service es cada ${formatNumero(m.posventa.intervaloKm)} km`, peso: 54 })
  if (m.posventa.costoServiceARS <= 300_000) l.push({ texto: `el service oficial cuesta ${formatARS(m.posventa.costoServiceARS)}, de los más baratos`, peso: 52 })

  // Red mediana, como respaldo
  if (marca.talleresOficiales >= 30 && marca.talleresOficiales < 80) {
    l.push({ texto: `tenés concesionario cerca: la marca tiene ${marca.talleresOficiales} talleres`, peso: 44 })
  }

  // Más candidatos con dato, para que los respaldos casi nunca lleguen arriba.
  if (m.baulLitros >= 400 && m.baulLitros < 500 && m.segmento !== 'pickup') {
    l.push({ texto: `te alcanzan ${formatNumero(m.baulLitros)} litros de baúl para el uso diario`, peso: 48 })
  }
  if (m.puertas >= 5) l.push({ texto: `subís gente atrás seguido: tiene ${m.puertas} puertas`, peso: 42 })
  if (m.entregaDias <= 14 && m.entregaDias > 7) l.push({ texto: `podés esperar ${m.entregaDias} días de entrega`, peso: 40 })
  if (m.consumoLitros100km > 6.5 && m.consumoLitros100km <= 8) {
    l.push({ texto: `hacés menos de ${formatNumero(KM_ANUALES)} km por año: consume ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, peso: 50 })
  }
  if (marca.provinciasConService.length >= 20) {
    l.push({ texto: `viajás por el país: hay service oficial en ${marca.provinciasConService.length} de 24 provincias`, peso: 56 })
  }
  if (m.combustible === 'diesel') l.push({ texto: `hacés mucha ruta: es diésel y rinde ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, peso: 64 })

  // Respaldos universales: siempre hay al menos tres, y todos con un dato.
  l.push({ texto: `entrás con ${formatMillones(m.precioCalleARS)} y no querés estirarte más`, peso: 30 })
  l.push({ texto: `buscás un ${c.segmento} de ${m.plazas} plazas y ${m.puertas} puertas`, peso: 22 })
  l.push({ texto: `te sirve un ${m.motor.split(',')[0].trim()}`, peso: 16 })

  return l
}

function razonesEnContra(c: Ctx): Linea[] {
  const { m, marca } = c
  const l: Linea[] = []

  // Reventa: la contra más dura y la que nadie más publica.
  if (c.reventa36 !== null && c.reventa36 <= promedioReventa36m - 5) {
    l.push({ texto: `lo vas a cambiar antes de los tres años: conserva el ${c.reventa36}% del valor, ${promedioReventa36m - c.reventa36} puntos abajo del promedio`, peso: 96 })
  } else if (c.reventa36 === null && c.reventa12 !== null) {
    l.push({ texto: `te importa cuánto va a valer: la marca llegó en ${marca.anioLlegada} y todavía no hay usados de 3 años para medirla`, peso: 92 })
  } else if (c.reventa36 === null) {
    l.push({ texto: `te importa la reventa: hay menos de 10 usados relevados y no publicamos un número que no se sostiene`, peso: 94 })
  }

  // Red
  if (marca.talleresOficiales < 20) {
    l.push({ texto: `vivís lejos de CABA o Córdoba: la marca tiene ${marca.talleresOficiales} talleres oficiales en todo el país`, peso: 90 })
  }
  if (c.diasCarroceria !== null && c.diasCarroceria >= 20) {
    l.push({ texto: `no podés esperar por un choque: una óptica delantera tardó ${c.diasCarroceria} días en nuestro relevamiento`, peso: 88 })
  }
  if (marca.tipo === 'nueva') {
    l.push({ texto: `querés una marca con historia en el país: llegó en ${marca.anioLlegada}`, peso: 84 })
  }

  // Consumo
  if (m.combustible !== 'electrico' && m.consumoLitros100km >= 9.5) {
    l.push({ texto: `hacés muchos kilómetros: toma ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, peso: 82 })
  }
  if (m.combustible === 'electrico') {
    l.push({ texto: `hacés más de ${formatNumero(KM_ANUALES)} km de ruta por año: la red de carga rápida fuera de la Panamericana y la ruta 2 es escasa`, peso: 89 })
    l.push({ texto: `no tenés dónde enchufarlo: cargar en un tomacorriente común toma más de 10 horas`, peso: 80 })
  }

  // Espacio
  if (m.plazas <= 5 && m.segmento !== 'pickup' && m.segmento !== 'utilitario') {
    l.push({ texto: `necesitás siete plazas: este tiene ${m.plazas}`, peso: 58 })
  }
  if (m.segmento !== 'pickup' && m.baulLitros < 330) {
    l.push({ texto: `viajás con equipaje: el baúl es de ${formatNumero(m.baulLitros)} litros`, peso: 76 })
  }
  if (m.puertas <= 3) l.push({ texto: `subís gente atrás seguido: tiene ${m.puertas} puertas`, peso: 78 })

  // Mecánica
  if (m.transmision === 'manual') l.push({ texto: `querés caja automática: esta versión es manual de ${m.segmento === 'pickup' ? 6 : 5} marchas`, peso: 74 })
  if (m.traccion === '4x2' && (m.usos.includes('off-road') || m.segmento === 'pickup')) {
    l.push({ texto: `vas a barro o arena: es 4x2 y no tiene reductora`, peso: 72 })
  }

  // Plata y espera
  if (c.sobreprecio > 300_000) {
    l.push({ texto: `no querés pagar sobre lista: hoy se paga ${formatMillones(c.sobreprecio)} más que el precio oficial`, peso: 86 })
  }
  if (m.entregaDias >= 30) l.push({ texto: `lo necesitás pronto: la entrega está en unos ${m.entregaDias} días`, peso: 79 })
  if (m.posventa.costoServiceARS >= 500_000) {
    l.push({ texto: `mirás el costo de mantenerlo: el service oficial cuesta ${formatARS(m.posventa.costoServiceARS)}`, peso: 70 })
  }
  if (m.posventa.intervaloKm <= 10000) {
    l.push({ texto: `hacés muchos kilómetros: el service es cada ${formatNumero(m.posventa.intervaloKm)} km`, peso: 46 })
  }
  if (m.posventa.disponibilidad === 'complicada') {
    l.push({ texto: `querés repuestos en la esquina: los de este modelo vienen del importador ${marca.importador}`, peso: 68 })
  }

  // Segmento
  if (m.segmento === 'pickup') l.push({ texto: `andás siempre en ciudad: mide más de 5 metros y va dura sin carga atrás`, peso: 62 })
  if (m.segmento === 'utilitario') l.push({ texto: `lo querés como auto familiar: es un utilitario de ${m.plazas} plazas, con el confort que eso implica`, peso: 64 })
  if (m.precioCalleARS >= 90_000_000) l.push({ texto: `tu presupuesto está por debajo de ${formatMillones(m.precioCalleARS)}`, peso: 66 })

  // Más candidatos con dato.
  if (m.combustible === 'diesel') l.push({ texto: `hacés menos de ${formatNumero(KM_ANUALES)} km por año: el diésel recién conviene arriba de esa cifra`, peso: 56 })
  if (m.combustible === 'hibrido') l.push({ texto: `hacés menos de ${formatNumero(KM_ANUALES)} km por año: el híbrido tarda más de 5 años en devolver la diferencia de precio`, peso: 54 })
  if (marca.provinciasConService.length <= 8) {
    l.push({ texto: `vivís fuera de las capitales: hay service oficial en ${marca.provinciasConService.length} de 24 provincias`, peso: 83 })
  }
  if (m.baulLitros < 420 && m.baulLitros >= 330 && m.segmento !== 'pickup') {
    l.push({ texto: `cargás bultos seguido: el baúl es de ${formatNumero(m.baulLitros)} litros`, peso: 50 })
  }
  if (marca.garantiaAnios <= 3) l.push({ texto: `querés garantía larga: son ${marca.garantiaAnios} años o ${formatNumero(marca.garantiaKm)} km`, peso: 48 })
  if (m.entregaDias > 14 && m.entregaDias < 30) l.push({ texto: `lo querés esta semana: la entrega está en ${m.entregaDias} días`, peso: 44 })

  // Respaldos universales: ninguna ficha queda sin contras, y todos con dato.
  l.push({ texto: `buscabas otra carrocería: este es un ${c.segmento} de ${m.plazas} plazas`, peso: 24 })
  l.push({ texto: `querés gastar menos de ${formatMillones(m.precioCalleARS)}`, peso: 20 })
  l.push({ texto: `preferís esperar: el modelo ${m.anio + 1} llega el año que viene`, peso: 12 })

  return l
}

/**
 * Elige `n` líneas de un modelo, penalizando las que ya se usaron mucho en
 * otras fichas del catálogo (mismo criterio que `construirEtiquetas`, un poco
 * más abajo en este archivo). Sin esto, dos modelos con la misma garantía o
 * la misma tracción siempre mostraban la frase idéntica: el peso fijo no
 * distingue "el hecho más fuerte de este auto" de "el hecho que ya
 * repetimos cincuenta veces". Los respaldos universales (precio, plazas,
 * motor) ya son distintos por modelo porque llevan sus propios números, así
 * que la penalización sólo mueve la aguja entre los hechos genéricos
 * compartidos, que es donde estaba la repetición real.
 */
function elegir(lineas: Linea[], usadas: Map<string, number>, n = 3): string[] {
  const vistas = new Set<string>()
  const elegidas = lineas
    .sort((a, b) => b.peso - (usadas.get(b.texto) ?? 0) * 6 - (a.peso - (usadas.get(a.texto) ?? 0) * 6))
    .filter((x) => {
      if (vistas.has(x.texto)) return false
      vistas.add(x.texto)
      return true
    })
    .slice(0, n)
    .map((x) => x.texto)
  for (const t of elegidas) usadas.set(t, (usadas.get(t) ?? 0) + 1)
  return elegidas
}

export type Encaje = { aFavor: string[]; enContra: string[] }

function construirEncajes(): Map<string, Encaje> {
  const salida = new Map<string, Encaje>()
  const usadasFavor = new Map<string, number>()
  const usadasContra = new Map<string, number>()
  for (const m of todosLosModelos) {
    const c = contexto(m)
    salida.set(m.id, {
      aFavor: elegir(razonesAFavor(c), usadasFavor),
      enContra: elegir(razonesEnContra(c), usadasContra),
    })
  }
  return salida
}

// Igual que con las etiquetas: se recalcula sólo si cambió la moneda, porque
// varias líneas llevan un monto adentro ("por menos de $ 40 M").
let encajesCache: Map<string, Encaje> | null = null
let encajesFirma = ''

export function encajeDe(m: Modelo): Encaje {
  const f = firmaMoneda()
  if (!encajesCache || encajesFirma !== f) {
    encajesCache = construirEncajes()
    encajesFirma = f
  }
  return encajesCache.get(m.id) ?? { aFavor: [], enContra: [] }
}

// ---------------------------------------------------------------------------
// Puntajes por dimensión: un auto puede ser 8 en una cosa y 4 en otra.
// ---------------------------------------------------------------------------

export type Puntajes = { andar: number; consumo: number; posventa: number; reventa: number }

function acotar(n: number) {
  return Math.max(1, Math.min(10, Math.round(n * 10) / 10))
}

/** Caballos declarados en el texto del motor, si están. */
function caballos(motor: string): number | null {
  const m = motor.match(/(\d{2,3})\s*CV/i)
  return m ? Number(m[1]) : null
}

const CONSUMO_REFERENCIA: Record<Modelo['segmento'], number> = {
  hatch: 6.6,
  sedan: 6.9,
  suv: 7.6,
  pickup: 8.8,
  utilitario: 7.2,
  monovolumen: 8.2,
}

export function puntajesDe(m: Modelo): Puntajes {
  const marca = marcasPorId[m.marcaId]
  const idx = indicePorMarca[m.marcaId]
  const pv = posventaPorMarca[m.marcaId]

  // Andar: potencia relativa al segmento, más caja y tracción.
  const cv = caballos(m.motor)
  let andar = 5.5
  if (cv !== null) andar = 3 + Math.min(6, (cv - 70) / 30)
  if (m.combustible === 'electrico') andar += 1.2
  if (m.transmision === 'automatica') andar += 0.6
  if (m.traccion !== '4x2') andar += 0.4

  // Consumo: contra la referencia de su propio segmento.
  const ref = CONSUMO_REFERENCIA[m.segmento]
  let consumo: number
  if (m.combustible === 'electrico') consumo = 9.6
  else if (m.combustible === 'hibrido') consumo = 8.8
  else consumo = 5 + ((ref - m.consumoLitros100km) / ref) * 12

  // Posventa: red, tiempos medidos y stock.
  let posventa = 3 + Math.min(3.5, marca.talleresOficiales / 35)
  if (pv?.diasRepuestoComun != null) posventa += pv.diasRepuestoComun <= 2 ? 2 : pv.diasRepuestoComun <= 5 ? 1 : 0
  if (pv?.diasRepuestoCarroceria != null) posventa += pv.diasRepuestoCarroceria <= 10 ? 1.5 : pv.diasRepuestoCarroceria <= 25 ? 0.5 : -0.5
  if (m.posventa.disponibilidad === 'complicada') posventa -= 1

  // Reventa: directo del índice, contra el rango real del mercado.
  const ret = idx?.retencion36m ?? (idx?.retencion12m != null ? idx.retencion12m - 18 : null)
  const reventa = ret === null ? 4 : 1 + ((ret - 42) / (82 - 42)) * 9

  return { andar: acotar(andar), consumo: acotar(consumo), posventa: acotar(posventa), reventa: acotar(reventa) }
}

// ---------------------------------------------------------------------------
// Etiqueta de card: una línea positiva y descriptiva, derivada del dato.
// Nunca negativa: una card no tiene lugar para el matiz, y sin matiz la
// advertencia es injusta. Lo que hay que advertir va en la ficha.
// ---------------------------------------------------------------------------

export function etiquetaDe(m: Modelo): string {
  return etiquetas().get(m.id) ?? `Mucho ${ETIQUETA_SEGMENTO[m.segmento].toLowerCase()} por el precio`
}

/**
 * La etiqueta sale del rasgo donde el modelo MÁS se destaca dentro de su propio
 * segmento, no de una lista de prioridades fija. Con una lista fija, sesenta
 * autos terminaban diciendo lo mismo y la etiqueta dejaba de informar.
 *
 * Se calcula una vez al cargar el módulo porque necesita ver todo el catálogo
 * para saber qué es destacado y qué es normal.
 */
type Candidata = { texto: string; fuerza: number }

function percentil(valor: number, todos: number[], mayorEsMejor: boolean): number {
  if (todos.length < 3) return 0.5
  const debajo = todos.filter((v) => (mayorEsMejor ? v < valor : v > valor)).length
  return debajo / todos.length
}

function construirEtiquetas(): Map<string, string> {
  const porSegmento = new Map<Modelo['segmento'], Modelo[]>()
  for (const m of todosLosModelos) {
    const lista = porSegmento.get(m.segmento) ?? []
    lista.push(m)
    porSegmento.set(m.segmento, lista)
  }

  const salida = new Map<string, string>()
  const usadas = new Map<string, number>()

  for (const m of todosLosModelos) {
    const pares = porSegmento.get(m.segmento) ?? [m]
    const marca = marcasPorId[m.marcaId]
    const idx = indicePorMarca[m.marcaId]
    const c: Candidata[] = []

    // Cada candidata vale según cuánto se despega del resto de su segmento.
    const pConsumo = percentil(m.consumoLitros100km, pares.map((x) => x.consumoLitros100km), false)
    if (m.combustible === 'electrico') c.push({ texto: 'Eléctrico: costo por kilómetro mínimo', fuerza: 0.97 })
    else if (m.combustible === 'hibrido') c.push({ texto: `Híbrido: ${m.consumoLitros100km.toLocaleString('es-AR')} litros cada 100`, fuerza: 0.94 })
    else if (pConsumo > 0.8) c.push({ texto: `De los que menos gastan: ${m.consumoLitros100km.toLocaleString('es-AR')} L/100`, fuerza: pConsumo })

    const pPrecio = percentil(m.precioCalleARS, pares.map((x) => x.precioCalleARS), false)
    if (pPrecio > 0.85) c.push({ texto: `El ${ETIQUETA_SEGMENTO[m.segmento].toLowerCase()} más accesible de su grupo`, fuerza: pPrecio })

    const pBaul = percentil(m.baulLitros, pares.map((x) => x.baulLitros), true)
    if (pBaul > 0.85 && m.segmento !== 'pickup') c.push({ texto: `Baúl de ${formatNumero(m.baulLitros)} litros`, fuerza: pBaul })
    if (pBaul > 0.8 && m.segmento === 'pickup') c.push({ texto: `Carga ${formatNumero(m.baulLitros)} kilos`, fuerza: pBaul })

    const cv = caballos(m.motor)
    if (cv !== null) {
      const pCv = percentil(cv, pares.map((x) => caballos(x.motor) ?? 0), true)
      if (pCv > 0.85) c.push({ texto: `${cv} CV, de los más potentes de su clase`, fuerza: pCv })
    }

    if (idx?.retencion36m != null) {
      const pRev = percentil(idx.retencion36m, pares.map((x) => indicePorMarca[x.marcaId]?.retencion36m ?? 0), true)
      if (pRev > 0.88) c.push({ texto: `El que mejor mantiene valor del segmento`, fuerza: pRev })
      else if (pRev > 0.7) c.push({ texto: `Conserva el ${idx.retencion36m}% a los tres años`, fuerza: pRev * 0.85 })
    }

    if (m.plazas >= 7) c.push({ texto: `${m.plazas} plazas de verdad`, fuerza: 0.92 })
    if (m.traccion === '4x4') c.push({ texto: '4x4 con reductora', fuerza: 0.86 })
    if (m.precioCalleARS < m.precioListaARS * 0.96) c.push({ texto: `Se consigue ${formatMillones(m.precioListaARS - m.precioCalleARS)} bajo lista`, fuerza: 0.84 })
    if (marca.garantiaAnios >= 6) c.push({ texto: `Garantía de ${marca.garantiaAnios} años`, fuerza: 0.83 })
    else if (marca.garantiaAnios >= 5) c.push({ texto: `Garantía de ${marca.garantiaAnios} años`, fuerza: 0.72 })
    if (marca.talleresOficiales >= 100) c.push({ texto: `${marca.talleresOficiales} talleres en el país`, fuerza: 0.8 })
    if (m.entregaDias <= 5) c.push({ texto: 'Entrega en la semana', fuerza: 0.78 })
    if (m.transmision === 'automatica' && m.precioCalleARS <= 35_000_000) c.push({ texto: 'Automático por menos de 35 millones', fuerza: 0.88 })
    if (m.posventa.costoServiceARS <= 260_000) c.push({ texto: `Service de ${formatARS(m.posventa.costoServiceARS)}`, fuerza: 0.7 })
    if (m.segmento === 'utilitario') c.push({ texto: `${formatNumero(m.baulLitros)} litros de carga`, fuerza: 0.75 })
    if (m.usos.includes('primer auto')) c.push({ texto: 'Buen primer auto', fuerza: 0.6 })
    if (m.usos.includes('off-road')) c.push({ texto: 'Aguanta el campo', fuerza: 0.66 })
    if (m.usos.includes('ciudad') && m.usos.length <= 2) c.push({ texto: 'Pensado para ciudad', fuerza: 0.58 })
    if (m.usos.includes('trabajo')) c.push({ texto: 'Herramienta de trabajo', fuerza: 0.62 })
    c.push({ texto: `${ETIQUETA_SEGMENTO[m.segmento]} de ${m.plazas} plazas`, fuerza: 0.2 })

    // Penalizamos lo que ya se usó mucho, para que una grilla no repita.
    c.sort((a, b) => b.fuerza - (usadas.get(b.texto) ?? 0) * 0.035 - (a.fuerza - (usadas.get(a.texto) ?? 0) * 0.035))
    const elegida = c[0].texto
    usadas.set(elegida, (usadas.get(elegida) ?? 0) + 1)
    salida.set(m.id, elegida)
  }
  return salida
}

/**
 * Las etiquetas se calculan una vez porque comparan cada modelo contra su
 * segmento y evitan repetirse en una misma grilla. Pero algunas llevan un monto
 * adentro, así que se recalculan cuando cambia la moneda o la cotización.
 */
let etiquetasCache: Map<string, string> | null = null
let etiquetasFirma = ''

function etiquetas(): Map<string, string> {
  const f = firmaMoneda()
  if (!etiquetasCache || etiquetasFirma !== f) {
    etiquetasCache = construirEtiquetas()
    etiquetasFirma = f
  }
  return etiquetasCache
}

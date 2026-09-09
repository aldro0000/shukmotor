import type { Foto, LinkCompra, Modelo, TipoFoto, VideoReview } from '../types'
import fotosReales from './fotos-reales.json'
import { marcasPorId } from './marcas'
import { modelosBase, type ModeloBase } from './modelos-base'
import { opinionesPorModelo } from './opiniones'

/** Fotos reales mínimas para que un modelo se muestre. */
const MINIMO_FOTOS = 2

type FotoRealJson = {
  archivo: string
  alt: string
  tipo: TipoFoto
  credito: string
  fuente: string
  licencia: string
  pagina: string
  width: number
  height: number
}

// Datos de ejemplo. Expande la definición compacta de ./modelos-base.ts.

/** Placeholders con proporción real: 16:10 exteriores, 4:3 interiores, 16:9 video. */
const TAMANIOS: Record<TipoFoto, { w: number; h: number }> = {
  frente: { w: 1600, h: 1000 },
  perfil: { w: 1600, h: 1000 },
  trasera: { w: 1600, h: 1000 },
  detalle: { w: 1600, h: 1000 },
  interior: { w: 1200, h: 900 },
  tablero: { w: 1200, h: 900 },
  baul: { w: 1200, h: 900 },
}

const DESCRIPCION: Record<TipoFoto, string> = {
  frente: 'vista de frente',
  perfil: 'vista de perfil',
  trasera: 'vista trasera',
  detalle: 'detalle',
  interior: 'interior, butacas delanteras',
  tablero: 'tablero y consola central',
  baul: 'baúl abierto',
}

const ORDEN_FOTOS: TipoFoto[] = ['frente', 'perfil', 'trasera', 'interior', 'tablero', 'baul']

/** Orden de presentación de la galería: primero exterior, después interior. */
const PESO_TIPO: Record<TipoFoto, number> = {
  frente: 0,
  perfil: 1,
  trasera: 2,
  detalle: 3,
  interior: 4,
  tablero: 5,
  baul: 6,
}

function placeholders(slug: string, nombreCompleto: string): Foto[] {
  return ORDEN_FOTOS.map((tipo) => ({
    url: `/fotos/${slug}/${slug}-${tipo}-${TAMANIOS[tipo].w}x${TAMANIOS[tipo].h}.svg`,
    alt: `${nombreCompleto}, ${DESCRIPCION[tipo]}`,
    tipo,
    credito: 'Ilustración SHUKMOTOR',
    fuente: 'Sin foto real con licencia libre',
    width: TAMANIOS[tipo].w,
    height: TAMANIOS[tipo].h,
    esIlustracion: true,
  }))
}

/**
 * Fotos reales bajadas de Wikimedia Commons con licencia libre (ver
 * scripts/fetch-fotos.ts). Cada una conserva su autor y su licencia, que es
 * lo que esas licencias exigen. Si un modelo no tiene fotos reales, se cae a
 * los placeholders, siempre con seis para que la galería no quede coja.
 */
export function fotosDe(slug: string, nombreCompleto: string): Foto[] {
  const reales = (fotosReales as Record<string, FotoRealJson[]>)[slug] ?? []

  // Regla dura: no se mezcla. O son todas fotos reales, o es la ilustración.
  // Rellenar una galería de fotos con dibujos vectoriales hace que el contador
  // mienta y que el modelo se vea a medio hacer.
  if (reales.length === 0) return placeholders(slug, nombreCompleto).slice(0, 1)

  return [...reales]
    .sort((a, b) => PESO_TIPO[a.tipo] - PESO_TIPO[b.tipo])
    .map((f) => ({
      url: `/fotos/${slug}/${f.archivo}`,
      alt: `${nombreCompleto}, ${f.alt.split(', ').slice(1).join(', ') || 'exterior'}`,
      tipo: f.tipo,
      credito: f.credito,
      fuente: f.fuente,
      pagina: f.pagina,
      width: f.width,
      height: f.height,
      esIlustracion: false,
    }))
}

/**
 * Video reviews: apagado.
 *
 * Los ids de YouTube de acá eran generados, así que cada card prometía un video
 * que no existe. Antes que mostrar un link roto preferimos no tener la sección:
 * devolvemos vacío y tanto la home como la ficha ya saltean el bloque. Cuando
 * haya videos reales, con canal y id verificados, se vuelve a prender acá.
 */
export function videosDe(_slug: string, _nombreCompleto: string, _cantidad: number, _fotos: Foto[]): VideoReview[] {
  return []
}

const SERVICE_BASE: Record<ModeloBase['seg'], number> = {
  hatch: 270000,
  sedan: 300000,
  suv: 390000,
  pickup: 480000,
  utilitario: 290000,
  monovolumen: 330000,
}

const PREMIUM = new Set(['audi', 'bmw', 'mercedes-benz', 'volvo', 'lexus', 'alfa-romeo', 'land-rover', 'mini', 'ds', 'subaru', 'smart', 'lynk-co'])

function posventaDe(m: ModeloBase) {
  const marca = marcasPorId[m.marca]
  const premium = PREMIUM.has(m.marca)
  const electrico = m.comb === 'electrico'
  let costo = SERVICE_BASE[m.seg]
  if (premium) costo = Math.round(costo * 2.1)
  if (electrico) costo = Math.round(costo * 0.55)
  if (m.lista > 60 && !premium) costo = Math.round(costo * 1.25)
  const intervalo = electrico ? 20000 : marca.origen === 'china' && marca.tipo === 'nueva' ? 10000 : ['toyota', 'honda', 'hyundai', 'kia', 'nissan', 'suzuki', 'mitsubishi', 'isuzu', 'lexus', 'mazda'].includes(m.marca) ? 10000 : 15000
  let repuestosNota: string
  let disponibilidad: 'buena' | 'regular' | 'complicada'
  if (marca.tipo === 'nueva') {
    repuestosNota = `${marca.nombre} llegó en ${marca.anioLlegada}: los repuestos vienen del importador (${marca.importador}) con demoras de dos a cuatro semanas para piezas no comunes.`
    disponibilidad = 'complicada'
  } else if (marca.talleresOficiales >= 80) {
    repuestosNota = `Red de ${marca.talleresOficiales} talleres oficiales en todo el país y repuestos alternativos en cualquier casa del ramo.`
    disponibilidad = 'buena'
  } else if (marca.talleresOficiales >= 30) {
    repuestosNota = `${marca.talleresOficiales} talleres oficiales, concentrados en capitales. Repuestos de desgaste fáciles, piezas de carrocería con algo de demora.`
    disponibilidad = 'buena'
  } else {
    repuestosNota = `Red chica (${marca.talleresOficiales} talleres). Conviene tener concesionario cerca; los repuestos importados pueden demorar.`
    disponibilidad = 'regular'
  }
  return {
    costoServiceARS: m.service ?? costo,
    intervaloKm: m.intervalo ?? intervalo,
    repuestosNota,
    disponibilidad: m.disp ?? disponibilidad,
  }
}

function linksDe(m: ModeloBase): LinkCompra[] {
  // Un auto con llegada confirmada todavía no se puede comprar. Mandar a alguien
  // a una tienda a buscarlo es hacerle perder el viaje.
  if (m.estado === 'proximo') return []
  const marca = marcasPorId[m.marca]
  const dominio = m.marca.replace(/-/g, '')
  const modeloUrl = m.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return [
    {
      tienda: `${marca.nombre} Argentina`,
      url: `https://www.${dominio}.com.ar/`,
      tipo: 'oficial',
      nota: 'Configurador oficial, precio de lista y cotizador de la marca.',
      comision: false,
    },
    {
      tienda: 'MercadoLibre 0km',
      url: `https://autos.mercadolibre.com.ar/${m.marca}/${modeloUrl}/0km/`,
      tipo: 'clasificado',
      nota: 'Publicaciones de concesionarias oficiales, con precio de calle y bonificaciones.',
      comision: true,
    },
    {
      tienda: 'Autocosmos',
      url: `https://www.autocosmos.com.ar/autos/nuevos/${m.marca}/${m.slug.replace(`${m.marca}-`, '')}`,
      tipo: 'comparador',
      nota: 'Ficha técnica ampliada y comparador de versiones.',
      comision: true,
    },
    {
      tienda: 'DeMotores',
      url: `https://www.demotores.com.ar/autos/${m.marca}/${modeloUrl}?condicion=nuevo`,
      tipo: 'clasificado',
      nota: 'Stock de concesionarias del interior del país.',
      comision: true,
    },
  ]
}

function resumenDe(slug: string) {
  const ops = opinionesPorModelo[slug] ?? []
  const n = ops.length
  const prom = (f: (d: (typeof ops)[number]) => number) => Math.round((ops.reduce((a, o) => a + f(o), 0) / Math.max(1, n)) * 10) / 10
  return {
    promedio: prom((o) => o.puntaje),
    cantidad: n,
    dimensiones: {
      andar: prom((o) => o.dimensiones.andar),
      consumo: prom((o) => o.dimensiones.consumo),
      posventa: prom((o) => o.dimensiones.posventa),
      calidad: prom((o) => o.dimensiones.calidad),
    },
  }
}

const M = 1_000_000

const modelosCompletos: Modelo[] = modelosBase.map((m) => {
  const marca = marcasPorId[m.marca]
  const nombreCompleto = `${marca.nombre} ${m.nombre} ${m.version}`
  const fotos = fotosDe(m.slug, nombreCompleto)
  return {
    id: m.slug,
    slug: m.slug,
    marcaId: m.marca,
    nombre: m.nombre,
    version: m.version,
    segmento: m.seg,
    carroceria: m.carroceria,
    anio: m.anio ?? 2026,
    precioListaARS: Math.round(m.lista * M),
    precioCalleARS: Math.round(m.calle * M),
    motor: m.motor,
    combustible: m.comb,
    transmision: m.caja,
    traccion: m.trac,
    consumoLitros100km: m.consumo,
    plazas: m.plazas,
    baulLitros: m.baul,
    puertas: m.puertas,
    entregaDias: m.entrega,
    usos: m.usos,
    fotos,
    videoReviews: videosDe(m.slug, `${marca.nombre} ${m.nombre}`, 0, fotos),
    opinionesResumen: resumenDe(m.slug),
    posta: { veredicto: m.veredicto },
    estado: m.estado,
    posventa: posventaDe(m),
    linksCompra: linksDe(m),
    rivales: m.rivales,
    // Necesita al menos dos fotos reales. Con una sola, o con la ilustración de
    // respaldo, la ficha se ve a medio hacer y es peor que no estar.
    visible: fotos.length >= MINIMO_FOTOS && !fotos[0].esIlustracion,
  }
})

const visiblesIds = new Set(modelosCompletos.filter((m) => m.visible).map((m) => m.id))

/** Todo el catálogo, visible o no. Solo para scripts y validaciones. */
export const todosLosModelos: Modelo[] = modelosCompletos

/** Lo que la app muestra. Los rivales también se filtran a lo visible. */
export const modelos: Modelo[] = modelosCompletos
  .filter((m) => m.visible)
  .map((m) => ({ ...m, rivales: m.rivales.filter((r) => visiblesIds.has(r)) }))

export const modelosPorId: Record<string, Modelo> = Object.fromEntries(modelos.map((m) => [m.id, m]))

/**
 * Lo que se puede comprar hoy. Es la base del buscador por presupuesto y de
 * cualquier pantalla que termine en un botón de tienda: un auto con llegada
 * confirmada pero sin precio de calle no se puede comprar, y ofrecerlo como
 * resultado de una búsqueda por plata es mentirle al que busca.
 */
export const modelosALaVenta: Modelo[] = modelos.filter((m) => m.estado === 'vigente')

/** Llegadas confirmadas. Van al calendario y al catálogo, nunca al buscador. */
export const modelosProximos: Modelo[] = modelos.filter((m) => m.estado === 'proximo')

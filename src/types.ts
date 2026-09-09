// Tipos de dominio de SHUKMOTOR. Sin backend: todo vive en src/data.

export type Origen =
  | 'nacional'
  | 'brasil'
  | 'china'
  | 'europa'
  | 'japon'
  | 'corea'
  | 'usa'
  | 'india'

export type Marca = {
  id: string
  nombre: string
  slug: string
  /** Ruta a un SVG simple en /public/logos */
  logo: string
  paisOrigen: string
  origen: Origen
  /** nueva = llegó al país en los últimos 3 años */
  tipo: 'tradicional' | 'nueva'
  anioLlegada: number
  importador: string
  garantiaAnios: number
  garantiaKm: number
  talleresOficiales: number
  provinciasConService: string[]
  /** % del precio de 0km que conserva un usado de 12 meses */
  reventa12mPct: number
  /** % del precio de 0km que conserva un usado de 36 meses */
  reventa36mPct: number
}

export type TipoFoto =
  | 'frente'
  | 'perfil'
  | 'trasera'
  | 'interior'
  | 'tablero'
  | 'baul'
  | 'detalle'

export type Foto = {
  url: string
  alt: string
  tipo: TipoFoto
  /** Obligatorio, nunca vacío. Se muestra en la vista ampliada. */
  credito: string
  /** Obligatorio, nunca vacío. Se muestra en la vista ampliada. */
  fuente: string
  /** URL de la página de origen, para el enlace del crédito. */
  pagina?: string
  width: number
  height: number
  /** true = dibujo vectorial de respaldo, no una foto. Nunca se mezcla con fotos. */
  esIlustracion: boolean
}

export type VideoReview = {
  youtubeId: string
  titulo: string
  canal: string
  duracionSeg: number
  /** ISO yyyy-mm-dd */
  fecha: string
  miniatura: string
}

export type Segmento =
  | 'hatch'
  | 'sedan'
  | 'suv'
  | 'pickup'
  | 'utilitario'
  | 'monovolumen'

export type Combustible = 'nafta' | 'diesel' | 'hibrido' | 'electrico'
export type Transmision = 'manual' | 'automatica'
export type Traccion = '4x2' | '4x4' | 'awd'

export type Uso =
  | 'ciudad'
  | 'ruta'
  | 'familia'
  | 'trabajo'
  | 'primer auto'
  | 'off-road'
  | 'carga'

export type Dimensiones = {
  andar: number
  consumo: number
  posventa: number
  calidad: number
}

export type Veredicto = 'conviene' | 'con reparos' | 'no conviene'

/**
 * vigente = se vende hoy en Argentina. proximo = llegada confirmada, todavía no
 * está en el salón. Un próximo no puede comprarse, así que queda fuera del
 * buscador por presupuesto y no lleva botón de tienda.
 */
export type EstadoMercado = 'vigente' | 'proximo'

/** Dónde comprarlo. Cada link abre en pestaña nueva con UTM y rel sponsored. */
export type LinkCompra = {
  tienda: string
  url: string
  tipo: 'oficial' | 'concesionaria' | 'clasificado' | 'comparador'
  /** Qué vas a encontrar ahí, en una línea */
  nota: string
  /** true si ese link puede generarnos una comisión */
  comision: boolean
}

export type Modelo = {
  id: string
  slug: string
  marcaId: string
  nombre: string
  version: string
  segmento: Segmento
  carroceria: string
  anio: number
  precioListaARS: number
  precioCalleARS: number
  motor: string
  combustible: Combustible
  transmision: Transmision
  traccion: Traccion
  /** Litros cada 100 km, mixto. Para eléctricos: equivalente energético. */
  consumoLitros100km: number
  plazas: number
  baulLitros: number
  puertas: number
  entregaDias: number
  usos: Uso[]
  /** Mínimo 6 */
  fotos: Foto[]
  videoReviews: VideoReview[]
  opinionesResumen: {
    promedio: number
    cantidad: number
    dimensiones: Dimensiones
  }
  posta: { veredicto: Veredicto }
  estado: EstadoMercado
  posventa: {
    costoServiceARS: number
    intervaloKm: number
    repuestosNota: string
    disponibilidad: 'buena' | 'regular' | 'complicada'
  }
  linksCompra: LinkCompra[]
  /** ids de modelos del mismo segmento y rango de precio */
  rivales: string[]
  /**
   * false = no tiene fotos suficientes para mostrarse bien, así que sale del
   * catálogo hasta conseguirlas. Un catálogo chico e impecable se ve mejor que
   * uno grande a medio hacer.
   */
  visible: boolean
}

export type Opinion = {
  id: string
  modeloId: string
  autor: string
  /** ISO yyyy-mm-dd */
  fecha: string
  puntaje: number
  kmRecorridos: number
  dimensiones: Dimensiones
  loBueno: string
  loMalo: string
  /** contador de "me sirvió" */
  util: number
}

export type CategoriaNovedad =
  | 'lanzamiento'
  | 'precios'
  | 'comparativa'
  | 'analisis'
  | 'opiniones'

export type Novedad = {
  id: string
  slug: string
  titulo: string
  bajada: string
  fecha: string
  categoria: CategoriaNovedad
  imagen: string
  /** Crédito de la foto. Obligatorio si la imagen es una foto real. */
  imagenCredito: string
  imagenFuente: string
  imagenWidth: number
  imagenHeight: number
  /** Párrafos separados por doble salto de línea */
  cuerpo: string
}

export type EstadoEvento = 'confirmado' | 'estimado'
export type TipoEvento = 'llegada-marca' | 'lanzamiento' | 'restyling' | 'preventa' | 'nueva-version'

export type EventoCalendario = {
  id: string
  /** ISO yyyy-mm-dd. Para estimados, el día es el 1 y se muestra solo el mes. */
  fecha: string
  estado: EstadoEvento
  tipo: TipoEvento
  marcaId: string
  titulo: string
  detalle: string
  /** slug del modelo si ya está en el catálogo */
  modeloSlug?: string
  segmento?: Segmento
  precioEstimadoARS?: number
  fuente: string
}

export type PlanFinanciacion = {
  id: string
  nombre: string
  resumen: string
  comoFunciona: string[]
  paraQuien: string
  ventajas: string[]
  riesgos: string[]
  /** Tasa nominal anual de referencia, en %, ilustrativa */
  tnaReferencia: number
  plazosMeses: number[]
  anticipoMinimoPct: number
}

export type OfertaFinanciacion = {
  id: string
  marcaId: string
  planId: string
  titulo: string
  tna: number
  plazoMeses: number
  montoMaximoARS: number
  vigenciaHasta: string
  condiciones: string
}

export type Patrocinio = {
  id: string
  marcaId: string
  titulo: string
  texto: string
  modeloSlug: string
  vigenciaHasta: string
}

/** Código de país. La base está pensada para sumar países agregando filas. */
export type Pais = 'AR' | 'CL' | 'MX' | 'CO' | 'PE'

/** Índice de reventa por marca: producto central, con muestra y metodología a la vista. */
export type IndiceReventaMarca = {
  pais: Pais
  marcaId: string
  /** ISO yyyy-mm-dd del corte */
  fechaCorte: string
  /** Cantidad de usados relevados en el corte */
  muestra: number
  fuentes: string[]
  /** % del precio de 0km equivalente que conserva un usado. null = sin datos todavía */
  retencion12m: number | null
  retencion24m: number | null
  retencion36m: number | null
  /** Serie mensual de retención a 12 meses, del más viejo al más nuevo */
  serie: { mes: string; retencion12m: number }[]
  nota?: string
}

export type IndiceReventaModelo = {
  pais: Pais
  modeloSlug: string
  fechaCorte: string
  muestra: number
  retencion12m: number | null
  retencion24m: number | null
  nota?: string
}

/** Relevamiento propio de posventa: llamadas a talleres, presupuestos y tiempos medidos. */
export type PosventaRelevada = {
  pais: Pais
  marcaId: string
  fechaCorte: string
  talleresLlamados: number
  talleresRespondieron: number
  /** Días de espera medidos para un repuesto de desgaste (pastillas, filtros) */
  diasRepuestoComun: number | null
  /** Días de espera medidos para una pieza de carrocería (paragolpes, óptica) */
  diasRepuestoCarroceria: number | null
  /** Presupuesto medido para el service de 10.000 km del modelo más vendido */
  presupuestoServiceARS: number | null
  /** Días hasta el primer turno disponible */
  diasTurno: number | null
  /** Talleres que tenían el repuesto común en stock, sobre los que respondieron */
  stockEnMostrador: number
  nota?: string
}

/**
 * Curaduría de fotos: qué foto merece estar en el sitio y en qué orden.
 *
 * Es el filtro que separa una ficha que se ve profesional de una que se ve a
 * medio hacer. Lo usan los scripts de descarga y la limpieza del catálogo ya
 * bajado, para que la regla sea una sola y esté en un solo lugar.
 */

/** Saca tildes y baja a minúscula, para poder matchear sin sorpresas. */
export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_\-()[\].,]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Vehículos que no son el auto de calle que vende la concesionaria. */
const SERVICIO = [
  'fire', 'feuerwehr', 'brandweer', 'bomber', 'police', 'polizei', 'politie', 'policia', 'polis',
  'ambulance', 'ambulanz', 'ambulancia', 'rescue', 'emergency', 'paramedic',
  'taxi', 'remis', 'cab ', 'patrol', 'sheriff', 'army', 'military', 'militar', 'gendarm',
  'garbage', 'tow truck', 'utility company', 'post office', 'correo',
]

/** Competición: nada de esto se parece al auto que se compra. */
const COMPETICION = [
  'rally', 'rallye', 'racing', ' race', 'race ', 'dakar', 'wrc', 'motorsport', 'circuit',
  'drift', 'stock car', 'nascar', 'hillclimb', 'autocross', 'safari',
]

/** Paneles abiertos: capot, baúl, puertas. El auto no se lee entero. */
const ABIERTO = [
  'door', 'doors', 'puerta', 'trunk', 'boot open', 'hood', 'bonnet', 'tailgate',
  'engine bay', 'engine compartment', 'motor compartment', 'capot', 'open', 'abierto',
  'liftgate', 'hatch open',
]

/** Salones, museos, ferias y multitudes: fondo sucio y gente en cuadro. */
const EVENTO = [
  'iaa', 'automesse', 'motor show', 'motorshow', 'autoshow', 'auto show', 'car show',
  'salon', 'salao', 'showroom', 'expo', 'messe', 'fair', 'feria', 'exhibition', 'exposicion',
  'museum', 'museo', 'festival', 'carnival', 'parade', 'meeting', 'treffen', 'rassemblement',
  'concours', 'dealership', 'concesionario', 'shopping', 'mall', 'stand',
]

/**
 * Contextos donde la cartelería y las patentes delatan que no es Latinoamérica.
 * No se filtra Europa occidental ni América: en la calle esas fotos se leen
 * neutras. Sí se filtra donde el alfabeto o el entorno cantan.
 */
const CONTEXTO_AJENO = [
  'china', 'chinese', 'beijing', 'peking', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu',
  'shishi', 'hangzhou', 'wuhan', 'tianjin', 'chongqing', 'xiamen', 'nanjing', 'qingdao',
  'russia', 'russian', 'moscow', 'moskva', 'sankt peterburg', 'petersburg',
  'japan', 'japanese', 'tokyo', 'osaka', 'nagoya', 'kyoto', 'yokohama',
  'korea', 'seoul', 'busan',
  'thailand', 'bangkok', 'indonesia', 'jakarta', 'malaysia', 'kuala lumpur',
  'vietnam', 'hanoi', 'india', 'mumbai', 'delhi', 'bangalore', 'chennai',
  'israel', 'tel aviv', 'egypt', 'cairo', 'turkey', 'istanbul', 'iran', 'tehran',
  'ukraine', 'kyiv', 'kiev', 'kazakhstan', 'almaty', 'georgia', 'tbilisi',
  'arabic', 'cyrillic', 'hebrew',
]

/** Gente en primer plano. */
const GENTE = ['crowd', 'people', 'visitors', 'presenter', 'model posing', 'hostess', 'publico']

const ANCHO_MINIMO = 1200

/** El auto vendido hoy: nada anterior a esta generación. */
const ANIO_MINIMO = 2018

export type Veredicto = { ok: true; puntaje: number } | { ok: false; motivo: string }

function contiene(t: string, lista: string[]): string | null {
  for (const k of lista) if (t.includes(k)) return k
  return null
}

/**
 * Decide si una foto entra al sitio y, si entra, cuánto vale.
 * `titulo` es el nombre original del archivo en Commons, que es donde está
 * toda la información que tenemos sobre qué muestra la foto.
 */
export function evaluarFoto(titulo: string, ancho: number, anioModelo = 2026): Veredicto {
  const t = normalizar(titulo)

  if (ancho < ANCHO_MINIMO) return { ok: false, motivo: `ancho ${ancho}px` }

  const servicio = contiene(t, SERVICIO)
  if (servicio) return { ok: false, motivo: `vehículo de servicio (${servicio.trim()})` }

  const compe = contiene(t, COMPETICION)
  if (compe) return { ok: false, motivo: `competición (${compe.trim()})` }

  const abierto = contiene(t, ABIERTO)
  if (abierto) return { ok: false, motivo: `panel abierto (${abierto.trim()})` }

  const evento = contiene(t, EVENTO)
  if (evento) return { ok: false, motivo: `salón o evento (${evento.trim()})` }

  const ajeno = contiene(t, CONTEXTO_AJENO)
  if (ajeno) return { ok: false, motivo: `contexto no latinoamericano (${ajeno.trim()})` }

  const gente = contiene(t, GENTE)
  if (gente) return { ok: false, motivo: `gente en cuadro (${gente.trim()})` }

  // Generación: si el nombre trae año y es viejo, es otro auto.
  const anios = [...t.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((m) => Number(m[1]))
  const anio = anios.length ? Math.max(...anios) : null
  if (anio !== null && anio < ANIO_MINIMO) return { ok: false, motivo: `generación ${anio}` }
  if (anio !== null && anio > anioModelo + 1) return { ok: false, motivo: `posterior al modelo (${anio})` }

  // Puntaje: el orden que pidió el producto.
  let puntaje = 10
  const tresCuartosDelantero = /front (right|left)|(right|left) front|front (three quarter|3 4|34)/.test(t)
  const perfil = /side view|\bside\b|profile|perfil|lateral/.test(t)
  const tresCuartosTrasero = /rear (right|left)|(right|left) rear|back (right|left)/.test(t)
  const frenteRecto = /\bfront\b/.test(t)
  const traseraRecta = /\brear\b|\bback\b/.test(t)
  const adentro = /interior|dashboard|cockpit|seats|tablero/.test(t)

  if (tresCuartosDelantero) puntaje += 40
  else if (perfil) puntaje += 32
  else if (tresCuartosTrasero) puntaje += 26
  else if (frenteRecto) puntaje += 20
  else if (traseraRecta) puntaje += 14
  else if (adentro) puntaje += 2
  else puntaje += 8 // nombre sin pistas: puede ser cualquier toma exterior

  if (anio !== null && anio >= anioModelo - 2) puntaje += 6
  if (ancho >= 1600) puntaje += 3

  return { ok: true, puntaje }
}

/** El nombre original de Commons, sacado de la URL de la página del archivo. */
export function tituloOriginal(pagina: string | undefined, archivoLocal: string): string {
  if (!pagina) return archivoLocal
  const parte = pagina.split('/File:').pop() ?? pagina.split('/').pop() ?? archivoLocal
  return decodeURIComponent(parte).replace(/_/g, ' ')
}

/** Cuántas fotos válidas necesita un modelo para quedar visible en el catálogo. */
export const MINIMO_FOTOS = 2

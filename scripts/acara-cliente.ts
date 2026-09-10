/**
 * Cliente de lectura de la Guía Oficial de Precios de ACARA.
 *
 * Es HTML armado en el servidor por GET, sin JavaScript de por medio:
 * `guia-oficial-de-precios.php?tipo=AUTOS&marca=X&modelo=todos&version=todas`
 * devuelve, en una sola respuesta, todos los modelos y versiones de esa marca.
 * No hace falta un navegador ni pedir marca por marca y versión por versión.
 *
 * No hay robots.txt en el dominio (404), así que no hay nada que respetar ahí,
 * pero igual nos limitamos a 1 request por segundo y nos identificamos con un
 * User-Agent real. Es un scrapeo de una fuente pública y oficial, no privada.
 */

const BASE = 'https://www.acaramotos.org.ar/guia-oficial-de-precios.php'
export const UA = 'SHUKMOTOR/1.0 (proyecto editorial de autos, Argentina; +https://shukmotors.vercel.app; contacto@shukmotor.example)'

/** Las 56 marcas que ACARA lista hoy bajo AUTOS. Se recorren en este orden. */
export const MARCAS_ACARA = [
  'ALFA ROMEO', 'AUDI', 'BAIC', 'BMW', 'CHANGAN', 'CHERY', 'CHEVROLET', 'CHRYSLER',
  'CITROEN', 'CORADIR', 'DODGE', 'DS', 'F.E.R.E.S.A.', 'FAW', 'FERRARI', 'FIAT',
  'FORD', 'FOTON', 'GEELY', 'GREAT WALL', 'HAVAL', 'HEIBAO', 'HONDA', 'HYUNDAI',
  'ISUZU', 'JAC', 'JAGUAR', 'JEEP', 'JETOUR', 'KIA', 'LAND ROVER', 'LEXUS', 'LIFAN',
  'MASERATI', 'MCLAREN', 'MERCEDES BENZ', 'MINI', 'MITSUBISHI', 'NISSAN', 'PEUGEOT',
  'PORSCHE', 'RAM', 'RENAULT', 'SEAT', 'SERO ELECTRIC', 'SHINERAY', 'SKYWELL',
  'SMART', 'SOUEAST', 'SSANGYONG', 'SUBARU', 'SUZUKI', 'SWM', 'TOYOTA', 'VOLKSWAGEN',
  'VOLVO',
] as const

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))
let ultimoPedido = 0

/** Nunca más de 1 request por segundo, sin importar cuántas veces se llame. */
async function fetchLimitado(url: string): Promise<Response> {
  const espera = ultimoPedido + 1000 - Date.now()
  if (espera > 0) await dormir(espera)
  ultimoPedido = Date.now()
  return fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
}

/**
 * "34.395,0" (formato es-AR: punto de miles, coma decimal) → 34395. La propia
 * página dice "Los precios... están expresados en miles", así que el pesos
 * real es este número por mil. "-" significa sin dato.
 */
function numeroAcara(s: string): number | null {
  const t = s.trim()
  if (!t || t === '-') return null
  const limpio = t.replace(/\./g, '').replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) ? Math.round(n * 1000) : null
}

export type FilaCruda = {
  marca: string
  modelo: string
  version: string
  moneda: '$' | 'u$s'
  precioLista: number | null
  porAnio: (number | null)[]
}

/**
 * Cada fila trae `<td>` de: modelo, versión, moneda, y después los valores de
 * precio. El primero de esos siempre es el 0km, confirmado a mano contra
 * versiones que sólo tienen ese dato. Los que siguen son la reventa por año,
 * de la más reciente para atrás; hay una columna más de las que declara el
 * encabezado de la tabla (bug conocido del sitio), así que no le ponemos año
 * calendario a esa serie todavía: se guarda posicional.
 */
/**
 * Cuando una versión lleva sola en el mercado más años de los que entran en
 * las columnas de una fila, ACARA no la corta: repite modelo+versión+moneda en
 * una segunda `<tr>` y sigue la serie de años ahí. Sin fusionarlas quedan dos
 * filas con la misma identidad y datos parciales -una con el 0km y el
 * arranque de la serie, la otra sólo con la cola-, y cualquiera que compare
 * snapshots día a día ve un cambio donde no lo hay, según cuál de las dos
 * haya quedado guardada. Se fusionan acá, antes de que le lleguen a nadie más.
 */
function fusionarPartidas(filas: FilaCruda[]): FilaCruda[] {
  const porClave = new Map<string, FilaCruda[]>()
  for (const f of filas) {
    const k = `${f.marca}|${f.modelo}|${f.version}|${f.moneda}`
    porClave.set(k, [...(porClave.get(k) ?? []), f])
  }
  const salida: FilaCruda[] = []
  for (const grupo of porClave.values()) {
    if (grupo.length === 1) {
      salida.push(grupo[0])
      continue
    }
    const porAnio = grupo[0].porAnio.map((_, i) => grupo.map((f) => f.porAnio[i]).find((v) => v !== null) ?? null)
    salida.push({
      ...grupo[0],
      precioLista: grupo.map((f) => f.precioLista).find((v) => v !== null) ?? null,
      porAnio,
    })
  }
  return salida
}

function parsearFilas(html: string, marca: string): FilaCruda[] {
  const inicio = html.indexOf('<tbody')
  const fin = html.indexOf('</tbody>')
  if (inicio === -1 || fin === -1) return []
  const cuerpo = html.slice(inicio, fin)

  const filas: FilaCruda[] = []
  const partes = cuerpo.split(/(?=<tr)/).filter((p) => p.includes('<td>'))
  for (const parte of partes) {
    const tds = [...parte.matchAll(/<td>(.*?)<\/td>/gs)].map((m) => m[1].trim())
    if (tds.length < 5) continue
    const [modelo, version, monedaTxt, ...precios] = tds
    const moneda = monedaTxt === 'u$s' ? 'u$s' : '$'
    filas.push({
      marca,
      modelo,
      version,
      moneda,
      precioLista: numeroAcara(precios[0] ?? ''),
      porAnio: precios.slice(1).map(numeroAcara),
    })
  }
  return fusionarPartidas(filas)
}

export type ResultadoMarca = { marca: string; filas: FilaCruda[] } | { marca: string; error: string }

/** Trae y parsea una marca. Nunca tira: si algo sale mal, devuelve el error para que el llamador decida abortar. */
export async function traerMarca(marca: string): Promise<ResultadoMarca> {
  const url = `${BASE}?tipo=AUTOS&marca=${encodeURIComponent(marca)}&modelo=todos&version=todas`
  try {
    const r = await fetchLimitado(url)
    if (!r.ok) return { marca, error: `HTTP ${r.status}` }
    const html = await r.text()
    // Si esto no está, la estructura de la página cambió y no hay que seguir adivinando.
    if (!html.includes('id="tabla-guia-precios"')) return { marca, error: 'no se encontró la tabla de precios' }
    return { marca, filas: parsearFilas(html, marca) }
  } catch (e) {
    return { marca, error: (e as Error).message }
  }
}

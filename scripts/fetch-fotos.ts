/**
 * Descarga fotos REALES de autos desde Wikimedia Commons.
 *
 * Por qué Commons y no fotos de prensa o de medios: las de Commons tienen
 * licencia libre (CC BY, CC BY-SA, CC0, dominio público) y exigen exactamente
 * lo que este producto ya hace, que es acreditar autor y fuente. Bajar fotos
 * de prensa o de otros medios sería infracción de copyright.
 *
 * Correr con: npm run fetch:fotos [-- --solo=slug1,slug2] [-- --limite=20]
 * Es reanudable: no vuelve a bajar lo que ya está en el manifiesto.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { marcasPorId } from '../src/data/marcas'
import { modelosBase } from '../src/data/modelos-base'
import type { TipoFoto } from '../src/types'
import { evaluarFoto } from './curaduria'

const PUBLIC = join(process.cwd(), 'public')
const args0 = process.argv.slice(2)
const salida = args0.find((a) => a.startsWith('--salida='))?.slice(9)
/** Permite correr dos procesos en paralelo escribiendo a archivos distintos. */
const MANIFIESTO = join(process.cwd(), 'src', 'data', salida ?? 'fotos-reales.json')
const BASE = join(process.cwd(), 'src', 'data', 'fotos-reales.json')
const UA = 'SHUKMOTOR/1.0 (proyecto editorial de autos, Argentina; contacto via sitio) node-fetch'
const ANCHO = 1600

export type FotoReal = {
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

type Manifiesto = Record<string, FotoReal[]>

const manifiesto: Manifiesto = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {}
/** Lo que ya bajó el otro proceso, para no repetir trabajo. */
const yaHecho: Manifiesto = MANIFIESTO !== BASE && existsSync(BASE) ? JSON.parse(readFileSync(BASE, 'utf8')) : {}

const args = args0
const solo = args.find((a) => a.startsWith('--solo='))?.slice(7).split(',')
const limite = Number(args.find((a) => a.startsWith('--limite='))?.slice(9)) || Infinity
const forzar = args.includes('--forzar')

function limpiarHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Licencias que aceptamos: libres, con atribución. */
function licenciaOk(l: string): boolean {
  const s = l.toLowerCase()
  if (!s) return false
  if (s.includes('fair use') || s.includes('non-free') || s.includes('nc-') || s.includes('noncommercial')) return false
  return s.includes('cc') || s.includes('public domain') || s.includes('pd-') || s.includes('gfdl') || s.includes('cc0')
}

/** Adivina qué muestra la foto por el nombre del archivo. */
function tipoDe(titulo: string): TipoFoto {
  const t = titulo.toLowerCase()
  if (/(interior|inside|cabin|cockpit|seats?|asientos)/.test(t)) return 'interior'
  if (/(dashboard|dash|tablero|instrument)/.test(t)) return 'tablero'
  if (/(trunk|boot|cargo|baul|baúl)/.test(t)) return 'baul'
  if (/(rear|back|trasera|posterior|tail)/.test(t)) return 'trasera'
  if (/(front|frente|delantera|nose)/.test(t)) return 'frente'
  if (/(side|perfil|profile|lateral)/.test(t)) return 'perfil'
  return 'detalle'
}

const DESCRIPCION: Record<TipoFoto, string> = {
  frente: 'de frente',
  perfil: 'de perfil',
  trasera: 'de atrás',
  interior: 'interior',
  tablero: 'tablero',
  baul: 'baúl',
  detalle: 'exterior',
}

type Candidato = {
  titulo: string
  thumburl: string
  width: number
  height: number
  artista: string
  licencia: string
  pagina: string
  puntaje: number
}

/** Commons corta si le pegás muy seguido: reintenta con espera creciente. */
async function api(params: Record<string, string>, intentos = 5): Promise<any> {
  const url = new URL('https://commons.wikimedia.org/w/api.php')
  url.searchParams.set('format', 'json')
  url.searchParams.set('formatversion', '2')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  let ultimo: unknown
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } })
      if (r.ok) return r.json()
      ultimo = new Error(`API ${r.status}`)
    } catch (e) {
      ultimo = e
    }
    await new Promise((res) => setTimeout(res, 1200 * (i + 1)))
  }
  throw ultimo
}

/** Busca candidatos en Commons y los puntúa por qué tan bien matchean el modelo. */
async function buscar(marca: string, modelo: string, anio: number): Promise<Candidato[]> {
  const consultas = [
    `intitle:"${marca} ${modelo}" filetype:bitmap`,
    `"${marca} ${modelo}" filetype:bitmap`,
  ]
  const vistos = new Map<string, Candidato>()

  for (const srsearch of consultas) {
    let data: any
    try {
      data = await api({
        action: 'query',
        generator: 'search',
        gsrsearch: srsearch,
        gsrnamespace: '6',
        gsrlimit: '30',
        prop: 'imageinfo',
        iiprop: 'url|size|extmetadata',
        iiurlwidth: String(ANCHO),
      })
    } catch (e) {
      console.warn(`  busqueda fallo [${srsearch}]: ${(e as Error).message}`)
      continue
    }
    const paginas: any[] = data?.query?.pages ?? []
    for (const p of paginas) {
      const info = p.imageinfo?.[0]
      if (!info) continue
      const titulo: string = p.title.replace(/^File:/, '')
      if (vistos.has(titulo)) continue
      const meta = info.extmetadata ?? {}
      const licencia = limpiarHtml(meta.LicenseShortName?.value ?? '')
      if (!licenciaOk(licencia)) continue
      if (!/\.(jpe?g|png)$/i.test(titulo)) continue
      if (info.width < 900 || info.height < 500) continue

      // La curaduría decide si la foto entra al sitio y cuánto vale.
      const anchoReal = info.thumbwidth ?? info.width
      const veredicto = evaluarFoto(titulo, anchoReal, anio)
      if (!veredicto.ok) continue

      const t = titulo.toLowerCase()
      const nm = marca.toLowerCase()
      const nmod = modelo.toLowerCase()
      // Que sea el modelo correcto, además de ser una buena foto.
      let coincide = 0
      if (t.includes(nm)) coincide += 4
      if (t.includes(nmod)) coincide += 6
      for (const w of nmod.split(/\s+/)) if (w.length > 2 && t.includes(w)) coincide += 1
      if (coincide < 5) continue
      const puntaje = veredicto.puntaje + coincide

      vistos.set(titulo, {
        titulo,
        thumburl: info.thumburl ?? info.url,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        artista: limpiarHtml(meta.Artist?.value ?? '') || 'Autor no identificado en Wikimedia Commons',
        licencia,
        pagina: info.descriptionurl,
        puntaje,
      })
    }
  }
  return [...vistos.values()].sort((a, b) => b.puntaje - a.puntaje)
}

async function bajar(url: string, destino: string): Promise<boolean> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (!r.ok) return false
    const buf = Buffer.from(await r.arrayBuffer())
    if (buf.length < 8000) return false
    writeFileSync(destino, buf)
    return true
  } catch {
    return false
  }
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const desde = Number(args.find((a) => a.startsWith('--desde='))?.slice(8)) || 0
  const objetivo = modelosBase
    .filter((m) => (solo ? solo.includes(m.slug) : true))
    .slice(desde)
    .slice(0, limite)
  let conFotos = 0
  let total = 0
  let i = 0

  for (const m of objetivo) {
    i++
    if (!forzar && (manifiesto[m.slug]?.length || yaHecho[m.slug]?.length)) {
      conFotos++
      // Puede estar en el manifiesto viejo y no en el de esta corrida.
      total += (manifiesto[m.slug] ?? yaHecho[m.slug]).length
      continue
    }
    const marca = marcasPorId[m.marca]
    const anio = m.anio ?? 2026
    const candidatos = await buscar(marca.nombre, m.nombre, anio)

    // Elegimos hasta 6: variedad de tipos primero, después por puntaje.
    const elegidas: Candidato[] = []
    const tiposUsados = new Set<TipoFoto>()
    for (const c of candidatos) {
      const t = tipoDe(c.titulo)
      if (!tiposUsados.has(t) && elegidas.length < 6) {
        elegidas.push(c)
        tiposUsados.add(t)
      }
    }
    for (const c of candidatos) {
      if (elegidas.length >= 6) break
      if (!elegidas.includes(c)) elegidas.push(c)
    }

    if (elegidas.length === 0) {
      console.log(`${i}/${objetivo.length} ${m.slug}: sin fotos en Commons`)
      manifiesto[m.slug] = []
      await dormir(200)
      continue
    }

    const dir = join(PUBLIC, 'fotos', m.slug)
    mkdirSync(dir, { recursive: true })
    const guardadas: FotoReal[] = []

    for (const [idx, c] of elegidas.entries()) {
      const ext = c.titulo.match(/\.(jpe?g|png)$/i)?.[0].toLowerCase().replace('jpeg', 'jpg') ?? '.jpg'
      const archivo = `${m.slug}-real-${idx + 1}${ext}`
      const ok = await bajar(c.thumburl, join(dir, archivo))
      if (!ok) continue
      const tipo = tipoDe(c.titulo)
      guardadas.push({
        archivo,
        alt: `${marca.nombre} ${m.nombre}, ${DESCRIPCION[tipo]}`,
        tipo,
        credito: c.artista,
        fuente: `Wikimedia Commons · ${c.licencia}`,
        licencia: c.licencia,
        pagina: c.pagina,
        width: c.width,
        height: c.height,
      })
      await dormir(120)
    }

    manifiesto[m.slug] = guardadas
    if (guardadas.length) conFotos++
    total += guardadas.length
    console.log(`${i}/${objetivo.length} ${m.slug}: ${guardadas.length} fotos`)
    writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
    await dormir(200)
  }

  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
  console.log(`\nModelos con foto real: ${conFotos}/${objetivo.length}. Fotos bajadas: ${total}.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Imágenes reales para las notas de /novedades, desde Wikimedia Commons.
 * Cada nota se busca por su tema, no por su título, para que la foto tenga
 * que ver con lo que se cuenta. Guarda autor y licencia como corresponde.
 *
 * Correr con: npm run fetch:novedades
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { novedades } from '../src/data/novedades'

const PUBLIC = join(process.cwd(), 'public')
const MANIFIESTO = join(process.cwd(), 'src', 'data', 'fotos-novedades.json')
const UA = 'SHUKMOTOR/1.0 (proyecto editorial de autos, Argentina) node-fetch'
const ANCHO = 1600

/** Qué auto o escena ilustra cada nota. */
const TEMA: Record<string, string> = {
  'byd-song-pro-precio-argentina': 'BYD Song Pro',
  'precios-septiembre-2026-lista-completa': 'Fiat Cronos',
  'hilux-vs-ranger-vs-poer-comparativa': 'Ford Ranger',
  'que-auto-comprar-con-35-millones': 'Peugeot 208',
  'opiniones-duenos-tiggo-4-pro-30000-km': 'Chery Tiggo 4',
  'ford-ranger-xlt-v6-test': 'Ford Ranger',
  'toyota-yaris-cross-sobreprecio': 'Toyota Yaris Cross',
  'reventa-2026-que-marcas-mantienen-valor': 'Toyota Hilux',
  'kardian-vs-t-cross-vs-pulse': 'Volkswagen T-Cross',
  'jaecoo-j7-lanzamiento-argentina': 'Jaecoo J7',
  'hibridos-argentina-guia-2026': 'Toyota Corolla Cross',
  'fiat-cronos-por-que-sigue-primero': 'Fiat Cronos',
  'electricos-baratos-byd-dolphin-mini-vs-mg4': 'BYD Dolphin',
  'toyota-hilux-2027-que-se-sabe': 'Toyota Hilux',
  'posventa-marcas-chinas-encuesta': 'Chery Tiggo 8',
  'pickups-compactas-strada-montana-toro': 'Fiat Toro',
  'que-auto-comprar-con-60-millones': 'Volkswagen Taos',
  'amarok-nueva-generacion-2026': 'Volkswagen Amarok',
  'suv-7-plazas-baratos-argentina': 'Chery Tiggo 8',
  'independencia-editorial-como-trabajamos': 'Buenos Aires avenida',
}

type FotoNota = {
  archivo: string
  credito: string
  fuente: string
  licencia: string
  pagina: string
  width: number
  height: number
}

const manifiesto: Record<string, FotoNota> = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {}

function limpiarHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim()
}

function licenciaOk(l: string): boolean {
  const s = l.toLowerCase()
  if (!s) return false
  if (s.includes('fair use') || s.includes('non-free') || s.includes('nc-')) return false
  return s.includes('cc') || s.includes('public domain') || s.includes('pd-') || s.includes('gfdl')
}

/** Commons corta si le pegás muy seguido: reintenta con espera creciente. */
async function api(params: Record<string, string>, intentos = 4): Promise<any> {
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
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)))
  }
  throw ultimo
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  let ok = 0
  for (const n of novedades) {
    if (manifiesto[n.slug]) {
      ok++
      continue
    }
    const tema = TEMA[n.slug] ?? 'automóvil'
    let data: any
    try {
      data = await api({
        action: 'query',
        generator: 'search',
        gsrsearch: `"${tema}" filetype:bitmap`,
        gsrnamespace: '6',
        gsrlimit: '25',
        prop: 'imageinfo',
        iiprop: 'url|size|extmetadata',
        iiurlwidth: String(ANCHO),
      })
    } catch {
      console.log(`${n.slug}: error de búsqueda`)
      continue
    }
    const paginas: any[] = data?.query?.pages ?? []
    let elegida: any = null
    for (const p of paginas) {
      const info = p.imageinfo?.[0]
      if (!info) continue
      const titulo: string = p.title.replace(/^File:/, '')
      if (!/\.(jpe?g|png)$/i.test(titulo)) continue
      if (info.width < 1000 || info.width / info.height < 1.2) continue
      const licencia = limpiarHtml(info.extmetadata?.LicenseShortName?.value ?? '')
      if (!licenciaOk(licencia)) continue
      if (/(logo|badge|emblem|crash|wreck|toy|miniatur|police|taxi)/i.test(titulo)) continue
      elegida = { info, titulo, licencia }
      break
    }
    if (!elegida) {
      console.log(`${n.slug}: sin foto para "${tema}"`)
      continue
    }
    const ext = elegida.titulo.match(/\.(jpe?g|png)$/i)![0].toLowerCase().replace('jpeg', 'jpg')
    const archivo = `${n.slug}${ext}`
    const dir = join(PUBLIC, 'fotos', 'novedades')
    mkdirSync(dir, { recursive: true })
    const r = await fetch(elegida.info.thumburl ?? elegida.info.url, { headers: { 'User-Agent': UA } })
    if (!r.ok) continue
    writeFileSync(join(dir, archivo), Buffer.from(await r.arrayBuffer()))
    manifiesto[n.slug] = {
      archivo,
      credito: limpiarHtml(elegida.info.extmetadata?.Artist?.value ?? '') || 'Autor no identificado en Wikimedia Commons',
      fuente: `Wikimedia Commons · ${elegida.licencia}`,
      licencia: elegida.licencia,
      pagina: elegida.info.descriptionurl,
      width: elegida.info.thumbwidth ?? elegida.info.width,
      height: elegida.info.thumbheight ?? elegida.info.height,
    }
    ok++
    console.log(`${n.slug}: ${archivo}`)
    writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
    await dormir(250)
  }
  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
  console.log(`\nNotas con foto real: ${ok}/${novedades.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

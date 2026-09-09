/**
 * Segunda pasada para los modelos que la búsqueda en Commons no encontró.
 *
 * Camino distinto: busca el artículo del modelo en Wikipedia (español y, si no,
 * inglés) y se trae las imágenes de ese artículo. Después verifica la licencia
 * de cada una contra Commons, igual que la primera pasada: si no es libre, no
 * la usa.
 *
 * Correr con: npm run fetch:fotos-wiki [-- --solo=slug1,slug2]
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { marcasPorId } from '../src/data/marcas'
import { modelosBase } from '../src/data/modelos-base'
import type { TipoFoto } from '../src/types'
import { evaluarFoto } from './curaduria'

const PUBLIC = join(process.cwd(), 'public')
const args = process.argv.slice(2)
const salida = args.find((a) => a.startsWith('--salida='))?.slice(9) ?? 'fotos-wiki.json'
const MANIFIESTO = join(process.cwd(), 'src', 'data', salida)
const solo = args.find((a) => a.startsWith('--solo='))?.slice(7).split(',')
const UA = 'SHUKMOTOR/1.0 (proyecto editorial de autos, Argentina) node-fetch'
const ANCHO = 1600

type FotoReal = {
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

const manifiesto: Record<string, FotoReal[]> = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {}

function limpiarHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim()
}

function licenciaOk(l: string): boolean {
  const s = l.toLowerCase()
  if (!s) return false
  if (s.includes('fair use') || s.includes('non-free') || s.includes('nc-')) return false
  return s.includes('cc') || s.includes('public domain') || s.includes('pd-') || s.includes('gfdl')
}

function tipoDe(titulo: string): TipoFoto {
  const t = titulo.toLowerCase()
  if (/(interior|inside|cabin|cockpit|seats?|asientos)/.test(t)) return 'interior'
  if (/(dashboard|dash|tablero|instrument)/.test(t)) return 'tablero'
  if (/(trunk|boot|cargo|baul)/.test(t)) return 'baul'
  if (/(rear|back|trasera|posterior|tail)/.test(t)) return 'trasera'
  if (/(front|frente|delantera)/.test(t)) return 'frente'
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

async function api(host: string, params: Record<string, string>, intentos = 6): Promise<any> {
  const url = new URL(`https://${host}/w/api.php`)
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
    await new Promise((res) => setTimeout(res, 2500 * (i + 1)))
  }
  throw ultimo
}

/** Busca el artículo del modelo y devuelve los nombres de archivo de sus imágenes. */
async function imagenesDelArticulo(host: string, consulta: string): Promise<string[]> {
  const busq = await api(host, { action: 'query', list: 'search', srsearch: consulta, srlimit: '3', srnamespace: '0' })
  const resultados: any[] = busq?.query?.search ?? []
  if (!resultados.length) return []
  const archivos: string[] = []
  for (const r of resultados.slice(0, 2)) {
    const d = await api(host, { action: 'query', titles: r.title, prop: 'images', imlimit: '60' })
    const pagina = d?.query?.pages?.[0]
    for (const im of pagina?.images ?? []) {
      const t: string = im.title.replace(/^(File|Archivo):/, '')
      if (!/\.(jpe?g|png)$/i.test(t)) continue
      if (/(logo|icon|flag|map|commons|wiki|symbol|disambig|question|edit|crystal|nuvola|ambox|emblem)/i.test(t)) continue
      archivos.push(t)
    }
    if (archivos.length >= 8) break
  }
  return [...new Set(archivos)]
}

/** Trae la info de licencia y la URL escalada desde Commons. */
async function infoDeCommons(archivos: string[]): Promise<any[]> {
  if (!archivos.length) return []
  const out: any[] = []
  for (let i = 0; i < archivos.length; i += 10) {
    const lote = archivos.slice(i, i + 10)
    const d = await api('commons.wikimedia.org', {
      action: 'query',
      titles: lote.map((a) => `File:${a}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata',
      iiurlwidth: String(ANCHO),
    })
    for (const p of d?.query?.pages ?? []) {
      const info = p.imageinfo?.[0]
      if (!info) continue
      out.push({ titulo: p.title.replace(/^File:/, ''), info })
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return out
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const objetivo = modelosBase.filter((m) => (solo ? solo.includes(m.slug) : true))
  let ok = 0

  for (const [i, m] of objetivo.entries()) {
    if (manifiesto[m.slug]?.length) {
      ok++
      continue
    }
    const marca = marcasPorId[m.marca]
    const consulta = `${marca.nombre} ${m.nombre}`

    let archivos: string[] = []
    for (const host of ['es.wikipedia.org', 'en.wikipedia.org']) {
      try {
        archivos = await imagenesDelArticulo(host, consulta)
      } catch {
        archivos = []
      }
      if (archivos.length) break
      await dormir(300)
    }

    if (!archivos.length) {
      console.log(`${i + 1}/${objetivo.length} ${m.slug}: sin artículo con fotos`)
      manifiesto[m.slug] = []
      await dormir(300)
      continue
    }

    let infos: any[] = []
    try {
      infos = await infoDeCommons(archivos)
    } catch (e) {
      console.log(`${i + 1}/${objetivo.length} ${m.slug}: Commons rechazó (${(e as Error).message}), sigo`)
      await dormir(4000)
      continue
    }
    const usables = infos
      .map((x) => {
        const lic = limpiarHtml(x.info.extmetadata?.LicenseShortName?.value ?? '')
        if (!licenciaOk(lic)) return null
        const v = evaluarFoto(x.titulo, x.info.thumbwidth ?? x.info.width, m.anio ?? 2026)
        if (!v.ok) return null
        return { ...x, puntaje: v.puntaje }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.puntaje - a.puntaje)

    const dir = join(PUBLIC, 'fotos', m.slug)
    mkdirSync(dir, { recursive: true })
    const guardadas: FotoReal[] = []

    for (const [idx, x] of usables.slice(0, 6).entries()) {
      const ext = x.titulo.match(/\.(jpe?g|png)$/i)![0].toLowerCase().replace('jpeg', 'jpg')
      const archivo = `${m.slug}-wiki-${idx + 1}${ext}`
      try {
        const r = await fetch(x.info.thumburl ?? x.info.url, { headers: { 'User-Agent': UA } })
        if (!r.ok) continue
        const buf = Buffer.from(await r.arrayBuffer())
        if (buf.length < 8000) continue
        writeFileSync(join(dir, archivo), buf)
      } catch {
        continue
      }
      const tipo = tipoDe(x.titulo)
      const lic = limpiarHtml(x.info.extmetadata?.LicenseShortName?.value ?? '')
      guardadas.push({
        archivo,
        alt: `${marca.nombre} ${m.nombre}, ${DESCRIPCION[tipo]}`,
        tipo,
        credito: limpiarHtml(x.info.extmetadata?.Artist?.value ?? '') || 'Autor no identificado en Wikimedia Commons',
        fuente: `Wikimedia Commons · ${lic}`,
        licencia: lic,
        pagina: x.info.descriptionurl,
        width: x.info.thumbwidth ?? x.info.width,
        height: x.info.thumbheight ?? x.info.height,
      })
      await dormir(150)
    }

    manifiesto[m.slug] = guardadas
    if (guardadas.length) ok++
    console.log(`${i + 1}/${objetivo.length} ${m.slug}: ${guardadas.length} fotos`)
    writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
    await dormir(300)
  }

  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
  console.log(`\nRecuperados por Wikipedia: ${ok}/${objetivo.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

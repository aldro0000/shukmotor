import { todosLosModelos } from '../src/data/modelos'
import { marcasPorId } from '../src/data/marcas'
import { parsearFeed } from './rss'
import { ejecutado, guardarJSON, hash, leerJSON, menciona, normalizar } from './pipeline-utils'

export const FEEDS = [
  ['Motor1', 'https://ar.motor1.com/rss/news/all/'],
  ['Autoblog', 'https://feeds.feedburner.com/ac/rss-ar'],
  ['Parabrisas', 'https://parabrisas.perfil.com/feed'],
  ['Cosas de Autos', 'https://cosasdeautos.com.ar/feed/'],
  ['Megautos', 'https://megautos.com/feed/'],
  ['AutoX', 'https://autoxarg.com.ar/feed/'],
  ['MotorMagazine', 'https://motormagazine.com.ar/feed/'],
  ['Carmuv', 'https://blog.carmuv.com.ar/feed/'],
  ['Best Selling Cars Blog', 'https://bestsellingcarsblog.com/category/argentina/feed/'],
]
const CONSULTAS = ['autos chinos Argentina', 'lanzamiento auto Argentina', 'patentamientos ACARA', 'importación autos Argentina',
  ...['Jaecoo', 'Omoda', 'Leapmotor', 'Deepal', 'Xpeng', 'Bestune', 'Dongfeng', 'BAW'].map(m => `${m} Argentina`)]
export type EntradaRadar = { titulo: string; fuente: string; link: string; fecha: string; modelos: string[] }
export type Radar = { entradas: EntradaRadar[]; errores: string[] }
export function canonico(link: string): string {
  const u = new URL(link)
  u.hash = ''
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(k)) u.searchParams.delete(k)
  u.searchParams.sort()
  return u.href.replace(/\/$/, '')
}
export async function radar() {
  const vistos = leerJSON<Record<string, string>>('data/radar-vistos.json', {})
  const candidatos = { ...vistos }
  const resultado: Radar = { entradas: [], errores: [] }
  const ahora = Date.now()
  const fuentes = [...FEEDS, ...CONSULTAS.map(q => ['Google News', `https://news.google.com/rss/search?${new URLSearchParams({ q, hl: 'es-419', gl: 'AR', ceid: 'AR:es-419' })}`])]
  for (const [nombre, url] of fuentes) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'SHUKMOTOR-Radar/1.0 (RSS only)' } })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const xml = await r.text()
      if (!/<(?:rss|feed)\b/i.test(xml)) throw new Error('Respuesta no RSS')
      for (const item of parsearFeed(xml)) {
        if (!item.fecha || Date.parse(item.fecha) < ahora - 7 * 86400000 || Date.parse(item.fecha) > ahora) continue
        const link = canonico(item.link)
        const claves = [hash(`titulo:${normalizar(item.titulo)}`), hash(`link:${link}`)]
        const repetido = claves.some(k => candidatos[k])
        if (!repetido && resultado.entradas.length >= 60) continue
        for (const k of claves) candidatos[k] = item.fecha.slice(0, 10)
        if (repetido) continue
        resultado.entradas.push({ titulo: item.titulo, fuente: item.fuente || nombre, link, fecha: item.fecha,
          modelos: todosLosModelos.filter(m => menciona(item.titulo, m.nombre, marcasPorId[m.marcaId].nombre)).map(m => m.slug) })
      }
    } catch (e) { resultado.errores.push(`${nombre}: ${e instanceof Error ? e.message : 'Error de feed'}`) }
  }
  resultado.entradas.sort((a, b) => b.fecha.localeCompare(a.fecha))
  guardarJSON('data/.tmp/radar.json', resultado)
  // Se confirma junto al PR, nunca antes de entregar las noticias al revisor.
  guardarJSON('data/.tmp/radar-vistos.json', candidatos)
  console.log(`${resultado.entradas.length} noticias nuevas; ${resultado.errores.length} feeds fallidos`)
  if (resultado.errores.length) throw new Error(resultado.errores.join('\n'))
}
if (ejecutado(import.meta.url)) radar().catch(e => { console.error(e); process.exitCode = 1 })

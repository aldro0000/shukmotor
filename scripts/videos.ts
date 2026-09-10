import { todosLosModelos } from '../src/data/modelos'
import { marcasPorId } from '../src/data/marcas'
import { videos as anteriores } from '../src/data/videos'
import type { VideoReview } from '../src/types'
import { ejecutado, escribir, guardarJSON, leerJSON, menciona } from './pipeline-utils'

type Canal = { nombre: string; handle?: string; id?: string; pais: string; url: string }
type Cuota = { fecha: string; unidades: number; busquedas: number; cursor: number }
type VideoAPI = { id: string; snippet: { title: string; channelId: string; channelTitle: string; publishedAt: string; liveBroadcastContent: string; thumbnails: Record<string, { url: string }> }; contentDetails: { duration: string }; statistics: { viewCount?: string }; status: { privacyStatus: string; embeddable: boolean } }
export function duracionISO(s: string): number {
  const m = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/)
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0
}
export const diaCuota = (fecha: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha)
export const cabeEnCuota = (q: Cuota, costo: number, search: boolean) => q.unidades + costo <= 8000 && (!search || q.busquedas < 80)
export function seleccionar(items: VideoAPI[], nombre: string, marca: string, canales: Set<string>, ahora = Date.now()): VideoReview[] {
  return items.filter(v => /^[\w-]{11}$/.test(v.id) && canales.has(v.snippet.channelId) &&
    menciona(v.snippet.title, nombre, marca) && duracionISO(v.contentDetails.duration) >= 180 &&
    Date.parse(v.snippet.publishedAt) >= ahora - 180 * 86400000 && Date.parse(v.snippet.publishedAt) <= ahora &&
    v.status.privacyStatus === 'public' && v.status.embeddable && v.snippet.liveBroadcastContent === 'none')
    .sort((a, b) => Number(b.statistics.viewCount || 0) - Number(a.statistics.viewCount || 0))
    .slice(0, 3).map(v => ({ youtubeId: v.id, titulo: v.snippet.title, canal: v.snippet.channelTitle,
      duracionSeg: duracionISO(v.contentDetails.duration), fecha: v.snippet.publishedAt.slice(0, 10),
      miniatura: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url || '' }))
}
export async function actualizarVideos() {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) { console.log('::warning::Falta YOUTUBE_API_KEY: videos desactivados; cargar el secret de Actions.'); return }
  const apiKey: string = key
  const config = leerJSON<Canal[]>('scripts/canales-youtube.json', [])
  if (!config.length || config.some(c => c.pais !== 'AR' || (!c.handle?.startsWith('@') && !/^UC[\w-]{22}$/.test(c.id || '')))) throw new Error('Lista blanca inválida')
  const previo = leerJSON<Cuota>('data/youtube-cuota.json', { fecha: '', unidades: 0, busquedas: 0, cursor: 0 })
  const fecha = diaCuota(new Date())
  const cuota: Cuota = previo.fecha === fecha ? previo : { fecha, unidades: 0, busquedas: 0, cursor: previo.cursor }
  async function api<T>(recurso: string, params: Record<string, string>): Promise<T> {
    const search = recurso === 'search'
    const costo = search ? 100 : 1 // Techo conservador solicitado, además de 80 búsquedas/día.
    if (!cabeEnCuota(cuota, costo, search)) throw new Error('Cuota local agotada')
    cuota.unidades += costo
    if (search) cuota.busquedas++
    guardarJSON('data/youtube-cuota.json', cuota) // Incluso una solicitud fallida consume cuota.
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${recurso}?${new URLSearchParams({ ...params, key: apiKey })}`, { signal: AbortSignal.timeout(25000) })
    if (!r.ok) throw new Error(`YouTube ${recurso}: HTTP ${r.status}`) // Nunca imprimir key ni URL.
    return r.json() as Promise<T>
  }
  if (!cabeEnCuota(cuota, config.length + 25, false)) { console.log('Cuota al límite; se retoma mañana.'); return }
  const canales: string[] = []
  for (const c of config) {
    const r = await api<{ items: { id: string }[] }>('channels', { part: 'id', ...(c.id ? { id: c.id } : { forHandle: c.handle! }) })
    if (r.items.length !== 1) throw new Error(`Canal no encontrado: ${c.nombre}`)
    canales.push(r.items[0].id)
  }
  const candidatos = new Map<string, VideoAPI>()
  async function detalles(ids: string[]) {
    for (let i = 0; i < ids.length; i += 50) {
      const r = await api<{ items: VideoAPI[] }>('videos', { part: 'snippet,contentDetails,statistics,status', id: ids.slice(i, i + 50).join(',') })
      for (const v of r.items) candidatos.set(v.id, v)
    }
  }
  // Refrescar siempre los guardados: desaparecen privados, borrados y vencidos.
  await detalles([...new Set(Object.values(anteriores).flat().map(v => v.youtubeId))])
  const tareas = todosLosModelos.flatMap(m => canales.map(canal => ({ m, canal })))
  const inicio = cuota.cursor % tareas.length
  for (let n = 0; n < tareas.length && cabeEnCuota(cuota, 102, true); n++) {
    const i = (inicio + n) % tareas.length
    const { m, canal } = tareas[i]
    const r = await api<{ items: { id: { videoId: string } }[] }>('search', {
      part: 'snippet', type: 'video', channelId: canal, q: `${marcasPorId[m.marcaId].nombre} ${m.nombre}`,
      publishedAfter: new Date(Date.now() - 180 * 86400000).toISOString(), maxResults: '50', order: 'viewCount',
      videoEmbeddable: 'true', relevanceLanguage: 'es',
    })
    await detalles(r.items.map(v => v.id.videoId).filter(Boolean))
    cuota.cursor = (i + 1) % tareas.length
    guardarJSON('data/youtube-cuota.json', cuota)
  }
  const salida: Record<string, VideoReview[]> = {}
  for (const m of todosLosModelos) {
    const lista = seleccionar([...candidatos.values()], m.nombre, marcasPorId[m.marcaId].nombre, new Set(canales))
    if (lista.length) salida[m.slug] = lista
  }
  escribir('src/data/videos.ts', `// Metadata real de YouTube; videosDe() sigue desactivada.\nimport type { VideoReview } from '../types'\n\nexport const videos: Record<string, VideoReview[]> = ${JSON.stringify(salida, null, 2)}\n`)
  console.log(`${Object.keys(salida).length} modelos con videos. Cuota: ${cuota.unidades}/8000; búsquedas: ${cuota.busquedas}/80`)
}
if (ejecutado(import.meta.url)) actualizarVideos().catch(e => { console.error(e instanceof Error ? e.message : 'Error YouTube'); process.exitCode = 1 })

/**
 * Parser mínimo de RSS, a mano y sin dependencias: los feeds que lee el radar
 * son todos RSS 2.0 estándar (el propio feed del sitio, o el de Google News),
 * así que no hace falta una librería de XML para sacarles título, link y
 * fecha.
 */

export type ItemFeed = {
  titulo: string
  link: string
  fecha: string | null
  /** Sólo lo trae Google News: el medio de origen, ya separado del título. */
  fuente: string | null
}

function decodificarEntidades(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (original, entidad: string) => {
      const nombres: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
      if (!entidad.startsWith('#')) return nombres[entidad.toLowerCase()] ?? original
      const n = /^#x/i.test(entidad) ? parseInt(entidad.slice(2), 16) : Number(entidad.slice(1))
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : original
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function tag(bloque: string, nombre: string): string | null {
  const m = bloque.match(new RegExp(String.raw`<${nombre}\b[^>]*>([\s\S]*?)</${nombre}>`, 'i'))
  return m ? decodificarEntidades(m[1]) : null
}

export function parsearFeed(xml: string): ItemFeed[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((m) => m[1])
  return items
    .map((bloque) => {
      const titulo = tag(bloque, 'title')
      const link = tag(bloque, 'link')
      if (!titulo || !link) return null
      const fechaTxt = tag(bloque, 'pubDate')
      const instante = fechaTxt ? Date.parse(fechaTxt) : NaN
      const fecha = Number.isFinite(instante) ? new Date(instante).toISOString() : null
      try { if (!['http:', 'https:'].includes(new URL(link).protocol)) return null } catch { return null }
      const fuenteMatch = bloque.match(/<source[^>]*>([\s\S]*?)<\/source>/)
      const fuente = fuenteMatch ? decodificarEntidades(fuenteMatch[1]) : null
      // Google News repite el medio al final del título ("... - iProfesional"); si ya lo tenemos aparte, sobra.
      const tituloLimpio = fuente && titulo.endsWith(` - ${fuente}`) ? titulo.slice(0, -(fuente.length + 3)) : titulo
      return { titulo: tituloLimpio, link, fecha, fuente }
    })
    .filter((x): x is ItemFeed => x !== null)
}

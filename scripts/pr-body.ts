import { movimientos } from '../src/data/movimientos'
import type { BorradorNota } from '../src/types'
import type { Radar } from './radar'
import { escribir, leerJSON } from './pipeline-utils'

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+!|])/g, '\\$1').replace(/@/g, '&#64;')
const notas = leerJSON<BorradorNota[]>('data/.tmp/borradores-nuevos.json', [])
const radar = leerJSON<Radar>('data/.tmp/radar.json', { entradas: [], errores: [] })
const ids = new Set(notas.flatMap(n => n.evidencia))
const cambios = movimientos.filter(m => ids.has(m.id))
const cuerpo = [
  '## Novedades para revisión humana',
  `${cambios.length} movimientos respaldan ${notas.length} borradores. ${radar.entradas.length} referencias externas.`,
  'Los textos propios se generan como borrador y este PR prepara su estado publicado. Sólo se mostrarán al integrar el PR en main. Editá o eliminá cualquier nota antes del merge. Los titulares del radar nunca van al sitio.',
  ...notas.map(n => `## ${escape(n.titulo)}\n\n${escape(n.bajada)}\n\n${escape(n.cuerpo)}\n\nEvidencia: ${n.evidencia.map(escape).join(', ')}`),
  '## Radar — enlaces para consultar',
  ...radar.entradas.map(e => `- [${escape(e.titulo)}](<${e.link.replace(/[<>\s]/g, encodeURIComponent)}>) · ${escape(e.fuente)}`),
].join('\n\n')
if (Buffer.byteLength(cuerpo) > 60000) throw new Error('PR supera 60 KB: reducir lote antes de persistir vistos; no se trunca evidencia.')
escribir('data/.tmp/pr-body.md', cuerpo)

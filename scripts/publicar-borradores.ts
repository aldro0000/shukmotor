import { borradores } from '../src/data/borradores'
import type { BorradorNota } from '../src/types'
import { ejecutado, guardarTS, leerJSON } from './pipeline-utils'

export function publicarSeleccionados(notas: BorradorNota[], ids: Set<string>): BorradorNota[] {
  return notas.map(n => ids.has(n.id) && n.estado === 'borrador' ? { ...n, estado: 'publicado' } : n)
}
if (ejecutado(import.meta.url)) {
  if (process.argv.includes('--verificar')) {
    const pendientes = borradores.filter(n => n.estado !== 'publicado')
    if (pendientes.length) throw new Error(`${pendientes.length} notas llegaron al merge sin preparar. No se reescribe el commit.`)
    console.log('Estados de publicación correctos en el commit integrado.')
  } else {
    const ids = new Set(leerJSON<BorradorNota[]>('data/.tmp/borradores-nuevos.json', []).map(n => n.id))
    guardarTS('src/data/borradores.ts', 'BorradorNota', 'borradores', publicarSeleccionados(borradores, ids))
  }
}

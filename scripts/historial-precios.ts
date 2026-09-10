import { readdirSync } from 'node:fs'
import type { Snapshot } from './snapshot-precios'
import { emparejar, nombreMarca } from './emparejar-modelo'
import { escribir, leerJSON } from './pipeline-utils'

const series = new Map<string, { id: string; marca: string; modelo: string; version: string; modeloSlug: string | null; moneda: '$' | 'u$s'; vigente: boolean; puntos: { fecha: string; precio: number }[] }>()
for (const f of readdirSync('data/snapshots').filter(f => /^precios-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()) {
  const s = leerJSON<Snapshot>(`data/snapshots/${f}`, null!)
  for (const serie of series.values()) serie.vigente = false
  for (const i of s.items) {
    if (i.precioLista === null) continue
    const id = `${i.marca}|${i.modelo}|${i.version}|${i.moneda}`
    const serie = series.get(id) ?? { id, marca: nombreMarca(i.marca), modelo: i.modelo, version: i.version,
      modeloSlug: emparejar(i.marca, i.modelo), moneda: i.moneda, vigente: true, puntos: [] }
    serie.vigente = true
    serie.puntos.push({ fecha: s.fecha, precio: i.precioLista })
    series.set(id, serie)
  }
}
escribir('src/data/historial-precios.ts', `// Serie 0km de ACARA: versiones y monedas separadas.\nexport const historialPrecios = ${JSON.stringify([...series.values()], null, 1)}\n`)

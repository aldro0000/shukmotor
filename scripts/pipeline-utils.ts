import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

export const normalizar = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export const hash = (s: string) => createHash('sha256').update(s).digest('hex')
export const ejecutado = (url: string) => !!process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === url
export function leerJSON<T>(ruta: string, respaldo: T): T {
  return existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) as T : respaldo
}
export function escribir(ruta: string, texto: string) {
  mkdirSync(dirname(ruta), { recursive: true })
  writeFileSync(`${ruta}.tmp`, texto)
  renameSync(`${ruta}.tmp`, ruta)
}
export const guardarJSON = (ruta: string, valor: unknown) => escribir(ruta, JSON.stringify(valor, null, 2) + '\n')
export const guardarTS = (ruta: string, tipo: string, nombre: string, valor: unknown) => escribir(ruta,
  `// Generado por el pipeline. Revisar los borradores antes de integrar.\nimport type { ${tipo} } from '../types'\n\nexport const ${nombre}: ${tipo}[] = ${JSON.stringify(valor, null, 2)}\n`)
export function menciona(titulo: string, modelo: string, marca?: string): boolean {
  const t = ` ${normalizar(titulo)} `
  const m = normalizar(modelo)
  return !!m && t.includes(` ${m} `) && (m.length > 3 || !!marca && t.includes(` ${normalizar(marca)} `))
}

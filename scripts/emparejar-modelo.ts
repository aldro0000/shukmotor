/**
 * Relaciona una fila de ACARA (marca + modelo, en sus nombres oficiales) con
 * un modelo de nuestro catálogo, cuando existe.
 *
 * Es a nivel de modelo, no de versión: los nombres de versión de ACARA
 * ("2.0 GR-S CVT (170cv) (L23)") no se van a parecer nunca a las versiones de
 * nuestro catálogo de ejemplo, así que pretender machear trim por trim sería
 * inventar precisión que no hay. La línea en la ficha dice "el Corolla subió
 * 4,2%", no "el GR-S CVT subió 4,2%", y es honesto con lo que sabemos.
 */
import { modelosPorId, todosLosModelos } from '../src/data/modelos'
import { marcasPorId } from '../src/data/marcas'

/** Marca de ACARA -> nuestro slug, sólo para las que están en los dos catálogos. */
export const MARCA_ACARA_A_SLUG: Record<string, string> = {
  'ALFA ROMEO': 'alfa-romeo',
  AUDI: 'audi',
  BAIC: 'baic',
  BMW: 'bmw',
  CHANGAN: 'changan',
  CHERY: 'chery',
  CHEVROLET: 'chevrolet',
  CITROEN: 'citroen',
  CORADIR: 'coradir',
  DS: 'ds',
  FIAT: 'fiat',
  FORD: 'ford',
  FOTON: 'foton',
  GEELY: 'geely',
  'GREAT WALL': 'great-wall',
  HAVAL: 'haval',
  HONDA: 'honda',
  HYUNDAI: 'hyundai',
  ISUZU: 'isuzu',
  JAC: 'jac',
  JEEP: 'jeep',
  JETOUR: 'jetour',
  KIA: 'kia',
  'LAND ROVER': 'land-rover',
  LEXUS: 'lexus',
  'MERCEDES BENZ': 'mercedes-benz',
  MINI: 'mini',
  MITSUBISHI: 'mitsubishi',
  NISSAN: 'nissan',
  PEUGEOT: 'peugeot',
  RAM: 'ram',
  RENAULT: 'renault',
  'SERO ELECTRIC': 'sero-electric',
  SHINERAY: 'shineray',
  SKYWELL: 'skywell',
  SMART: 'smart',
  SUBARU: 'subaru',
  SUZUKI: 'suzuki',
  TOYOTA: 'toyota',
  VOLKSWAGEN: 'volkswagen',
  VOLVO: 'volvo',
}

function normalizar(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

/** Índice modelo normalizado -> slugs, armado una sola vez por marca. */
const indicePorMarca = new Map<string, Map<string, string[]>>()
function indiceDe(marcaSlug: string): Map<string, string[]> {
  let idx = indicePorMarca.get(marcaSlug)
  if (idx) return idx
  idx = new Map()
  for (const m of todosLosModelos) {
    if (m.marcaId !== marcaSlug) continue
    const clave = normalizar(m.nombre)
    idx.set(clave, [...(idx.get(clave) ?? []), m.slug])
  }
  indicePorMarca.set(marcaSlug, idx)
  return idx
}

/** El slug de un modelo publicado (visible) de esa marca, si el nombre matchea. */
export function emparejar(marcaAcara: string, modeloAcara: string): string | null {
  const marcaSlug = MARCA_ACARA_A_SLUG[marcaAcara]
  if (!marcaSlug) return null
  const candidatos = indiceDe(marcaSlug).get(normalizar(modeloAcara))
  if (!candidatos?.length) return null
  // Si hay más de una versión publicada con el mismo nombre de modelo, cualquiera sirve de destino del link.
  return candidatos.find((s) => modelosPorId[s]) ?? null
}

export function nombreMarca(marcaAcara: string): string {
  const slug = MARCA_ACARA_A_SLUG[marcaAcara]
  return slug ? marcasPorId[slug].nombre : capitalizar(marcaAcara)
}

function capitalizar(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length <= 3 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
}

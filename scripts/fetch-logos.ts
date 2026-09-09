/**
 * Logos reales de las marcas, desde Wikimedia Commons.
 *
 * Los logos son marcas registradas. Los usamos para identificar a la marca de
 * la que estamos hablando, que es el uso nominativo de siempre en cualquier
 * medio de autos. No los alteramos ni los usamos como si fueran nuestros, y no
 * damos a entender que ninguna marca nos auspicia.
 *
 * Correr con: npm run fetch:logos
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { marcas } from '../src/data/marcas'

const PUBLIC = join(process.cwd(), 'public')
const MANIFIESTO = join(process.cwd(), 'src', 'data', 'logos-reales.json')
const UA = 'SHUKMOTOR/1.0 (proyecto editorial de autos, Argentina) node-fetch'

/** Búsqueda por marca. Varias tienen el archivo con un nombre concreto en Commons. */
const CONSULTAS: Record<string, string[]> = {
  'alfa-romeo': ['Alfa Romeo logo', 'Alfa Romeo'],
  audi: ['Audi logo', 'Audi rings'],
  baic: ['BAIC logo', 'BAIC Motor logo'],
  bmw: ['BMW logo', 'BMW'],
  byd: ['BYD Auto logo', 'BYD logo'],
  changan: ['Changan logo', 'Changan Automobile logo'],
  chery: ['Chery logo', 'Chery Automobile logo'],
  chevrolet: ['Chevrolet logo', 'Chevrolet bowtie'],
  citroen: ['Citroen logo', 'Citroën logo'],
  cupra: ['Cupra logo', 'CUPRA logo'],
  dfsk: ['DFSK logo', 'Dongfeng Sokon logo'],
  dodge: ['Dodge logo'],
  dongfeng: ['Dongfeng logo', 'Dongfeng Motor logo'],
  fiat: ['Fiat logo', 'FIAT Automobiles logo'],
  ford: ['Ford logo', 'Ford Motor Company logo'],
  foton: ['Foton logo', 'Foton Motor logo'],
  gwm: ['Great Wall Motors logo', 'GWM logo'],
  haval: ['Haval logo'],
  honda: ['Honda logo'],
  hyundai: ['Hyundai logo', 'Hyundai Motor Company logo'],
  isuzu: ['Isuzu logo'],
  jac: ['JAC Motors logo', 'JAC logo'],
  jaecoo: ['Jaecoo logo'],
  jeep: ['Jeep logo'],
  kia: ['Kia logo'],
  leapmotor: ['Leapmotor logo'],
  lexus: ['Lexus logo'],
  'lynk-co': ['Lynk Co logo', 'Lynk and Co logo'],
  mazda: ['Mazda logo'],
  'mercedes-benz': ['Mercedes-Benz logo', 'Mercedes Benz star'],
  mg: ['MG Motor logo', 'MG cars logo'],
  mitsubishi: ['Mitsubishi Motors logo'],
  nissan: ['Nissan logo'],
  omoda: ['Omoda logo'],
  peugeot: ['Peugeot logo'],
  polestar: ['Polestar logo'],
  ram: ['Ram Trucks logo', 'RAM logo'],
  renault: ['Renault logo'],
  suzuki: ['Suzuki logo'],
  toyota: ['Toyota logo', 'Toyota Motor Corporation logo'],
  volkswagen: ['Volkswagen logo'],
  volvo: ['Volvo logo', 'Volvo Cars logo'],
  xpeng: ['XPeng logo', 'Xpeng Motors logo'],
  zeekr: ['Zeekr logo'],
}

type LogoReal = { archivo: string; credito: string; licencia: string; pagina: string }

const manifiesto: Record<string, LogoReal> = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {}

function limpiarHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
}

async function api(params: Record<string, string>, intentos = 5): Promise<any> {
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
    await new Promise((res) => setTimeout(res, 1200 * (i + 1)))
  }
  throw ultimo
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  mkdirSync(join(PUBLIC, 'logos'), { recursive: true })
  let ok = 0

  for (const marca of marcas) {
    if (manifiesto[marca.id]) {
      ok++
      continue
    }
    const consultas = CONSULTAS[marca.id] ?? [`${marca.nombre} logo`]
    let elegido: { info: any; titulo: string; licencia: string } | null = null

    for (const q of consultas) {
      if (elegido) break
      let data: any
      try {
        data = await api({
          action: 'query',
          generator: 'search',
          gsrsearch: `${q} filetype:drawing`,
          gsrnamespace: '6',
          gsrlimit: '25',
          prop: 'imageinfo',
          iiprop: 'url|size|extmetadata',
        })
      } catch {
        console.warn(`  ${marca.id}: busqueda fallo [${q}]`)
        continue
      }
      const paginas: any[] = data?.query?.pages ?? []
      // Puntuamos: preferimos SVG, con el nombre de la marca en el título, sin "old"/"1970".
      const puntuados = paginas
        .map((p) => {
          const info = p.imageinfo?.[0]
          if (!info) return null
          const titulo: string = p.title.replace(/^File:/, '')
          const t = titulo.toLowerCase()
          if (!/\.svg$/i.test(titulo)) return null
          if (!t.includes('logo') && !t.includes(marca.nombre.toLowerCase().split(' ')[0])) return null
          let s = 0
          if (t.includes(marca.nombre.toLowerCase().replace(/[^a-z]/g, ''))) s += 5
          for (const w of marca.nombre.toLowerCase().split(/[\s&-]+/)) if (w.length > 2 && t.includes(w)) s += 3
          if (t.includes('logo')) s += 2
          if (/(old|historic|19\d\d|200\d|former|vintage|wordmark only|racing|f1|formula)/.test(t)) s -= 6
          if (s < 4) return null
          const licencia = limpiarHtml(info.extmetadata?.LicenseShortName?.value ?? '')
          return { info, titulo, licencia, s }
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.s - a.s)
      if (puntuados.length) elegido = puntuados[0] as any
      await dormir(300)
    }

    if (!elegido) {
      console.log(`${marca.id}: sin logo`)
      continue
    }

    try {
      // Commons tira 429 con facilidad. Sin reintento, media tabla se queda sin logo.
      let texto = ''
      for (let intento = 0; intento < 5; intento++) {
        const r = await fetch(elegido.info.url, { headers: { 'User-Agent': UA } })
        if (r.ok) {
          texto = await r.text()
          break
        }
        if (intento === 4) throw new Error(String(r.status))
        await dormir(2500 * (intento + 1))
      }
      if (!texto.includes('<svg')) throw new Error('no es svg')
      const archivo = `${marca.slug}-real.svg`
      writeFileSync(join(PUBLIC, 'logos', archivo), texto)
      manifiesto[marca.id] = {
        archivo,
        credito: limpiarHtml(elegido.info.extmetadata?.Artist?.value ?? '') || `Marca registrada de ${marca.nombre}`,
        licencia: elegido.licencia || 'Marca registrada, uso identificatorio',
        pagina: elegido.info.descriptionurl,
      }
      ok++
      console.log(`${marca.id}: ${elegido.titulo}`)
      writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
    } catch (e) {
      console.log(`${marca.id}: no se pudo bajar (${(e as Error).message})`)
    }
    await dormir(900)
  }

  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
  console.log(`\nMarcas con logo real: ${ok}/${marcas.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

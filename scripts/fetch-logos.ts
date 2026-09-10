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
  'alfa-romeo': ['Alfa Romeo logo', 'Alfa Romeo emblem'],
  audi: ['Audi logo', 'Audi rings'],
  baic: ['BAIC logo', 'BAIC Group logo', 'Beijing Automotive logo'],
  bmw: ['BMW logo', 'BMW emblem'],
  byd: ['BYD Auto logo', 'BYD logo'],
  changan: ['Changan logo', 'Changan Automobile logo'],
  chery: ['Chery logo', 'Chery Automobile logo'],
  chevrolet: ['Chevrolet logo', 'Chevrolet bowtie'],
  citroen: ['Citroen logo', 'Citroën logo', 'Citroen emblem'],
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
  ram: ['Ram Trucks logo', 'Ram pickup logo'],
  renault: ['Renault logo'],
  suzuki: ['Suzuki logo'],
  toyota: ['Toyota logo', 'Toyota Motor Corporation logo'],
  volkswagen: ['Volkswagen logo'],
  volvo: ['Volvo logo', 'Volvo Cars logo'],
  xpeng: ['XPeng logo', 'Xpeng Motors logo'],
  zeekr: ['Zeekr logo'],
  arcfox: ['Arcfox logo', 'ARCFOX'],
  avatr: ['Avatr logo', 'Avatr Technology logo'],
  bestune: ['Bestune logo', 'FAW Bestune logo'],
  coradir: ['Coradir logo', 'Coradir Tito'],
  deepal: ['Deepal logo', 'Changan Deepal logo'],
  ds: ['DS Automobiles logo', 'DS logo car'],
  forthing: ['Forthing logo', 'Dongfeng Forthing logo'],
  gac: ['GAC Group logo', 'GAC Motor logo', 'Guangzhou Automobile logo'],
  jmc: ['JMC logo', 'Jiangling Motors logo'],
  jmev: ['JMEV logo', 'Jiangling Motors Electric logo'],
  kaiyi: ['Kaiyi logo', 'Kaiyi Auto logo'],
  kgm: ['KG Mobility logo', 'KGM logo', 'SsangYong logo'],
  kyc: ['KYC logo', 'KYC Motors logo'],
  maxus: ['Maxus logo', 'LDV Maxus logo'],
  mini: ['MINI logo car', 'Mini Cooper logo', 'MINI marque logo'],
  ora: ['Ora logo car', 'Great Wall Ora logo', 'ORA brand logo'],
  rely: ['Rely logo car', 'Chery Rely logo'],
  'sero-electric': ['Sero Electric logo'],
  shineray: ['Shineray logo', 'Shineray Group logo'],
  skywell: ['Skywell logo', 'Skywell Auto logo'],
  smart: ['Smart automobile logo', 'Smart car logo', 'Smart marque logo'],
  spinner: ['Spinner logo car'],
  subaru: ['Subaru logo', 'Subaru Corporation logo'],
  tank: ['Tank logo car', 'Great Wall Tank logo', 'Tank brand logo'],
  zhidou: ['Zhidou logo', 'Zhidou Electric logo'],
  abarth: ['Abarth logo', 'Abarth emblem'],
  'great-wall': ['Great Wall Motors logo', 'Great Wall Motor logo'],
  iveco: ['Iveco logo'],
}

/**
 * Marcas cuyo logo existe en Commons con un título que la búsqueda genérica no
 * puede resolver: o la marca se nombra distinto (Great Wall se firma GWM), o el
 * título trae tanto texto alrededor que cualquier filtro sensato lo descarta.
 * Para estas se pide el archivo por nombre, verificado a mano.
 */
const EXACTOS: Record<string, string> = {
  'great-wall': 'GWM 2025 logo.svg',
  tank: 'Tank (Great Wall Motor brand) logo, global market.svg',
}

type LogoReal = { archivo: string; credito: string; licencia: string; pagina: string }

const manifiesto: Record<string, LogoReal> = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, 'utf8')) : {}

function limpiarHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
}

async function api(params: Record<string, string>, intentos = 8): Promise<any> {
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
    await new Promise((res) => setTimeout(res, 3000 * (i + 1)))
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

    if (EXACTOS[marca.id]) {
      try {
        const d = await api({ action: 'query', titles: `File:${EXACTOS[marca.id]}`, prop: 'imageinfo', iiprop: 'url|size|extmetadata' })
        const info = d?.query?.pages?.[0]?.imageinfo?.[0]
        if (info) elegido = { info, titulo: EXACTOS[marca.id], licencia: limpiarHtml(info.extmetadata?.LicenseShortName?.value ?? '') }
      } catch {
        console.warn(`  ${marca.id}: no se pudo pedir el archivo exacto`)
      }
    }

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
      const puntuados = paginas
        .map((p) => {
          const info = p.imageinfo?.[0]
          if (!info) return null
          const titulo: string = p.title.replace(/^File:/, '')
          const t = titulo.toLowerCase()
          if (!/\.svg$/i.test(titulo)) return null

          // Nombre de la marca, sin espacios ni signos, para comparar títulos.
          const marcaPlano = marca.nombre.toLowerCase().replace(/[^a-z0-9]/g, '')
          const tPlano = t.replace(/[^a-z0-9]/g, '')
          if (!tPlano.includes(marcaPlano)) return null

          // Otra empresa que tiene la misma palabra en el nombre. Buscando
          // "Mini logo" Commons devuelve el del Galaxy S5 Mini y el de Pokémon
          // mini, que puntuaban igual de bien que el de la marca de autos.
          if (/(samsung|galaxy|pokemon|ipad|iphone|kobo|nintendo|festival|airlines|bank|university|cooper tire)/.test(t)) return null

          // Filiales y submarcas: la aseguradora de Volkswagen, la obra social
          // de Audi, el equipo de competición. No son el logo de la marca.
          if (/(bkk|logistics|financial|immobilien|versicherung|leasing|bank|sportpark|stadium|arena|alliance|samsung motors|foundation|museum|dealer|club)/.test(t)) return null

          // Variantes que no sirven como logo suelto en una card.
          if (/(detail|lettering|typeface|silhouette|outline|animation|map|flag|chart)/.test(t)) return null

          // Logos viejos o de competición.
          if (/(old|historic|former|vintage|racing|f1|formula|rally|motorsport|18\d\d|19\d\d|20[01]\d)/.test(t)) return null

          // La regla que de verdad separa el logo de la marca de todo lo demás:
          // si al título le sacás el nombre de la marca y las palabras que
          // esperás alrededor de un logo, no tiene que quedar nada. Así se caen
          // "Jac-hensen logo" (una marca de ropa), "Jaecoo Premiership Women's
          // Rugby Logo" (un auspicio) y "Renault Samsung Motors logo", que
          // empiezan con el nombre correcto y no son lo que buscamos.
          const ESPERADAS =
            /^(logo|logotype|logotipo|marque|brand|emblem|emblema|badge|symbol|simbolo|icon|car|cars|auto|autos|automobile|automoviles|motor|motors|group|global|international|official|current|new|black|white|mono|flat|vector|svg|free|libre|simple|wordmark|logotipo|trucks|truck|automobiles|en|zh|es|fr|it|pt|the|el|la|[0-9]{1,4})$/
          const sobrantes = t
            .replace(/\.svg$/, '')
            .replace(new RegExp(marca.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '[^a-z0-9]*'), 'g'), ' ')
            .split(/[^a-z0-9]+/)
            .filter((w) => w && !ESPERADAS.test(w))
          if (sobrantes.length) return null

          let s = 0
          if (tPlano.startsWith(marcaPlano)) s += 6
          if (t.includes('logo')) s += 3
          // Cuanto más corto el título, menos calificativos alrededor del nombre.
          s += Math.max(0, 5 - Math.floor((titulo.length - marca.nombre.length) / 4))
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
      for (let intento = 0; intento < 8; intento++) {
        const r = await fetch(elegido.info.url, { headers: { 'User-Agent': UA } })
        if (r.ok) {
          texto = await r.text()
          break
        }
        if (intento === 7) throw new Error(String(r.status))
        await dormir(4000 * (intento + 1))
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

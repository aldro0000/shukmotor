import type { Marca, Origen } from '../types'
import logosReales from './logos-reales.json'

// Datos de ejemplo. Garantías, talleres y reventa son ilustrativos.

const TODAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]
const GRANDES = [
  'Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos',
  'Salta', 'Neuquén', 'Río Negro', 'Chubut', 'Misiones', 'Corrientes', 'Chaco', 'San Juan',
]
const MEDIAS = ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Neuquén', 'Salta']
const CHICAS = ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza']
const AMBA = ['Buenos Aires', 'CABA', 'Córdoba']

type Def = [
  nombre: string,
  slug: string,
  paisOrigen: string,
  origen: Origen,
  anioLlegada: number,
  importador: string,
  garantiaAnios: number,
  garantiaKm: number,
  talleres: number,
  provincias: string[],
  r12: number,
  r36: number,
]

const defs: Def[] = [
  ['Abarth', 'abarth', 'Italia', 'europa', 2012, 'Stellantis Argentina', 3, 100000, 9, CHICAS, 79, 56],
  ['Aion', 'aion', 'China', 'china', 2026, 'GAC Motor Argentina', 6, 150000, 4, AMBA, 72, 47],
  ['Alfa Romeo', 'alfa-romeo', 'Italia', 'europa', 1994, 'Stellantis Argentina', 3, 100000, 9, CHICAS, 80, 58],
  ['Arcfox', 'arcfox', 'China', 'china', 2026, 'Grupo Antelo', 5, 150000, 4, AMBA, 71, 46],
  ['Audi', 'audi', 'Alemania', 'europa', 1994, 'Audi Argentina (Volkswagen Group)', 3, 100000, 14, MEDIAS, 84, 64],
  ['Avatr', 'avatr', 'China', 'china', 2026, 'Grupo Corven', 5, 150000, 3, AMBA, 71, 46],
  ['Baic', 'baic', 'China', 'china', 2023, 'Grupo Antelo', 5, 150000, 12, MEDIAS, 74, 50],
  ['Bestune', 'bestune', 'China', 'china', 2025, 'Grupo Prestige (FAW)', 5, 150000, 6, AMBA, 71, 47],
  ['BMW', 'bmw', 'Alemania', 'europa', 1994, 'BMW Group Argentina', 3, 100000, 16, MEDIAS, 85, 66],
  ['BYD', 'byd', 'China', 'china', 2025, 'BYD Auto Argentina', 6, 150000, 10, MEDIAS, 78, 55],
  ['Changan', 'changan', 'China', 'china', 2024, 'Grupo Corven', 5, 150000, 11, MEDIAS, 73, 49],
  ['Chery', 'chery', 'China', 'china', 2008, 'Chery Argentina (Grupo Socma)', 5, 150000, 38, GRANDES, 79, 57],
  ['Chevrolet', 'chevrolet', 'Estados Unidos', 'usa', 1925, 'General Motors de Argentina', 3, 100000, 130, TODAS, 86, 68],
  ['Citroën', 'citroen', 'Francia', 'europa', 1960, 'Stellantis Argentina', 3, 100000, 62, TODAS, 82, 60],
  ['Coradir', 'coradir', 'Argentina', 'nacional', 2022, 'Coradir S.A. (San Luis)', 3, 60000, 7, CHICAS, 62, 38],
  ['Deepal', 'deepal', 'China', 'china', 2025, 'Grupo Corven', 5, 150000, 7, AMBA, 73, 49],
  ['DFSK', 'dfsk', 'China', 'china', 2016, 'Grupo Sohan', 3, 100000, 22, GRANDES, 70, 46],
  ['Dongfeng', 'dongfeng', 'China', 'china', 2024, 'Ralitor Argentina', 5, 150000, 9, CHICAS, 71, 47],
  ['DS Automobiles', 'ds', 'Francia', 'europa', 2015, 'Stellantis Argentina', 3, 100000, 11, CHICAS, 80, 58],
  ['Fiat', 'fiat', 'Italia', 'europa', 1919, 'Stellantis Argentina', 3, 100000, 118, TODAS, 85, 67],
  ['Ford', 'ford', 'Estados Unidos', 'usa', 1913, 'Ford Argentina', 3, 100000, 96, TODAS, 88, 71],
  ['Forthing', 'forthing', 'China', 'china', 2025, 'Ralitor Argentina', 5, 150000, 6, AMBA, 71, 47],
  ['Foton', 'foton', 'China', 'china', 2015, 'Grupo Corven', 3, 100000, 18, GRANDES, 70, 46],
  ['GAC Motor', 'gac', 'China', 'china', 2025, 'GAC Motor Argentina', 6, 150000, 8, CHICAS, 73, 49],
  ['Geely', 'geely', 'China', 'china', 2017, 'Grupo Bel Pao', 5, 150000, 10, MEDIAS, 74, 50],
  ['Great Wall', 'great-wall', 'China', 'china', 2024, 'GWM Argentina (Grupo Iraola)', 5, 150000, 14, MEDIAS, 76, 53],
  ['Haval', 'haval', 'China', 'china', 2018, 'Grupo Iraola', 5, 150000, 21, GRANDES, 76, 53],
  ['Honda', 'honda', 'Japón', 'japon', 1978, 'Honda Motor de Argentina', 3, 100000, 44, GRANDES, 90, 74],
  ['Hyundai', 'hyundai', 'Corea del Sur', 'corea', 1992, 'Hyundai Motor Argentina', 5, 100000, 40, GRANDES, 84, 65],
  ['Isuzu', 'isuzu', 'Japón', 'japon', 1997, 'Isuzu Argentina', 3, 100000, 17, GRANDES, 83, 65],
  ['Iveco', 'iveco', 'Italia', 'europa', 2010, 'Iveco Argentina', 3, 100000, 26, GRANDES, 80, 59],
  ['JAC', 'jac', 'China', 'china', 2011, 'JAC Motors Argentina', 3, 100000, 25, GRANDES, 72, 48],
  ['Jaecoo', 'jaecoo', 'China', 'china', 2025, 'Chery Argentina (Grupo Socma)', 6, 150000, 12, MEDIAS, 77, 54],
  ['Jeep', 'jeep', 'Estados Unidos', 'usa', 1993, 'Stellantis Argentina', 3, 100000, 58, TODAS, 84, 65],
  ['Jetour', 'jetour', 'China', 'china', 2019, 'Chery Argentina (Grupo Socma)', 6, 150000, 16, MEDIAS, 76, 53],
  ['JMC', 'jmc', 'China', 'china', 2019, 'Grupo Sohan', 3, 100000, 12, CHICAS, 69, 45],
  ['JMEV', 'jmev', 'China', 'china', 2025, 'Grupo Sohan', 5, 150000, 4, AMBA, 68, 44],
  ['Kaiyi', 'kaiyi', 'China', 'china', 2025, 'Chery Argentina (Grupo Socma)', 5, 150000, 7, AMBA, 72, 48],
  ['KGM', 'kgm', 'Corea del Sur', 'corea', 2025, 'KGM Motors Argentina', 5, 100000, 9, CHICAS, 78, 55],
  ['Kia', 'kia', 'Corea del Sur', 'corea', 1993, 'Kia Argentina', 5, 100000, 35, GRANDES, 84, 65],
  ['KYC', 'kyc', 'China', 'china', 2022, 'Grupo Prestige', 3, 100000, 6, AMBA, 67, 43],
  ['Land Rover', 'land-rover', 'Reino Unido', 'europa', 2010, 'JLR Argentina', 3, 100000, 8, CHICAS, 82, 61],
  ['Leapmotor', 'leapmotor', 'China', 'china', 2025, 'Stellantis Argentina', 6, 150000, 9, CHICAS, 74, 50],
  ['Lexus', 'lexus', 'Japón', 'japon', 2015, 'Toyota Argentina', 4, 100000, 6, AMBA, 88, 70],
  ['Lynk&Co', 'lynk-co', 'China', 'china', 2026, 'Grupo Antelo', 5, 150000, 5, AMBA, 74, 50],
  ['Maxus', 'maxus', 'China', 'china', 2019, 'Motorcar Argentina (SAIC)', 5, 150000, 13, MEDIAS, 74, 50],
  ['Mercedes-Benz', 'mercedes-benz', 'Alemania', 'europa', 1951, 'Mercedes-Benz Argentina', 3, 100000, 22, GRANDES, 85, 66],
  ['MG', 'mg', 'China', 'china', 2024, 'Motorcar Argentina (SAIC)', 5, 150000, 15, MEDIAS, 77, 54],
  ['MINI', 'mini', 'Reino Unido', 'europa', 2010, 'BMW Group Argentina', 3, 100000, 10, CHICAS, 83, 63],
  ['Mitsubishi', 'mitsubishi', 'Japón', 'japon', 1993, 'Mitsubishi Motors Argentina', 3, 100000, 24, GRANDES, 84, 66],
  ['Nissan', 'nissan', 'Japón', 'japon', 1997, 'Nissan Argentina', 3, 100000, 52, TODAS, 85, 67],
  ['Omoda', 'omoda', 'China', 'china', 2025, 'Chery Argentina (Grupo Socma)', 6, 150000, 12, MEDIAS, 77, 54],
  ['Ora', 'ora', 'China', 'china', 2025, 'GWM Argentina (Grupo Iraola)', 5, 150000, 8, CHICAS, 74, 50],
  ['Peugeot', 'peugeot', 'Francia', 'europa', 1965, 'Stellantis Argentina', 3, 100000, 88, TODAS, 84, 66],
  ['RAM', 'ram', 'Estados Unidos', 'usa', 2018, 'Stellantis Argentina', 3, 100000, 30, GRANDES, 86, 69],
  ['Rely', 'rely', 'China', 'china', 2025, 'Chery Argentina (Grupo Socma)', 5, 150000, 6, AMBA, 71, 47],
  ['Renault', 'renault', 'Francia', 'europa', 1955, 'Renault Argentina', 3, 100000, 122, TODAS, 84, 65],
  ['Sero Electric', 'sero-electric', 'Argentina', 'nacional', 2019, 'Sero Electric (Morón, Buenos Aires)', 3, 60000, 5, CHICAS, 60, 36],
  ['Shineray', 'shineray', 'China', 'china', 2018, 'Grupo Sohan', 3, 100000, 14, MEDIAS, 68, 44],
  ['Skywell', 'skywell', 'China', 'china', 2025, 'Grupo Antelo', 5, 150000, 6, AMBA, 70, 46],
  ['smart', 'smart', 'Alemania', 'europa', 2010, 'Mercedes-Benz Argentina', 3, 100000, 7, CHICAS, 77, 55],
  ['Spinner', 'spinner', 'China', 'china', 2026, 'Grupo Bel Pao', 5, 150000, 3, AMBA, 68, 44],
  ['Subaru', 'subaru', 'Japón', 'japon', 2010, 'Subaru Argentina (Grupo Deutsch)', 3, 100000, 13, MEDIAS, 86, 68],
  ['Suzuki', 'suzuki', 'Japón', 'japon', 1998, 'Suzuki Motor de Argentina', 3, 100000, 19, GRANDES, 86, 69],
  ['Tank', 'tank', 'China', 'china', 2025, 'GWM Argentina (Grupo Iraola)', 5, 150000, 9, CHICAS, 76, 53],
  ['Toyota', 'toyota', 'Japón', 'japon', 1997, 'Toyota Argentina', 5, 150000, 84, TODAS, 93, 80],
  ['Volkswagen', 'volkswagen', 'Alemania', 'europa', 1980, 'Volkswagen Group Argentina', 3, 100000, 120, TODAS, 87, 70],
  ['Volvo', 'volvo', 'Suecia', 'europa', 1996, 'Volvo Car Argentina (Ditecar)', 3, 100000, 7, CHICAS, 82, 62],
  ['Xpeng', 'xpeng', 'China', 'china', 2026, 'Grupo Bel Pao', 5, 150000, 4, AMBA, 72, 48],
  ['Zhidou', 'zhidou', 'China', 'china', 2026, 'Grupo Bel Pao', 5, 150000, 3, AMBA, 66, 42],
]

const ANIO_ACTUAL = 2026

type LogoRealJson = { archivo: string; credito: string; licencia: string; pagina: string; fondo?: 'claro' | 'oscuro' }
const logos = logosReales as Record<string, LogoRealJson>

/**
 * El logo real de Commons si lo tenemos; si no, el generado con las iniciales.
 * Los logos son marcas registradas y los usamos solo para identificar a la
 * marca de la que hablamos, nunca para dar a entender que nos auspicia.
 */
function logoDe(slug: string): string {
  return logos[slug] ? `/logos/${logos[slug].archivo}` : `/logos/${slug}.svg`
}

/** Un logo casi blanco necesita chip oscuro; el resto va sobre chip claro. */
export function logoEsClaro(slug: string): boolean {
  return logos[slug]?.fondo === 'claro'
}

export const marcas: Marca[] = defs.map(
  ([nombre, slug, paisOrigen, origen, anioLlegada, importador, garantiaAnios, garantiaKm, talleresOficiales, provinciasConService, reventa12mPct, reventa36mPct]) => ({
    id: slug,
    nombre,
    slug,
    logo: logoDe(slug),
    paisOrigen,
    origen,
    tipo: ANIO_ACTUAL - anioLlegada <= 3 ? 'nueva' : 'tradicional',
    anioLlegada,
    importador,
    garantiaAnios,
    garantiaKm,
    talleresOficiales,
    provinciasConService,
    reventa12mPct,
    reventa36mPct,
  }),
)

export const marcasPorId: Record<string, Marca> = Object.fromEntries(marcas.map((m) => [m.id, m]))

import type { Dimensiones, Opinion, Segmento } from '../types'
import { modelosBase, type ModeloBase } from './modelos-base'

/**
 * 400 opiniones de dueños. Datos de ejemplo, generadas de forma determinística
 * a partir de bancos de frases por segmento para que cada modelo tenga al
 * menos una y los más vendidos tengan varias.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260908)
const entre = (min: number, max: number) => Math.floor(min + rnd() * (max - min + 1))

const autores = [
  'Martín G.', 'Lucía P.', 'Federico R.', 'Carolina M.', 'Nicolás B.', 'Sofía T.', 'Gonzalo A.',
  'Valentina S.', 'Matías L.', 'Florencia D.', 'Ezequiel C.', 'Camila F.', 'Rodrigo V.', 'Agustina H.',
  'Sebastián O.', 'Julieta N.', 'Leandro Q.', 'Paula E.', 'Damián K.', 'Rocío I.', 'Hernán Z.',
  'Antonella W.', 'Marcos J.', 'Micaela U.', 'Facundo Y.', 'Brenda X.', 'Ariel M.', 'Daniela R.',
  'Cristian P.', 'Natalia G.', 'Pablo S.', 'Verónica L.', 'Diego T.', 'Mariana C.', 'Emiliano F.',
  'Guadalupe A.', 'Tomás D.', 'Melina B.', 'Iván H.', 'Silvina O.', 'Ramiro N.', 'Cecilia V.',
]

const bueno: Record<Segmento, string[]> = {
  hatch: [
    'Gasta muy poco en ciudad y estaciona en cualquier lado. Para el día a día es ideal.',
    'Lo uso para ir al trabajo todos los días y todavía no me dio un solo problema.',
    'El service es barato y lo hago en cualquier taller de barrio sin drama.',
    'Cómodo para dos personas, rinde bien en ruta a 120 y el consumo sorprende.',
    'Muy manejable, buen giro, la caja automática lo hace un auto de ciudad perfecto.',
    'Por lo que costó, trae más de lo que esperaba: pantalla, cámara y sensores.',
    'Lo compré como primer auto y fue una gran decisión: fácil, barato de mantener y seguro.',
  ],
  sedan: [
    'El baúl es enorme, entran las valijas de toda la familia sin pelear.',
    'Lo uso para trabajar y hace 60.000 km al año sin quejarse. Consumo estable.',
    'Muy cómodo atrás, mis suegros viajan sin protestar, que ya es decir.',
    'En ruta va planchado, silencioso, y el consumo a 110 es de auto chico.',
    'Se vendió rapidísimo el anterior, esta marca tiene mucha demanda de usados.',
    'La caja automática es suave y en la ciudad se agradece cada semáforo.',
  ],
  suv: [
    'La altura hace la diferencia en calles rotas y en la entrada de la casa de fin de semana.',
    'Espacio de sobra para dos sillitas y el cochecito en el baúl.',
    'Anda muy bien en ruta, tiene fuerza para pasar camiones sin sufrir.',
    'Bien equipado para el precio: cuero, techo, cámara, todo lo que uno busca.',
    'Consumo razonable para el tamaño. En ruta a 120 hace 14 km por litro.',
    'Fuimos al sur en enero con todo cargado y volvimos encantados.',
    'Muy silencioso adentro, la insonorización es de auto más caro.',
    'El service en la concesionaria fue rápido y sin sorpresas en la factura.',
  ],
  pickup: [
    'La uso en el campo de lunes a viernes y sale a pasear el finde. Aguanta todo.',
    'Carga una tonelada y se nota apenas. Motor con torque de sobra.',
    'El 4x4 me sacó del barro más de una vez, es una tracción de verdad.',
    'Con 80.000 km solo hice services. Repuestos en cualquier ciudad.',
    'Cómoda para viajar, no parece una camioneta de trabajo adentro.',
    'La reventa es una locura, me ofrecen casi lo que pagué hace dos años.',
    'Consumo bueno para el tamaño, en ruta anda en 9 litros con carga.',
  ],
  utilitario: [
    'Para reparto en ciudad es perfecta: entra en todos lados y carga muchísimo.',
    'Consumo bajísimo con el diésel, hago 700 km con un tanque.',
    'Simple, sin electrónica que se rompa, repuestos en cualquier lado.',
    'Los service son baratos y rápidos. Es una herramienta que no falla.',
    'Con los asientos traseros es un auto familiar decente, y sin ellos entra de todo.',
  ],
  monovolumen: [
    'Siete plazas de verdad, llevo a los chicos del club sin apretujarlos.',
    'El baúl con la tercera fila abajo es un camión. Salimos de vacaciones con todo.',
    'Fácil de manejar para el tamaño, buena visibilidad.',
    'Barata de mantener y repuestos económicos.',
  ],
}

const malo: Record<Segmento, string[]> = {
  hatch: [
    'El baúl es chico, con dos valijas grandes ya no cierra.',
    'En ruta con viento en contra le falta motor para sobrepasar.',
    'Los plásticos son duros y hacen ruidos con el frío.',
    'La pantalla se cuelga cada tanto y hay que reiniciar el auto.',
    'La suspensión es dura en empedrado, se siente cada pozo.',
    'El aire acondicionado sufre en verano a pleno sol.',
  ],
  sedan: [
    'El motor de tres cilindros vibra en ralentí, se nota en el volante.',
    'Consume más de lo que dice la marca en ciudad con aire prendido.',
    'La terminación interior podría ser mejor por lo que cuesta.',
    'El service oficial es caro comparado con un taller de confianza.',
    'Le falta apoyo lumbar en las butacas para viajes largos.',
  ],
  suv: [
    'Consume bastante en ciudad, cerca de 11 litros con tránsito pesado.',
    'La posventa fue lenta: un repuesto tardó tres semanas en llegar.',
    'La caja duda a baja velocidad en el tránsito de la ciudad.',
    'Baúl más chico de lo que parece por afuera.',
    'Las luces bajas iluminan poco en ruta de noche.',
    'El precio de la concesionaria no coincidió con la lista y hubo que negociar.',
    'Los neumáticos originales duraron 25.000 km, malísimos.',
  ],
  pickup: [
    'Dura sin carga, en la ciudad se siente cada bache atrás.',
    'Los frenos traseros a tambor son de otra época.',
    'La caja de carga sin cobertor se abolla con cualquier cosa.',
    'Se paga sobre lista y hay que esperar meses para la entrega.',
    'Consumo alto en ciudad, más de 12 litros.',
    'El interior es de flota, con plásticos duros que rayan al mirarlos.',
  ],
  utilitario: [
    'Cero confort, ruidosa en ruta y sin aislamiento.',
    'La seguridad es mínima, dos airbags y nada más.',
    'Posición de manejo incómoda para viajes largos.',
    'Con carga completa en subida pide mucho cambio.',
  ],
  monovolumen: [
    'El motor es viejo y consume mucho en ciudad.',
    'La tercera fila es para chicos, un adulto no entra.',
    'Ruidos de plásticos en el tablero desde los 10.000 km.',
  ],
}

const buenoElectrico = [
  'Cargo en casa de noche y el costo por kilómetro es ridículo comparado con nafta.',
  'Silencio total y aceleración inmediata, no vuelvo a un auto a combustión para la ciudad.',
  'Cero service más allá de neumáticos y filtro de aire. Un alivio.',
]
const maloElectrico = [
  'Para ir a la costa hay que planificar con los cargadores, todavía son pocos.',
  'En invierno la autonomía cae un 20%, hay que tenerlo en cuenta.',
  'Pocos talleres saben atenderlo, hay que ir al oficial sí o sí.',
]
const buenoHibrido = [
  'En ciudad anda casi todo el tiempo en eléctrico, el consumo es de 4 litros.',
  'Ni te enterás cuándo cambia de motor, es suavísimo.',
]
const maloHibrido = [
  'El baúl pierde espacio por la batería.',
  'El precio respecto a la versión nafta tarda en recuperarse si hacés pocos kilómetros.',
]

function baseCalidad(m: ModeloBase) {
  return m.veredicto === 'conviene' ? 4.3 : m.veredicto === 'con reparos' ? 3.7 : 3.1
}

function clamp(n: number, min = 1, max = 5) {
  return Math.max(min, Math.min(max, n))
}

function dimensiones(m: ModeloBase): Dimensiones {
  const base = baseCalidad(m)
  const jitter = () => Math.round(clamp(base + (rnd() - 0.5) * 2.4))
  const consumoBase = m.comb === 'electrico' ? 4.8 : m.comb === 'hibrido' ? 4.5 : m.consumo < 6.5 ? 4.3 : m.consumo > 9 ? 2.8 : base
  return {
    andar: jitter(),
    consumo: Math.round(clamp(consumoBase + (rnd() - 0.5) * 1.6)),
    posventa: Math.round(clamp(base + (m.disp === 'complicada' ? -1 : 0) + (rnd() - 0.5) * 2)),
    calidad: jitter(),
  }
}

function fecha(): string {
  const y = rnd() < 0.35 ? 2025 : 2026
  const mMax = y === 2026 ? 8 : 12
  const m = entre(1, mMax)
  const d = entre(1, 28)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const populares = [
  'toyota-hilux-srv', 'fiat-cronos-drive-cvt', 'toyota-corolla-cross-xli', 'chevrolet-tracker-lt',
  'volkswagen-polo-highline', 'peugeot-208-allure', 'ford-ranger-xlt', 'toyota-yaris-xs',
  'renault-kardian-evolution', 'chery-tiggo-4-pro', 'volkswagen-amarok-v6-extreme', 'fiat-strada-volcano',
  'toyota-corolla-xli', 'jeep-compass-longitude', 'volkswagen-taos-comfortline', 'byd-song-pro-dmi',
  'chevrolet-onix-lt', 'fiat-toro-volcano', 'haval-h6-hev', 'renault-duster-iconic-4x4',
  'volkswagen-t-cross-comfortline', 'chery-tiggo-7-pro', 'toyota-hilux-dx', 'jaecoo-j7',
  'nissan-kicks-advance', 'ford-territory-titanium', 'gwm-poer-elite',
]

const TOTAL = 400

// Solo opinan dueños. Un modelo con llegada confirmada todavía no tiene ninguno.
const conDuenios = modelosBase.filter((m) => m.estado === 'vigente')
const porSlug = Object.fromEntries(conDuenios.map((m) => [m.slug, m]))
const masOpinados = populares.filter((s) => porSlug[s])

const cola: ModeloBase[] = [...conDuenios]
let i = 0
while (cola.length < TOTAL && masOpinados.length) {
  cola.push(porSlug[masOpinados[i % masOpinados.length]])
  i++
}

/** Frases ya usadas por modelo, para que dos dueños del mismo auto no digan lo mismo. */
const dichas = new Map<string, Set<string>>()
function sinRepetir(modeloSlug: string, opciones: string[]): string {
  const clave = `${modeloSlug}`
  const ya = dichas.get(clave) ?? new Set<string>()
  const libres = opciones.filter((o) => !ya.has(o))
  const elegida = libres.length ? libres[Math.floor(rnd() * libres.length)] : opciones[Math.floor(rnd() * opciones.length)]
  ya.add(elegida)
  dichas.set(clave, ya)
  return elegida
}

let usados = 0
export const opiniones: Opinion[] = cola.map((m, idx) => {
  const dims = dimensiones(m)
  const prom = (dims.andar + dims.consumo + dims.posventa + dims.calidad) / 4
  const puntaje = Math.round(clamp(prom + (rnd() - 0.5) * 0.8))
  const esEl = m.comb === 'electrico'
  const esHib = m.comb === 'hibrido'
  const fuenteBueno = esEl ? [...buenoElectrico, ...bueno[m.seg]] : esHib ? [...buenoHibrido, ...bueno[m.seg]] : bueno[m.seg]
  const fuenteMalo = esEl ? [...maloElectrico, ...malo[m.seg]] : esHib ? [...maloHibrido, ...malo[m.seg]] : malo[m.seg]
  const loBueno = sinRepetir(`b-${m.slug}`, fuenteBueno)
  const loMalo = sinRepetir(`m-${m.slug}`, fuenteMalo)
  const autor = autores[(usados++ * 7 + idx) % autores.length]
  return {
    id: `op-${String(idx + 1).padStart(3, '0')}`,
    modeloId: m.slug,
    autor,
    fecha: fecha(),
    puntaje,
    kmRecorridos: entre(3, 95) * 1000 + entre(0, 900),
    dimensiones: dims,
    loBueno,
    loMalo,
    util: entre(0, 140),
  }
})

export const opinionesPorModelo: Record<string, Opinion[]> = {}
for (const o of opiniones) {
  ;(opinionesPorModelo[o.modeloId] ??= []).push(o)
}

import type { Novedad } from '../types'
import fotosNotas from './fotos-novedades.json'

// Datos de ejemplo. Las cifras son ilustrativas.

type Def = Omit<Novedad, 'id' | 'imagen' | 'imagenCredito' | 'imagenFuente' | 'imagenWidth' | 'imagenHeight'>

const defs: Def[] = [
  {
    slug: 'byd-song-pro-precio-argentina',
    titulo: 'BYD Song Pro DM-i: el híbrido enchufable que le baja el precio al Corolla Cross',
    bajada: 'Llega con 70 km eléctricos, 218 CV y un precio 13 millones abajo del Toyota híbrido. Miramos qué se gana y qué se pierde.',
    fecha: '2026-09-04',
    categoria: 'lanzamiento',
    cuerpo: `BYD abrió la venta del Song Pro DM-i en Argentina con un precio de lista de 55,8 millones de pesos, casi 13 millones por debajo del Corolla Cross SEG Hybrid, que hasta ahora era la referencia entre los SUV medianos electrificados.\n\nLa mecánica combina un motor 1.5 naftero con uno eléctrico y una batería que permite unos 70 kilómetros sin consumir combustible si se carga en casa. Con la batería descargada, el consumo declarado ronda los 5 litros cada 100 km.\n\nLo que no cambia es la pregunta de siempre con las marcas nuevas: cuánto va a valer en tres años. BYD tiene diez talleres en el país y una garantía de seis años, pero todavía no hay usados en el mercado que marquen referencia. Por eso en La Posta lo damos por conviene, con la aclaración de que quien lo compre es de los primeros.`,
  },
  {
    slug: 'precios-septiembre-2026-lista-completa',
    titulo: 'Precios de septiembre: qué subió, qué bajó y dónde hay descuento',
    bajada: 'Las marcas actualizaron listas entre 1% y 3%. Chevrolet y Renault siguen con descuentos de calle en los volumen.',
    fecha: '2026-09-02',
    categoria: 'precios',
    cuerpo: `Con el inicio de septiembre, las listas oficiales se movieron entre 1 y 3 por ciento, en línea con los últimos meses. Toyota volvió a ser la más moderada con ajustes por debajo del 2 por ciento en Yaris y Corolla.\n\nLa diferencia está en el precio de calle. Chevrolet Onix y Tracker se consiguen entre 4 y 6 por ciento por debajo de lista en concesionarias con stock, y Renault mantiene bonificaciones en Kwid y Duster. En la vereda de enfrente, Hilux, SW4 y Yaris Cross siguen pagándose sobre lista por falta de unidades.\n\nEntre las chinas, Chery movió Tiggo 4 y 7 apenas 1 por ciento y Haval congeló el H6 híbrido. Actualizamos todos los precios del buscador con estos valores de referencia.`,
  },
  {
    slug: 'hilux-vs-ranger-vs-poer-comparativa',
    titulo: 'Hilux SRV, Ranger XLT y GWM Poer: la pickup china entra a la pelea',
    bajada: 'Las dos de siempre contra una recién llegada que cuesta 20 millones menos. Tres días en ruta, campo y ciudad.',
    fecha: '2026-08-28',
    categoria: 'comparativa',
    cuerpo: `Pusimos en el mismo camino a la Toyota Hilux SRV, la Ford Ranger XLT V6 y la GWM Poer Elite. Las dos primeras rondan los 72 millones; la china, 53.\n\nEn andar, la Ranger es otra cosa: el V6 de 250 CV y el interior nuevo la dejan sola. La Hilux sigue siendo la más simple y la que menos dudas genera a 200.000 km. La Poer sorprende con equipamiento de tope de gama, buen aislamiento y una caja automática correcta, pero el motor de 163 CV se siente justo con carga.\n\nEl veredicto depende de cuánto tiempo la vas a tener. A tres años, la reventa de Toyota y Ford paga la diferencia de precio. A ocho años o más, o para una flota que amortiza por uso, la Poer es una compra razonable.`,
  },
  {
    slug: 'que-auto-comprar-con-35-millones',
    titulo: 'Tengo 35 millones: los siete autos que entran y cuál nos convence',
    bajada: 'Es el rango donde más gente compra. Van hatch, sedán, un SUV chico y hasta una pickup compacta.',
    fecha: '2026-08-25',
    categoria: 'analisis',
    cuerpo: `Treinta y cinco millones de pesos es hoy el presupuesto más común en el buscador de SHUKMOTOR. Entran el Peugeot 208 Allure automático, el Toyota Yaris XS, el Chevrolet Onix LT, el Fiat Cronos con CVT, el Fiat Pulse, la Fiat Strada Volcano y, sumando algo, el Renault Kardian.\n\nSi el auto es para ciudad y querés olvidarte de él, el Yaris. Si querés el mejor interior y andar, el 208. Si necesitás baúl, el Cronos no tiene rival. Y si el uso es mixto entre trabajo y familia, la Strada con CVT es una opción que muchos no consideran.\n\nNuestra elección general para ese presupuesto es el Kardian: caja de doble embrague, motor turbo y espacio de SUV a precio de hatch equipado.`,
  },
  {
    slug: 'opiniones-duenos-tiggo-4-pro-30000-km',
    titulo: 'Lo que dicen los dueños del Tiggo 4 Pro después de 30.000 km',
    bajada: 'Relevamos 14 opiniones de dueños. Coinciden en el motor y en el consumo; se quejan de la reventa y de algunos service.',
    fecha: '2026-08-21',
    categoria: 'opiniones',
    cuerpo: `El Chery Tiggo 4 Pro es uno de los modelos con más opiniones cargadas en SHUKMOTOR. Cruzamos las que superan los 30.000 kilómetros para ver qué pasa cuando se termina la novedad.\n\nEl motor 1.5 turbo de 147 CV es lo más elogiado: nadie lo describe como corto. El equipamiento por el precio aparece en casi todas. Del otro lado, el consumo en ciudad está por encima de lo declarado y varios dueños mencionan demoras de dos a tres semanas para piezas de carrocería.\n\nLa reventa es la queja de fondo. Los dueños que intentaron venderlo al año recibieron ofertas de 70 a 75 por ciento del valor del 0km. Es un dato para decidir con los ojos abiertos: si lo vas a tener cinco años, no pesa; si lo cambiás cada dos, pesa mucho.`,
  },
  {
    slug: 'ford-ranger-xlt-v6-test',
    titulo: 'Ford Ranger XLT V6: la pickup que hoy anda mejor en Argentina',
    bajada: 'Doscientos cincuenta caballos, caja de diez marchas y un interior que le saca años a la competencia.',
    fecha: '2026-08-18',
    categoria: 'analisis',
    cuerpo: `La Ranger fabricada en Pacheco es, en andar, la mejor pickup mediana que se vende en el país. El V6 turbodiésel de 250 CV con la caja automática de diez marchas hace que sobrepasar en ruta sea un trámite.\n\nAdentro, la pantalla vertical y la calidad de los materiales la dejan más cerca de un SUV que de una camioneta. En el campo, con la reductora y el bloqueo trasero, no tiene problemas.\n\nLo único donde pierde contra la Hilux es en reventa: a tres años, un usado Ford conserva unos siete puntos menos que uno Toyota. Para quien la va a tener mucho tiempo, es la mejor compra.`,
  },
  {
    slug: 'toyota-yaris-cross-sobreprecio',
    titulo: 'Yaris Cross: por qué se paga hasta 10% sobre lista y si vale la pena',
    bajada: 'La demanda supera la producción y las concesionarias cobran la diferencia. Comparamos con lo que se consigue a precio de lista.',
    fecha: '2026-08-14',
    categoria: 'precios',
    cuerpo: `El Toyota Yaris Cross se vende con listas de espera de 45 días o más y, en varias concesionarias, con un sobreprecio que llega al 10 por ciento sobre el precio oficial.\n\nEl auto en sí es un Yaris más alto, con el mismo motor 1.5 de 107 CV. Su ventaja es la marca, el consumo y una reventa que hoy es la mejor del segmento.\n\nCon la misma plata, y sin esperar, se consiguen un Chevrolet Tracker con más motor, un Renault Kardian con caja de doble embrague o un Chery Tiggo 4 Pro con más equipamiento. Nuestra recomendación es esperar solo si la reventa es lo primero en la lista.`,
  },
  {
    slug: 'reventa-2026-que-marcas-mantienen-valor',
    titulo: 'Reventa 2026: Toyota sigue arriba, las chinas mejoran y las premium sorprenden',
    bajada: 'Actualizamos la tabla de retención de valor a 12 y 36 meses con datos de todas las marcas que venden en el país.',
    fecha: '2026-08-11',
    categoria: 'analisis',
    cuerpo: `La tabla de reventa que usamos en el buscador se actualizó con los valores de usados de agosto. Toyota conserva el primer lugar con 93 por ciento a 12 meses y 80 a 36 meses, seguida por Honda y Ford.\n\nLo nuevo es que las marcas chinas con más años en el país mejoraron: Chery pasó de 55 a 57 por ciento a 36 meses y Haval se acerca a Jeep. Las recién llegadas siguen por debajo de 50 porque todavía no hay mercado de usados que las respalde.\n\nEntre las premium, BMW mantiene mejor valor que Audi y Mercedes, y Volvo queda algo más abajo por su red chica. Los datos completos están en la sección Reventa.`,
  },
  {
    slug: 'kardian-vs-t-cross-vs-pulse',
    titulo: 'Kardian, T-Cross y Pulse: tres SUV chicos automáticos por menos de 45 millones',
    bajada: 'El Renault sorprende, el VW cuesta más y el Fiat es el más barato. Los tres cara a cara.',
    fecha: '2026-08-07',
    categoria: 'comparativa',
    cuerpo: `El segmento de SUV chicos con caja automática es el que más creció en el año. Comparamos los tres más consultados en el buscador de presupuesto: Renault Kardian Evolution, Volkswagen T-Cross Comfortline y Fiat Pulse Drive.\n\nEl Kardian gana en mecánica: motor turbo de 120 CV y caja de doble embrague por 37 millones. El T-Cross tiene la mejor terminación y la mejor reventa, pero cuesta 7 millones más con un motor de 101 CV. El Pulse es el más barato y el más justo de motor.\n\nSi la plata alcanza para el T-Cross, la diferencia se recupera en parte al venderlo. Si no, el Kardian es la mejor compra del grupo, y por bastante.`,
  },
  {
    slug: 'jaecoo-j7-lanzamiento-argentina',
    titulo: 'Jaecoo J7: la marca nueva de Chery apunta al Corolla Cross',
    bajada: 'Con 186 CV, diseño de SUV inglés y 55,9 millones de precio de lista, llega para pelear en el segmento más caliente.',
    fecha: '2026-08-04',
    categoria: 'lanzamiento',
    cuerpo: `Jaecoo, la segunda marca del grupo Chery en Argentina, presentó el J7 con un precio de lista de 55,9 millones, exactamente donde está el Corolla Cross XLI.\n\nEl motor es el 1.6 turbo de 186 CV del Tiggo 7 Pro, con caja de doble embrague de siete marchas. El interior está un escalón arriba de Chery, con pantalla de 14 pulgadas y materiales blandos en todo el tablero.\n\nLa red es compartida con Chery, lo que le da una ventaja sobre otras marcas nuevas. Lo que falta es historia de reventa: el J7 recién empieza a aparecer en el mercado de usados.`,
  },
  {
    slug: 'hibridos-argentina-guia-2026',
    titulo: 'Guía de híbridos 2026: cuáles hay, cuánto ahorran y cuándo conviene',
    bajada: 'Del Corolla híbrido al Haval H6, pasando por los enchufables chinos. Los números de cada uno.',
    fecha: '2026-07-31',
    categoria: 'analisis',
    cuerpo: `El mercado de híbridos en Argentina pasó de dos modelos a más de diez en dos años. Están los híbridos convencionales como el Corolla y el Corolla Cross de Toyota o el Haval H6, y los enchufables como el BYD Song Pro y el Lynk&Co 01.\n\nLa cuenta es simple: un híbrido convencional ahorra entre 30 y 40 por ciento de nafta en ciudad respecto al mismo auto a combustión. A 15.000 kilómetros por año, son unas 400.000 pesos anuales. La diferencia de precio con la versión nafta se recupera en tres a cinco años.\n\nLos enchufables cambian la ecuación si tenés dónde cargarlos: con 70 kilómetros eléctricos diarios, la nafta pasa a ser un gasto de fin de semana.`,
  },
  {
    slug: 'fiat-cronos-por-que-sigue-primero',
    titulo: 'Fiat Cronos: por qué sigue siendo el auto más vendido del país',
    bajada: 'No es el más lindo ni el más rápido. Es el que mejor resuelve la ecuación precio, baúl y posventa.',
    fecha: '2026-07-28',
    categoria: 'analisis',
    cuerpo: `El Cronos lleva varios años al tope del ranking de patentamientos y este año no es distinto. Con la versión Drive CVT en 31 millones, es el sedán automático más barato del mercado.\n\nLos dueños coinciden: el baúl de 525 litros, el consumo del 1.3 y la posventa Fiat con más de cien talleres explican la elección. Nadie lo describe como un auto que enamora.\n\nEn La Posta lo damos por conviene sin dudar. Es el auto que se compra cuando la prioridad es que no dé problemas y que se venda fácil.`,
  },
  {
    slug: 'electricos-baratos-byd-dolphin-mini-vs-mg4',
    titulo: 'BYD Dolphin Mini contra MG4: los dos eléctricos por menos de 50 millones',
    bajada: 'Uno es chico y baratísimo de usar; el otro anda como un deportivo. Ninguno sirve para la ruta larga todavía.',
    fecha: '2026-07-24',
    categoria: 'comparativa',
    cuerpo: `Con la baja de aranceles a eléctricos, aparecieron dos opciones por debajo de 50 millones: el BYD Dolphin Mini en 35,9 y el MG4 en 48,9.\n\nEl Dolphin Mini es un auto de ciudad de cuatro plazas con 250 kilómetros reales de autonomía. El MG4 es un hatch de tamaño normal, con tracción trasera, 350 kilómetros y un andar que sorprende.\n\nLos dos comparten el mismo problema: cargar en ruta sigue siendo una aventura fuera de la Panamericana y la ruta 2. Como segundo auto de ciudad, el BYD es imbatible en costo. Como único auto, el MG4 se acerca más, sin llegar.`,
  },
  {
    slug: 'toyota-hilux-2027-que-se-sabe',
    titulo: 'La próxima Hilux: qué se sabe de la generación que llega en 2027',
    bajada: 'Nueva plataforma, motor híbrido y producción en Zárate. Lo confirmado y lo que todavía es rumor.',
    fecha: '2026-07-21',
    categoria: 'lanzamiento',
    cuerpo: `Toyota confirmó que la próxima generación de Hilux se fabricará en Zárate desde 2027, con una versión híbrida suave del 2.8 turbodiésel.\n\nLo confirmado: nueva plataforma, más ancha, con suspensión revisada y un interior con pantalla grande. Lo que no: si va a haber versión eléctrica pura para el país y cuánto va a costar.\n\nPara quien está por comprar hoy, el dato importa: la Hilux actual va a seguir en producción un tiempo y su reventa no debería caer, porque el cambio de generación suele tardar en pegar en los usados de Toyota.`,
  },
  {
    slug: 'posventa-marcas-chinas-encuesta',
    titulo: 'Posventa de marcas chinas: qué contestaron 200 dueños',
    bajada: 'Chery y Haval sacan buena nota; las recién llegadas, no tanto. Los tiempos de espera de repuestos, en detalle.',
    fecha: '2026-07-17',
    categoria: 'opiniones',
    cuerpo: `Cruzamos las opiniones cargadas por dueños de autos de marcas chinas y nos quedamos con las que hablan de posventa.\n\nChery y Haval, con más de cinco años en el país, tienen tiempos de espera de repuestos parecidos a los de las marcas tradicionales para piezas de desgaste. Para carrocería, entre dos y cuatro semanas.\n\nLas marcas que llegaron en los últimos dos años tienen otro panorama: pocos talleres, piezas que viajan desde el importador y algunos casos de más de un mes de espera. El consejo es simple: antes de comprar una marca nueva, preguntá dónde está el taller más cercano y cuánto tarda un parabrisas.`,
  },
  {
    slug: 'pickups-compactas-strada-montana-toro',
    titulo: 'Strada, Montana y Toro: cuál pickup chica conviene según el uso',
    bajada: 'Trabajo puro, mixto o familia con caja: cada una resuelve algo distinto.',
    fecha: '2026-07-14',
    categoria: 'comparativa',
    cuerpo: `Las pickups compactas son el segmento donde más se mezclan trabajo y familia. Probamos la Fiat Strada Volcano CVT, la Chevrolet Montana LTZ y la Fiat Toro Volcano diésel 4x4.\n\nPara trabajo puro en ciudad, la Strada: carga bien, gasta poco y vale mucho usada. Para uso mixto, la Montana tiene la caja más grande y anda como un auto. Para familia que quiere pickup, la Toro diésel con 4x4 es otra categoría en confort y precio.\n\nLas tres tienen buena posventa, porque son de las marcas con más talleres del país.`,
  },
  {
    slug: 'que-auto-comprar-con-60-millones',
    titulo: 'Tengo 60 millones: SUV mediano, pickup o híbrido',
    bajada: 'Es el rango donde entran el Corolla Cross, el Taos, la S10 y los híbridos chinos. Las opciones y nuestra elección.',
    fecha: '2026-07-10',
    categoria: 'analisis',
    cuerpo: `Con 60 millones de pesos se abre el mercado de los SUV medianos y de las pickups con descuento. Entran el Toyota Corolla Cross XLI, el Volkswagen Taos, el Jeep Compass, el Haval H6 híbrido, el BYD Song Pro y la Chevrolet S10 High Country si conseguís precio de calle.\n\nSi la reventa manda, el Corolla Cross. Si querés andar y baúl, el Taos. Si querés gastar menos nafta y no te preocupa la marca al venderlo, el H6 híbrido tiene 243 CV y consume cinco litros.\n\nNuestra elección para ese presupuesto es el Corolla Cross XLI para quien lo cambia en tres años y el Haval H6 para quien lo va a tener seis o más.`,
  },
  {
    slug: 'amarok-nueva-generacion-2026',
    titulo: 'Amarok: la V6 se despide con descuento y la nueva llega a fin de año',
    bajada: 'Volkswagen liquida stock de la generación actual mientras prepara la nueva, que comparte base con la Ranger.',
    fecha: '2026-07-07',
    categoria: 'precios',
    cuerpo: `La Volkswagen Amarok V6 se consigue con descuentos de hasta 4 por ciento sobre lista en concesionarias con stock. La razón es que la nueva generación, desarrollada junto con Ford y con la base de la Ranger, llega a fin de año.\n\nLa V6 actual sigue siendo la que mejor anda en ruta entre las medianas, con 258 CV. El interior es de 2010 y se nota al lado de la Ranger.\n\nPara quien busca una pickup potente hoy y no le molesta que sea el último modelo de una generación, es un buen momento. La reventa de la V6 se mantuvo bien históricamente.`,
  },
  {
    slug: 'suv-7-plazas-baratos-argentina',
    titulo: 'Siete plazas por menos de 65 millones: las cuatro opciones que hay',
    bajada: 'C3 Aircross, Spin, Tiggo 8 Pro y, con esfuerzo, la SW4 usada. Qué da cada una.',
    fecha: '2026-07-03',
    categoria: 'analisis',
    cuerpo: `Las familias numerosas tienen pocas opciones nuevas en el país. Por debajo de 65 millones hay cuatro caminos: Citroën C3 Aircross 7 plazas, Chevrolet Spin, Chery Tiggo 8 Pro y la Volkswagen Taos si se acepta que las plazas extra no existen.\n\nEl C3 Aircross es el más barato con 38,7 millones y una tercera fila para chicos. La Spin es el único monovolumen que queda y tiene siete plazas de verdad con motor viejo. El Tiggo 8 Pro es otra categoría: 254 CV, tracción integral y equipamiento completo por 62,9.\n\nSi el presupuesto llega, el Tiggo 8 Pro es de las mejores compras del mercado para familia grande.`,
  },
  {
    slug: 'independencia-editorial-como-trabajamos',
    titulo: 'Cómo trabajamos: no cobramos de marcas ni de importadores',
    bajada: 'Nuestra regla de independencia, explicada. Qué links generan comisión y qué no cambia nunca.',
    fecha: '2026-06-30',
    categoria: 'analisis',
    cuerpo: `SHUKMOTOR no recibe dinero de marcas, importadores ni concesionarias. Ninguna ficha, veredicto ni comparativa se vende, y ninguna marca puede pedir que se cambie una nota.\n\nLos únicos ingresos son algunos links de compra que llevan a tiendas externas y que pueden generarnos una comisión si terminás comprando. Esos links están marcados y no influyen en el orden de los resultados ni en La Posta.\n\nLas opiniones son de dueños, con kilómetros recorridos, y no de prensa. Nunca cobramos por escribir una opinión ni por publicarla. Si encontrás algo que no cierra, escribinos.`,
  },
]

type FotoNotaJson = {
  archivo: string
  credito: string
  fuente: string
  licencia: string
  pagina: string
  width: number
  height: number
}

const reales = fotosNotas as Record<string, FotoNotaJson>

export const novedades: Novedad[] = defs.map((d) => {
  const f = reales[d.slug]
  return {
    ...d,
    id: d.slug,
    imagen: f ? `/fotos/novedades/${f.archivo}` : `/fotos/novedades/${d.slug}-1600x1000.svg`,
    imagenCredito: f ? f.credito : 'Ilustración SHUKMOTOR',
    imagenFuente: f ? `${f.fuente} · ${f.pagina}` : 'Sin foto real disponible con licencia libre',
    imagenWidth: f ? f.width : 1600,
    imagenHeight: f ? f.height : 1000,
  }
})

export const novedadesPorSlug: Record<string, Novedad> = Object.fromEntries(novedades.map((n) => [n.slug, n]))

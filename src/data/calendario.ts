import type { EventoCalendario } from '../types'

// Datos de ejemplo. Fechas confirmadas por la marca o estimadas por la redacción.

const M = 1_000_000

export const eventosCalendario: EventoCalendario[] = [
  {
    id: 'ev-01', fecha: '2026-09-15', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'chevrolet',
    titulo: 'Chevrolet Spark EUV', detalle: 'SUV eléctrico chico importado de China, con 300 km de autonomía. Apunta al BYD Yuan Pro.',
    segmento: 'suv', precioEstimadoARS: 44 * M, fuente: 'Anuncio de GM Argentina',
  },
  {
    id: 'ev-02', fecha: '2026-09-22', estado: 'confirmado', tipo: 'nueva-version', marcaId: 'toyota',
    titulo: 'Toyota Hilux GR-Sport IV', detalle: 'Versión tope con suspensión revisada y 224 CV. Se suma a la gama actual antes del cambio de generación.',
    modeloSlug: 'toyota-hilux-srv', segmento: 'pickup', precioEstimadoARS: 92 * M, fuente: 'Toyota Argentina',
  },
  {
    id: 'ev-03', fecha: '2026-10-01', estado: 'estimado', tipo: 'llegada-marca', marcaId: 'xpeng',
    titulo: 'Xpeng abre su primer concesionario en Córdoba', detalle: 'Segundo punto de venta del país después de CABA. Con el G6 y el P7 en exhibición.',
    fuente: 'Estimación SHUKMOTOR según el importador',
  },
  {
    id: 'ev-04', fecha: '2026-10-08', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'renault',
    titulo: 'Renault Boreal', detalle: 'SUV mediano de siete plazas fabricado en Brasil, arriba del Kardian. Motor 1.3 turbo de 163 CV.',
    segmento: 'suv', precioEstimadoARS: 52 * M, fuente: 'Renault Argentina',
  },
  {
    id: 'ev-05', fecha: '2026-10-15', estado: 'confirmado', tipo: 'preventa', marcaId: 'volkswagen',
    titulo: 'Preventa Volkswagen Tera', detalle: 'SUV chico brasileño que va abajo del T-Cross. Preventa online con seña y entrega en diciembre.',
    segmento: 'suv', precioEstimadoARS: 36 * M, fuente: 'Volkswagen Argentina',
  },
  {
    id: 'ev-06', fecha: '2026-10-01', estado: 'estimado', tipo: 'lanzamiento', marcaId: 'byd',
    titulo: 'BYD Shark pickup híbrida enchufable', detalle: 'La primera pickup enchufable del país. 430 CV combinados y 100 km eléctricos. Competiría con Ranger y Amarok.',
    segmento: 'pickup', precioEstimadoARS: 78 * M, fuente: 'Estimación SHUKMOTOR',
  },
  {
    id: 'ev-07', fecha: '2026-11-05', estado: 'confirmado', tipo: 'restyling', marcaId: 'fiat',
    titulo: 'Fiat Cronos rediseñado', detalle: 'Nuevo frente, pantalla de 10 pulgadas y control de estabilidad de serie en toda la gama. Mismo motor 1.3.',
    modeloSlug: 'fiat-cronos-drive-cvt', segmento: 'sedan', precioEstimadoARS: 32.5 * M, fuente: 'Stellantis Argentina',
  },
  {
    id: 'ev-08', fecha: '2026-11-12', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'jaecoo',
    titulo: 'Jaecoo J5 eléctrico', detalle: 'SUV compacto 100% eléctrico con 400 km de autonomía. Segundo modelo de la marca en el país.',
    segmento: 'suv', precioEstimadoARS: 49 * M, fuente: 'Chery Argentina',
  },
  {
    id: 'ev-09', fecha: '2026-11-01', estado: 'estimado', tipo: 'llegada-marca', marcaId: 'lynk-co',
    titulo: 'Lynk&Co suma el 08 híbrido enchufable', detalle: 'SUV mediano con 200 km eléctricos declarados. Sería el enchufable de mayor autonomía del mercado.',
    segmento: 'suv', precioEstimadoARS: 82 * M, fuente: 'Estimación SHUKMOTOR según prensa internacional',
  },
  {
    id: 'ev-10', fecha: '2026-11-20', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'ford',
    titulo: 'Ford Everest', detalle: 'SUV grande de siete plazas sobre la base de la Ranger, con el V6 diésel. Rival directo de la SW4.',
    segmento: 'suv', precioEstimadoARS: 105 * M, fuente: 'Ford Argentina',
  },
  {
    id: 'ev-11', fecha: '2026-12-03', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'volkswagen',
    titulo: 'Nueva Volkswagen Amarok', detalle: 'Segunda generación, desarrollada con Ford, fabricada en Pacheco. Motores 2.0 biturbo y V6.',
    modeloSlug: 'volkswagen-amarok-v6-extreme', segmento: 'pickup', precioEstimadoARS: 78 * M, fuente: 'Volkswagen Argentina',
  },
  {
    id: 'ev-12', fecha: '2026-12-01', estado: 'estimado', tipo: 'llegada-marca', marcaId: 'leapmotor',
    titulo: 'Leapmotor B10', detalle: 'SUV compacto eléctrico por debajo de los 45 millones. Sería el segundo modelo de la marca vía Stellantis.',
    segmento: 'suv', precioEstimadoARS: 44 * M, fuente: 'Estimación SHUKMOTOR',
  },
  {
    id: 'ev-13', fecha: '2026-12-10', estado: 'confirmado', tipo: 'nueva-version', marcaId: 'peugeot',
    titulo: 'Peugeot 2008 híbrido 48V', detalle: 'Versión híbrida suave del 1.2 turbo, con caja de doble embrague. Consumo declarado 5,2 litros.',
    modeloSlug: 'peugeot-2008-allure', segmento: 'suv', precioEstimadoARS: 47 * M, fuente: 'Stellantis Argentina',
  },
  {
    id: 'ev-15', fecha: '2027-01-15', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'honda',
    titulo: 'Honda WR-V', detalle: 'SUV chico fabricado en Brasil, abajo del HR-V. Motor 1.5 aspirado con CVT.',
    segmento: 'suv', precioEstimadoARS: 42 * M, fuente: 'Honda Argentina',
  },
  {
    id: 'ev-16', fecha: '2027-02-01', estado: 'estimado', tipo: 'lanzamiento', marcaId: 'chery',
    titulo: 'Chery Tiggo 9 híbrido', detalle: 'SUV grande de siete plazas híbrido enchufable, arriba del Tiggo 8 Pro.',
    segmento: 'suv', precioEstimadoARS: 75 * M, fuente: 'Estimación SHUKMOTOR',
  },
  {
    id: 'ev-17', fecha: '2027-02-18', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'nissan',
    titulo: 'Nissan Kicks nueva generación', detalle: 'Rediseño completo con motor 1.0 turbo y plataforma nueva. Fabricado en Brasil.',
    modeloSlug: 'nissan-kicks-advance', segmento: 'suv', precioEstimadoARS: 46 * M, fuente: 'Nissan Argentina',
  },
  {
    id: 'ev-18', fecha: '2027-03-01', estado: 'estimado', tipo: 'llegada-marca', marcaId: 'great-wall',
    titulo: 'GWM Tank 300', detalle: 'Todoterreno híbrido con chasis de largueros. Apuntaría al Jimny grande y al Bronco Sport.',
    segmento: 'suv', precioEstimadoARS: 72 * M, fuente: 'Estimación SHUKMOTOR',
  },
  {
    id: 'ev-19', fecha: '2027-03-10', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'toyota',
    titulo: 'Nueva generación Toyota Hilux', detalle: 'Producción en Zárate con versión híbrida suave del 2.8 diésel. La actual sigue un tiempo en paralelo.',
    modeloSlug: 'toyota-hilux-srv', segmento: 'pickup', precioEstimadoARS: 80 * M, fuente: 'Toyota Argentina',
  },
  {
    id: 'ev-20', fecha: '2027-04-01', estado: 'estimado', tipo: 'lanzamiento', marcaId: 'kia',
    titulo: 'Kia EV3', detalle: 'SUV compacto eléctrico con 450 km. Primer eléctrico de Kia en el país a precio de volumen.',
    segmento: 'suv', precioEstimadoARS: 58 * M, fuente: 'Estimación SHUKMOTOR según Kia Latinoamérica',
  },
  {
    id: 'ev-21', fecha: '2027-04-22', estado: 'confirmado', tipo: 'restyling', marcaId: 'jeep',
    titulo: 'Jeep Compass nueva generación', detalle: 'Plataforma nueva con versiones híbridas. Producción en Brasil.',
    modeloSlug: 'jeep-compass-longitude', segmento: 'suv', precioEstimadoARS: 66 * M, fuente: 'Stellantis Argentina',
  },
  {
    id: 'ev-23', fecha: '2027-06-01', estado: 'estimado', tipo: 'lanzamiento', marcaId: 'byd',
    titulo: 'BYD Dolphin 5 puertas', detalle: 'Hatch eléctrico de tamaño normal, arriba del Dolphin Mini, con 400 km.',
    segmento: 'hatch', precioEstimadoARS: 46 * M, fuente: 'Estimación SHUKMOTOR',
  },
  {
    id: 'ev-24', fecha: '2027-06-15', estado: 'confirmado', tipo: 'lanzamiento', marcaId: 'ram',
    titulo: 'RAM Dakota', detalle: 'Pickup mediana fabricada en Córdoba sobre la base de la Frontier. Competiría con Hilux y Ranger.',
    segmento: 'pickup', precioEstimadoARS: 70 * M, fuente: 'Stellantis Argentina',
  },
]

export const ETIQUETA_TIPO_EVENTO: Record<EventoCalendario['tipo'], string> = {
  'llegada-marca': 'Llegada de marca',
  lanzamiento: 'Lanzamiento',
  restyling: 'Rediseño',
  preventa: 'Preventa',
  'nueva-version': 'Nueva versión',
}

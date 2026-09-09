import type { Patrocinio } from '../types'

/**
 * Espacios patrocinados. Datos de ejemplo.
 * Regla: se muestran siempre con la etiqueta "Espacio patrocinado", en un
 * bloque separado del contenido editorial, y nunca alteran un veredicto,
 * un puntaje ni el orden de los resultados del buscador.
 */
export const patrocinios: Patrocinio[] = [
  {
    id: 'pat-01', marcaId: 'jaecoo', modeloSlug: 'jaecoo-j7',
    titulo: 'Jaecoo J7: 0% a 12 cuotas por lanzamiento',
    texto: 'Hasta el 31 de octubre, con anticipo del 50% y cupo limitado en concesionarios oficiales.',
    vigenciaHasta: '2026-10-31',
  },
  {
    id: 'pat-02', marcaId: 'byd', modeloSlug: 'byd-song-pro-dmi',
    titulo: 'BYD Song Pro DM-i: probalo en tu ciudad',
    texto: 'Test drive a domicilio en Buenos Aires, Córdoba, Rosario y Mendoza. Garantía de 6 años.',
    vigenciaHasta: '2026-11-30',
  },
  {
    id: 'pat-03', marcaId: 'great-wall', modeloSlug: 'great-wall-poer',
    titulo: 'GWM Poer Elite con 36 cuotas fijas',
    texto: 'Tasa 24,9% y entrega inmediata. Incluye cobertor de caja y protector de carga.',
    vigenciaHasta: '2026-11-30',
  },
]

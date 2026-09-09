import { modelosExtra } from './modelos-extra'
import { modelosInventario } from './modelos-inventario'
import { modelosExtra2 } from './modelos-extra-2'
import type { Combustible, EstadoMercado, Segmento, Traccion, Transmision, Uso, Veredicto } from '../types'

/**
 * Definición compacta de cada modelo. Se expande a `Modelo` en ./modelos.ts
 * (fotos, videos, posventa, links y resumen de opiniones se generan ahí).
 * Precios en millones de ARS, ilustrativos. Datos de ejemplo.
 */
export type ModeloBase = {
  slug: string
  marca: string
  nombre: string
  version: string
  seg: Segmento
  carroceria: string
  anio?: number
  /** precio de lista, millones ARS */
  lista: number
  /** precio de calle (lo que se paga de verdad), millones ARS */
  calle: number
  motor: string
  comb: Combustible
  caja: Transmision
  trac: Traccion
  consumo: number
  plazas: number
  baul: number
  puertas: number
  entrega: number
  usos: Uso[]
  veredicto: Veredicto
  /** vigente = se vende hoy; proximo = llegada confirmada, no se puede comprar */
  estado: EstadoMercado
  rivales: string[]
  /** overrides opcionales de posventa */
  service?: number
  intervalo?: number
  disp?: 'buena' | 'regular' | 'complicada'
}

const modelosBaseCore: ModeloBase[] = [
  // ---------------------------------------------------------------- Entrada
  {
    slug: 'fiat-mobi-trekking', marca: 'fiat', nombre: 'Mobi', version: 'Trekking 1.0', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 24.9, calle: 23.8, motor: '1.0 Fire 8v, 70 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 6.2, plazas: 5, baul: 235, puertas: 5, entrega: 10, usos: ['ciudad', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['renault-kwid-iconic', 'citroen-c3-feel', 'volkswagen-polo-track'],
  },
  {
    slug: 'renault-kwid-iconic', marca: 'renault', nombre: 'Kwid', version: 'Iconic 1.0', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 25.9, calle: 24.6, motor: '1.0 SCe 12v, 66 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 5.6, plazas: 5, baul: 290, puertas: 5, entrega: 7, usos: ['ciudad', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['fiat-mobi-trekking', 'citroen-c3-feel', 'fiat-argo-drive'],
  },
  {
    slug: 'fiat-argo-drive', marca: 'fiat', nombre: 'Argo', version: 'Drive 1.3', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 29.4, calle: 28.2, motor: '1.3 Firefly 8v, 99 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 6.8, plazas: 5, baul: 300, puertas: 5, entrega: 14, usos: ['ciudad', 'primer auto', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['volkswagen-polo-track', 'citroen-c3-feel', 'kia-picanto'],
  },
  {
    slug: 'citroen-c3-feel', marca: 'citroen', nombre: 'C3', version: 'Feel 1.6 VTi', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 28.5, calle: 26.9, motor: '1.6 VTi 16v, 115 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 6.9, plazas: 5, baul: 315, puertas: 5, entrega: 7, usos: ['ciudad', 'primer auto', 'familia'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['fiat-argo-drive', 'volkswagen-polo-track', 'renault-kwid-iconic'],
  },
  {
    slug: 'volkswagen-polo-track', marca: 'volkswagen', nombre: 'Polo', version: 'Track 1.6 MSI', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 30.2, calle: 29.0, motor: '1.6 MSI 16v, 110 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 7.0, plazas: 5, baul: 300, puertas: 5, entrega: 5, usos: ['ciudad', 'primer auto', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['fiat-argo-drive', 'kia-picanto', 'chevrolet-onix-lt'],
  },
  {
    slug: 'chevrolet-onix-lt', marca: 'chevrolet', nombre: 'Onix', version: 'LT 1.0 Turbo', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 32.1, calle: 30.5, motor: '1.0 Turbo 12v, 116 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 6.1, plazas: 5, baul: 303, puertas: 5, entrega: 7, usos: ['ciudad', 'primer auto', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['kia-picanto', 'suzuki-swift-glx', 'volkswagen-polo-track'],
  },
  {
    slug: 'fiat-cronos-drive-cvt', marca: 'fiat', nombre: 'Cronos', version: 'Drive 1.3 CVT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 31.2, calle: 29.8, motor: '1.3 Firefly 8v, 99 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.1, plazas: 5, baul: 525, puertas: 4, entrega: 7, usos: ['ciudad', 'ruta', 'familia', 'trabajo'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['nissan-versa-advance', 'baic-u5-plus', 'bestune-b70'],
  },
  {
    slug: 'peugeot-208-allure', marca: 'peugeot', nombre: '208', version: 'Allure 1.6 Tiptronic', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 33.6, calle: 32.4, motor: '1.6 16v, 115 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.2, plazas: 5, baul: 265, puertas: 5, entrega: 12, usos: ['ciudad', 'primer auto'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['suzuki-swift-glx', 'hyundai-hb20-comfort', 'toyota-yaris-xs'],
  },
  {
    slug: 'toyota-yaris-xs', marca: 'toyota', nombre: 'Yaris', version: 'XS 1.5 CVT', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 33.2, calle: 33.9, motor: '1.5 Dual VVT-i, 107 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.3, plazas: 5, baul: 270, puertas: 5, entrega: 30, usos: ['ciudad', 'primer auto', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['hyundai-hb20-comfort', 'byd-dolphin-mini', 'peugeot-208-allure'],
  },
  {
    slug: 'volkswagen-virtus-comfortline', marca: 'volkswagen', nombre: 'Virtus', version: 'Comfortline 1.0 TSI AT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 38.9, calle: 37.4, motor: '1.0 TSI 12v, 101 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.2, plazas: 5, baul: 521, puertas: 4, entrega: 10, usos: ['ciudad', 'ruta', 'familia', 'trabajo'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['baic-u5-plus', 'bestune-b70', 'mg-mg5'],
  },
  {
    slug: 'nissan-versa-advance', marca: 'nissan', nombre: 'Versa', version: 'Advance 1.6 CVT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 35.7, calle: 34.2, motor: '1.6 16v, 118 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.6, plazas: 5, baul: 482, puertas: 4, entrega: 10, usos: ['ciudad', 'ruta', 'familia', 'trabajo'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['baic-u5-plus', 'bestune-b70', 'mg-mg5'],
  },
  {
    slug: 'hyundai-hb20-comfort', marca: 'hyundai', nombre: 'HB20', version: 'Comfort 1.6 AT', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 34.9, calle: 33.5, motor: '1.6 16v, 123 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.3, plazas: 5, baul: 300, puertas: 5, entrega: 14, usos: ['ciudad', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['toyota-yaris-xs', 'peugeot-208-allure', 'byd-dolphin-mini'],
  },
  {
    slug: 'suzuki-swift-glx', marca: 'suzuki', nombre: 'Swift', version: 'GLX 1.2 CVT', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 32.8, calle: 31.9, motor: '1.2 DualJet 16v, 83 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 5.4, plazas: 5, baul: 265, puertas: 5, entrega: 20, usos: ['ciudad', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['peugeot-208-allure', 'chevrolet-onix-lt', 'hyundai-hb20-comfort'],
  },
  {
    slug: 'honda-city-lx', marca: 'honda', nombre: 'City', version: 'LX 1.5 CVT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 42.5, calle: 41.8, motor: '1.5 i-VTEC 16v, 121 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.4, plazas: 5, baul: 519, puertas: 4, entrega: 21, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'conviene', estado: 'proximo',
    rivales: ['chevrolet-sonic-regreso', 'kia-k4', 'changan-eado'],
  },
  {
    slug: 'toyota-corolla-xli', marca: 'toyota', nombre: 'Corolla', version: 'XLI 2.0 CVT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 44.6, calle: 45.2, motor: '2.0 Dynamic Force, 170 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.8, plazas: 5, baul: 470, puertas: 4, entrega: 25, usos: ['ciudad', 'ruta', 'familia', 'trabajo'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['nissan-sentra-exclusive', 'hyundai-elantra', 'kia-k3'],
  },

  // ---------------------------------------------------------------- SUV chicos
  {
    slug: 'fiat-pulse-drive', marca: 'fiat', nombre: 'Pulse', version: 'Drive 1.3 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 35.4, calle: 33.9, motor: '1.3 Firefly 8v, 99 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.0, plazas: 5, baul: 370, puertas: 5, entrega: 10, usos: ['ciudad', 'familia', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['citroen-basalt-feel', 'renault-kardian-evolution', 'chery-tiggo-4-pro'],
  },
  {
    slug: 'fiat-fastback-audace', marca: 'fiat', nombre: 'Fastback', version: 'Audace 1.0 Turbo CVT', seg: 'suv', carroceria: 'SUV coupé 5 puertas',
    lista: 41.8, calle: 40.2, motor: '1.0 Turbo 200 12v, 125 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.9, plazas: 5, baul: 600, puertas: 5, entrega: 14, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['peugeot-2008-allure', 'volkswagen-nivus-comfortline', 'mg-zs-comfort'],
  },
  {
    slug: 'renault-kardian-evolution', marca: 'renault', nombre: 'Kardian', version: 'Evolution 1.0 Turbo EDC', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 36.9, calle: 35.2, motor: '1.0 TCe 12v, 120 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.3, plazas: 5, baul: 410, puertas: 5, entrega: 7, usos: ['ciudad', 'familia', 'primer auto', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['fiat-pulse-drive', 'chery-tiggo-4-pro', 'citroen-basalt-feel'],
  },
  {
    slug: 'volkswagen-nivus-comfortline', marca: 'volkswagen', nombre: 'Nivus', version: 'Comfortline 1.0 TSI AT', seg: 'suv', carroceria: 'SUV coupé 5 puertas',
    lista: 42.3, calle: 40.8, motor: '1.0 TSI 12v, 101 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.4, plazas: 5, baul: 415, puertas: 5, entrega: 10, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['mg-zs-comfort', 'peugeot-2008-allure', 'baic-bj30'],
  },
  {
    slug: 'volkswagen-t-cross-comfortline', marca: 'volkswagen', nombre: 'T-Cross', version: 'Comfortline 1.0 TSI AT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 44.1, calle: 42.5, motor: '1.0 TSI 12v, 101 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.5, plazas: 5, baul: 420, puertas: 5, entrega: 10, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['haval-jolion', 'nissan-kicks-advance', 'baic-x55'],
  },
  {
    slug: 'chevrolet-tracker-lt', marca: 'chevrolet', nombre: 'Tracker', version: 'LT 1.2 Turbo AT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 40.6, calle: 38.9, motor: '1.2 Turbo 12v, 132 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.7, plazas: 5, baul: 393, puertas: 5, entrega: 7, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['dfsk-glory-580', 'renault-duster-intens', 'fiat-fastback-audace'],
  },
  {
    slug: 'peugeot-2008-allure', marca: 'peugeot', nombre: '2008', version: 'Allure T200 1.0 Turbo CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 41.9, calle: 40.4, motor: '1.0 Turbo 12v, 130 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.6, plazas: 5, baul: 434, puertas: 5, entrega: 12, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['fiat-fastback-audace', 'volkswagen-nivus-comfortline', 'mg-zs-comfort'],
  },
  {
    slug: 'chevrolet-spin-ltz', marca: 'chevrolet', nombre: 'Spin', version: 'LTZ 1.8 AT 7 plazas', seg: 'monovolumen', carroceria: 'Monovolumen 5 puertas, 7 plazas',
    lista: 37.9, calle: 36.5, motor: '1.8 8v, 105 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.4, plazas: 7, baul: 553, puertas: 5, entrega: 7, usos: ['familia', 'trabajo', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['dfsk-c35', 'hyundai-staria', 'kia-carnival-ex'],
  },
  {
    slug: 'nissan-kicks-advance', marca: 'nissan', nombre: 'Kicks', version: 'Advance 1.6 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 44.8, calle: 42.9, motor: '1.6 16v, 120 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.9, plazas: 5, baul: 432, puertas: 5, entrega: 10, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['haval-jolion', 'baic-x55', 'volkswagen-t-cross-comfortline'],
  },
  {
    slug: 'hyundai-creta-safety', marca: 'hyundai', nombre: 'Creta', version: 'Safety 1.5 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 46.2, calle: 44.5, motor: '1.5 16v, 115 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.2, plazas: 5, baul: 422, puertas: 5, entrega: 14, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['byd-yuan-pro', 'toyota-yaris-cross-xls', 'jeep-renegade-longitude'],
  },
  {
    slug: 'chery-tiggo-4-pro', marca: 'chery', nombre: 'Tiggo 4 Pro', version: 'Luxury 1.5 Turbo CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 38.2, calle: 36.9, motor: '1.5 Turbo 16v, 147 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.6, plazas: 5, baul: 340, puertas: 5, entrega: 7, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['volkswagen-tera-highline', 'renault-duster-intens', 'renault-kardian-evolution'],
  },
  {
    slug: 'mg-zs-comfort', marca: 'mg', nombre: 'ZS', version: 'Comfort 1.5 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 42.4, calle: 40.9, motor: '1.5 16v, 112 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.0, plazas: 5, baul: 448, puertas: 5, entrega: 10, usos: ['ciudad', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['volkswagen-nivus-comfortline', 'baic-bj30', 'baic-x35'],
  },
  {
    slug: 'dfsk-glory-500', marca: 'dfsk', nombre: 'Glory 500', version: 'Luxury 1.5 Turbo CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 32.5, calle: 30.9, motor: '1.5 Turbo 16v, 150 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.0, plazas: 5, baul: 420, puertas: 5, entrega: 5, usos: ['ciudad', 'familia', 'trabajo'],
    veredicto: 'no conviene', estado: 'vigente',
    rivales: ['citroen-basalt-feel', 'fiat-pulse-drive', 'renault-kardian-evolution'],
  },
  {
    slug: 'baic-x55', marca: 'baic', nombre: 'X55', version: 'Luxury 1.5 Turbo DCT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 45.5, calle: 43.2, motor: '1.5 Turbo 16v, 177 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.8, plazas: 5, baul: 440, puertas: 5, entrega: 7, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['toyota-yaris-cross-xls', 'nissan-kicks-advance', 'haval-jolion'],
  },
  {
    slug: 'haval-jolion', marca: 'haval', nombre: 'Jolion', version: 'Luxury 1.5 Turbo DCT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 44.3, calle: 42.8, motor: '1.5 Turbo 16v, 150 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.5, plazas: 5, baul: 337, puertas: 5, entrega: 7, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['nissan-kicks-advance', 'volkswagen-t-cross-comfortline', 'baic-x55'],
  },
  {
    slug: 'toyota-yaris-cross-xls', marca: 'toyota', nombre: 'Yaris Cross', version: 'XLS 1.5 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 42.9, calle: 43.5, motor: '1.5 Dual VVT-i, 107 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.5, plazas: 5, baul: 390, puertas: 5, entrega: 45, usos: ['ciudad', 'familia', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['baic-x55', 'nissan-kicks-advance', 'haval-jolion'],
  },
  {
    slug: 'suzuki-jimny-jlx', marca: 'suzuki', nombre: 'Jimny', version: 'JLX 1.5 4x4 MT', seg: 'suv', carroceria: 'SUV 3 puertas',
    lista: 45.9, calle: 47.0, motor: '1.5 16v, 102 CV', comb: 'nafta', caja: 'manual', trac: '4x4',
    consumo: 7.4, plazas: 4, baul: 85, puertas: 3, entrega: 60, usos: ['off-road', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['chery-tiggo-7-pro', 'omoda-c5', 'chevrolet-equinox'],
  },

  // ---------------------------------------------------------------- SUV medianos
  {
    slug: 'renault-duster-intens', marca: 'renault', nombre: 'Duster', version: 'Intens 1.6 CVT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 39.5, calle: 38.1, motor: '1.6 16v, 115 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.5, plazas: 5, baul: 475, puertas: 5, entrega: 10, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['volkswagen-tera-highline', 'chevrolet-tracker-lt', 'dfsk-glory-580'],
  },
  {
    slug: 'jeep-renegade-longitude', marca: 'jeep', nombre: 'Renegade', version: 'Longitude 1.3 Turbo AT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 47.2, calle: 45.5, motor: '1.3 Turbo 16v, 185 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.9, plazas: 5, baul: 320, puertas: 5, entrega: 10, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['honda-wr-v-exl', 'omoda-c5', 'byd-yuan-pro'],
  },
  {
    slug: 'jeep-compass-longitude', marca: 'jeep', nombre: 'Compass', version: 'Longitude 1.3 Turbo AT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 62.4, calle: 60.1, motor: '1.3 Turbo 16v, 185 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.1, plazas: 5, baul: 476, puertas: 5, entrega: 10, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['abarth-fastback', 'abarth-pulse', 'chery-tiggo-8-pro'],
  },
  {
    slug: 'toyota-corolla-cross-xli', marca: 'toyota', nombre: 'Corolla Cross', version: 'XLI 2.0 CVT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 55.3, calle: 56.0, motor: '2.0 Dynamic Force, 170 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.3, plazas: 5, baul: 440, puertas: 5, entrega: 30, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['isuzu-mu-x', 'kgm-rexton', 'ford-territory-titanium'],
  },
  {
    slug: 'honda-hr-v-exl', marca: 'honda', nombre: 'HR-V', version: 'EXL 1.5 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 58.4, calle: 57.0, motor: '1.5 i-VTEC 16v, 121 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.9, plazas: 5, baul: 354, puertas: 5, entrega: 20, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['ford-territory-titanium', 'toyota-corolla-cross-xli', 'isuzu-mu-x'],
  },
  {
    slug: 'honda-zr-v-touring', marca: 'honda', nombre: 'ZR-V', version: 'Touring 2.0 CVT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 72.8, calle: 71.5, motor: '2.0 i-VTEC 16v, 158 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.6, plazas: 5, baul: 380, puertas: 5, entrega: 25, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['peugeot-3008-gt', 'hyundai-tucson-limited', 'hyundai-ioniq-5'],
  },
  {
    slug: 'kia-seltos-ex', marca: 'kia', nombre: 'Seltos', version: 'EX 1.6 AT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 50.4, calle: 48.6, motor: '1.6 16v, 123 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.5, plazas: 5, baul: 433, puertas: 5, entrega: 14, usos: ['ciudad', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['chevrolet-equinox', 'chevrolet-tahoe', 'chevrolet-trailblazer'],
  },
  {
    slug: 'chery-tiggo-7-pro', marca: 'chery', nombre: 'Tiggo 7 Pro', version: 'Luxury 1.6 Turbo DCT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 48.9, calle: 47.2, motor: '1.6 TGDI 16v, 186 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.9, plazas: 5, baul: 475, puertas: 5, entrega: 7, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['suzuki-jimny-jlx', 'chevrolet-equinox', 'chevrolet-tahoe'],
  },
  {
    slug: 'chery-tiggo-8-pro', marca: 'chery', nombre: 'Tiggo 8 Pro', version: 'Max 2.0 Turbo AWD 7 plazas', seg: 'suv', carroceria: 'SUV grande 5 puertas, 7 plazas',
    lista: 62.9, calle: 60.8, motor: '2.0 TGDI 16v, 254 CV', comb: 'nafta', caja: 'automatica', trac: 'awd',
    consumo: 9.2, plazas: 7, baul: 520, puertas: 5, entrega: 10, usos: ['familia', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['haval-h6-hev', 'kia-niro', 'renault-arkana-e-tech'],
  },
  {
    slug: 'jaecoo-j7', marca: 'jaecoo', nombre: 'J7', version: 'Luxury 1.6 Turbo DCT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 55.9, calle: 54.5, motor: '1.6 TGDI 16v, 186 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.8, plazas: 5, baul: 500, puertas: 5, entrega: 7, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['omoda-c7', 'byd-song-pro-dmi', 'isuzu-mu-x'],
  },
  {
    slug: 'omoda-c5', marca: 'omoda', nombre: 'C5', version: 'Comfort 1.5 Turbo CVT', seg: 'suv', carroceria: 'SUV coupé 5 puertas',
    lista: 47.5, calle: 46.0, motor: '1.5 Turbo 16v, 147 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.6, plazas: 5, baul: 378, puertas: 5, entrega: 7, usos: ['ciudad', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['jeep-renegade-longitude', 'honda-wr-v-exl', 'suzuki-jimny-jlx'],
  },
  {
    slug: 'haval-h6-hev', marca: 'haval', nombre: 'H6', version: 'HEV Luxury 1.5 Turbo híbrido', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 62.4, calle: 60.9, motor: '1.5 Turbo híbrido, 243 CV combinados', comb: 'hibrido', caja: 'automatica', trac: '4x2',
    consumo: 5.4, plazas: 5, baul: 560, puertas: 5, entrega: 10, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['chery-tiggo-8-pro', 'kia-niro', 'renault-arkana-e-tech'],
  },
  {
    slug: 'byd-song-pro-dmi', marca: 'byd', nombre: 'Song Pro', version: 'DM-i GS híbrido enchufable', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 55.8, calle: 55.0, motor: '1.5 híbrido enchufable, 218 CV combinados', comb: 'hibrido', caja: 'automatica', trac: '4x2',
    consumo: 3.6, plazas: 5, baul: 520, puertas: 5, entrega: 14, usos: ['familia', 'ciudad', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['isuzu-mu-x', 'kgm-rexton', 'jaecoo-j7'],
  },
  {
    slug: 'byd-yuan-pro', marca: 'byd', nombre: 'Yuan Pro', version: 'GL eléctrico', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 45.9, calle: 45.0, motor: 'Eléctrico 130 kW, batería 45 kWh', comb: 'electrico', caja: 'automatica', trac: '4x2',
    consumo: 1.6, plazas: 5, baul: 420, puertas: 5, entrega: 14, usos: ['ciudad', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['hyundai-creta-safety', 'jeep-renegade-longitude', 'honda-wr-v-exl'],
  },
  {
    slug: 'byd-dolphin-mini', marca: 'byd', nombre: 'Dolphin Mini', version: 'GL eléctrico', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 35.9, calle: 35.0, motor: 'Eléctrico 55 kW, batería 38 kWh', comb: 'electrico', caja: 'automatica', trac: '4x2',
    consumo: 1.3, plazas: 4, baul: 230, puertas: 5, entrega: 10, usos: ['ciudad', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['toyota-yaris-xs', 'hyundai-hb20-comfort', 'mg-3-hybrid'],
  },
  {
    slug: 'mg-4-electrico', marca: 'mg', nombre: 'MG4', version: 'Comfort eléctrico', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 48.9, calle: 47.5, motor: 'Eléctrico 125 kW, batería 51 kWh', comb: 'electrico', caja: 'automatica', trac: '4x2',
    consumo: 1.5, plazas: 5, baul: 363, puertas: 5, entrega: 14, usos: ['ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['audi-a1', 'bmw-serie-1', 'ds-ds-4'],
  },
  {
    slug: 'leapmotor-c10', marca: 'leapmotor', nombre: 'C10', version: 'REEV híbrido de autonomía extendida', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 60.5, calle: 59.5, motor: 'Eléctrico 160 kW + generador 1.5, batería 28 kWh', comb: 'hibrido', caja: 'automatica', trac: '4x2',
    consumo: 2.9, plazas: 5, baul: 546, puertas: 5, entrega: 20, usos: ['familia', 'ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'proximo',
    rivales: ['fiat-600-hybrid', 'suzuki-across-phev', 'toyota-rav4-phev'],
  },
  {
    slug: 'hyundai-tucson-limited', marca: 'hyundai', nombre: 'Tucson', version: 'Limited 2.0 AT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 70.5, calle: 68.9, motor: '2.0 16v, 156 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.2, plazas: 5, baul: 620, puertas: 5, entrega: 14, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['ford-bronco-sport-big-bend', 'honda-zr-v-touring', 'baic-bj40-plus'],
  },
  {
    slug: 'kia-sportage-ex', marca: 'kia', nombre: 'Sportage', version: 'EX 2.0 AT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 66.8, calle: 65.2, motor: '2.0 16v, 156 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.1, plazas: 5, baul: 591, puertas: 5, entrega: 14, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['baic-bj40-plus', 'deepal-s07', 'geely-ex5'],
  },
  {
    slug: 'ford-territory-titanium', marca: 'ford', nombre: 'Territory', version: 'Titanium 1.8 EcoBoost DCT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 58.6, calle: 56.9, motor: '1.8 EcoBoost 16v, 186 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.3, plazas: 5, baul: 448, puertas: 5, entrega: 10, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['honda-hr-v-exl', 'toyota-corolla-cross-xli', 'isuzu-mu-x'],
  },
  {
    slug: 'ford-bronco-sport-big-bend', marca: 'ford', nombre: 'Bronco Sport', version: 'Big Bend 1.5 EcoBoost 4x4', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 69.8, calle: 68.4, motor: '1.5 EcoBoost 12v, 181 CV', comb: 'nafta', caja: 'automatica', trac: '4x4',
    consumo: 8.9, plazas: 5, baul: 920, puertas: 5, entrega: 14, usos: ['off-road', 'familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['hyundai-tucson-limited', 'baic-bj40-plus', 'honda-zr-v-touring'],
  },
  {
    slug: 'toyota-sw4-srx', marca: 'toyota', nombre: 'SW4', version: 'SRX 2.8 4x4 AT 7 plazas', seg: 'suv', carroceria: 'SUV grande 5 puertas, 7 plazas',
    lista: 96.5, calle: 98.0, motor: '2.8 Turbodiésel, 204 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.6, plazas: 7, baul: 296, puertas: 5, entrega: 45, usos: ['familia', 'ruta', 'off-road'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['bmw-x1-sdrive20i', 'mercedes-gla-200', 'mitsubishi-outlander-phev'],
  },

  // ---------------------------------------------------------------- Pickups
  {
    slug: 'fiat-strada-volcano', marca: 'fiat', nombre: 'Strada', version: 'Volcano 1.3 CVT cabina doble', seg: 'pickup', carroceria: 'Pickup compacta cabina doble',
    lista: 34.6, calle: 33.2, motor: '1.3 Firefly 8v, 99 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.5, plazas: 5, baul: 650, puertas: 4, entrega: 7, usos: ['trabajo', 'carga', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['volkswagen-saveiro-cross', 'chevrolet-montana-ltz', 'dongfeng-rich-6'],
  },
  {
    slug: 'chevrolet-montana-ltz', marca: 'chevrolet', nombre: 'Montana', version: 'LTZ 1.2 Turbo AT', seg: 'pickup', carroceria: 'Pickup compacta cabina doble',
    lista: 42.8, calle: 40.9, motor: '1.2 Turbo 12v, 132 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.3, plazas: 5, baul: 874, puertas: 4, entrega: 10, usos: ['trabajo', 'carga', 'familia', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['dongfeng-rich-6', 'renault-oroch-outsider', 'jac-t8-plus'],
  },
  {
    slug: 'fiat-toro-volcano', marca: 'fiat', nombre: 'Toro', version: 'Volcano 2.2 Multijet 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 50.8, calle: 48.9, motor: '2.2 Multijet Turbodiésel, 200 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 7.8, plazas: 5, baul: 937, puertas: 4, entrega: 10, usos: ['trabajo', 'familia', 'ruta', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['peugeot-landtrek-allure', 'gwm-poer-elite', 'toyota-hilux-dx'],
  },
  {
    slug: 'ford-maverick-lariat', marca: 'ford', nombre: 'Maverick', version: 'Lariat 2.0 EcoBoost AWD', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 56.2, calle: 54.8, motor: '2.0 EcoBoost 16v, 253 CV', comb: 'nafta', caja: 'automatica', trac: 'awd',
    consumo: 9.6, plazas: 5, baul: 900, puertas: 4, entrega: 14, usos: ['familia', 'ruta', 'trabajo'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['fiat-titano-ranch', 'toyota-hilux-dx', 'gwm-poer-elite'],
  },
  {
    slug: 'ram-rampage-rt', marca: 'ram', nombre: 'Rampage', version: 'R/T 2.0 Turbo 4x4', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 68.5, calle: 66.8, motor: '2.0 Hurricane Turbo, 272 CV', comb: 'nafta', caja: 'automatica', trac: '4x4',
    consumo: 10.2, plazas: 5, baul: 980, puertas: 4, entrega: 14, usos: ['familia', 'ruta', 'trabajo'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['chevrolet-s10-high-country', 'nissan-frontier-pro-4x', 'mitsubishi-l200-katana'],
  },
  {
    slug: 'toyota-hilux-dx', marca: 'toyota', nombre: 'Hilux', version: 'DX 2.4 4x2 MT cabina doble', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 51.4, calle: 52.0, motor: '2.4 Turbodiésel, 150 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 7.9, plazas: 5, baul: 1000, puertas: 4, entrega: 30, usos: ['trabajo', 'carga', 'ruta'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['gwm-poer-elite', 'peugeot-landtrek-allure', 'ford-maverick-lariat'],
  },
  {
    slug: 'ford-ranger-xlt', marca: 'ford', nombre: 'Ranger', version: 'XLT 3.0 V6 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 71.2, calle: 69.5, motor: '3.0 V6 Turbodiésel, 250 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 9.0, plazas: 5, baul: 1000, puertas: 4, entrega: 14, usos: ['trabajo', 'ruta', 'familia', 'off-road', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['kgm-musso', 'ram-rampage-rt', 'chevrolet-s10-high-country'],
  },
  {
    slug: 'volkswagen-amarok-v6-extreme', marca: 'volkswagen', nombre: 'Amarok', version: 'V6 Extreme 3.0 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 85.9, calle: 82.5, motor: '3.0 V6 TDI, 258 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 9.4, plazas: 5, baul: 1000, puertas: 4, entrega: 10, usos: ['ruta', 'familia', 'trabajo', 'off-road'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['ford-ranger-xlt', 'ford-f-150', 'kgm-musso'],
  },
  {
    slug: 'chevrolet-s10-high-country', marca: 'chevrolet', nombre: 'S10', version: 'High Country 2.8 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 68.9, calle: 65.9, motor: '2.8 Turbodiésel, 200 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.8, plazas: 5, baul: 1000, puertas: 4, entrega: 7, usos: ['trabajo', 'ruta', 'familia', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['nissan-frontier-pro-4x', 'ram-rampage-rt', 'mitsubishi-l200-katana'],
  },
  {
    slug: 'nissan-frontier-pro-4x', marca: 'nissan', nombre: 'Frontier', version: 'Pro-4X 2.3 Biturbo 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 67.8, calle: 65.5, motor: '2.3 Biturbo diésel, 190 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.5, plazas: 5, baul: 1000, puertas: 4, entrega: 14, usos: ['off-road', 'trabajo', 'ruta', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['chevrolet-s10-high-country', 'mitsubishi-l200-katana', 'isuzu-d-max-ls'],
  },
  {
    slug: 'mitsubishi-l200-katana', marca: 'mitsubishi', nombre: 'L200', version: 'Katana 2.4 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 66.4, calle: 64.9, motor: '2.4 Turbodiésel MIVEC, 184 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.3, plazas: 5, baul: 1000, puertas: 4, entrega: 20, usos: ['off-road', 'trabajo', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['isuzu-d-max-ls', 'nissan-frontier-pro-4x', 'chevrolet-s10-high-country'],
  },
  {
    slug: 'isuzu-d-max-ls', marca: 'isuzu', nombre: 'D-Max', version: 'LS 3.0 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 65.9, calle: 64.5, motor: '3.0 Turbodiésel, 190 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.7, plazas: 5, baul: 1000, puertas: 4, entrega: 25, usos: ['trabajo', 'carga', 'off-road', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['mitsubishi-l200-katana', 'nissan-frontier-pro-4x', 'chevrolet-s10-high-country'],
  },
  {
    slug: 'gwm-poer-elite', marca: 'great-wall', nombre: 'Poer', version: 'Elite 2.0 Turbodiésel 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 52.9, calle: 51.5, motor: '2.0 Turbodiésel, 163 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.6, plazas: 5, baul: 1000, puertas: 4, entrega: 7, usos: ['trabajo', 'ruta', 'familia', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['toyota-hilux-dx', 'peugeot-landtrek-allure', 'fiat-toro-volcano'],
  },
  {
    slug: 'jac-t8-plus', marca: 'jac', nombre: 'T8 Plus', version: 'Luxury 2.0 Turbodiésel 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 44.9, calle: 43.5, motor: '2.0 Turbodiésel, 156 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.9, plazas: 5, baul: 1000, puertas: 4, entrega: 7, usos: ['trabajo', 'carga', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['renault-oroch-outsider', 'foton-tunland-g7', 'dongfeng-rich-6'],
  },
  {
    slug: 'dongfeng-rich-6', marca: 'dongfeng', nombre: 'Rich 6', version: '2.3 Turbodiésel 4x4 MT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 42.9, calle: 41.5, motor: '2.3 Turbodiésel, 163 CV', comb: 'diesel', caja: 'manual', trac: '4x4',
    consumo: 8.8, plazas: 5, baul: 1000, puertas: 4, entrega: 10, usos: ['trabajo', 'carga'],
    veredicto: 'no conviene', estado: 'vigente',
    rivales: ['chevrolet-montana-ltz', 'renault-oroch-outsider', 'jac-t8-plus'],
  },
  {
    slug: 'foton-tunland-g7', marca: 'foton', nombre: 'Tunland G7', version: '2.0 Turbodiésel 4x4 AT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 46.5, calle: 44.9, motor: '2.0 Turbodiésel, 163 CV', comb: 'diesel', caja: 'automatica', trac: '4x4',
    consumo: 8.9, plazas: 5, baul: 1000, puertas: 4, entrega: 10, usos: ['trabajo', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['jac-t8-plus', 'renault-oroch-outsider', 'dongfeng-rich-6'],
  },
  {
    slug: 'ram-1500-laramie', marca: 'ram', nombre: '1500', version: 'Laramie 5.7 V8 4x4', seg: 'pickup', carroceria: 'Pickup grande cabina doble',
    lista: 132.0, calle: 128.5, motor: '5.7 HEMI V8 eTorque, 400 CV', comb: 'nafta', caja: 'automatica', trac: '4x4',
    consumo: 14.0, plazas: 5, baul: 1500, puertas: 4, entrega: 21, usos: ['ruta', 'familia', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['jeep-gladiator-rubicon', 'chevrolet-silverado-high-country', 'volkswagen-amarok-v6-extreme'],
  },

  // ---------------------------------------------------------------- Utilitarios
  {
    slug: 'fiat-fiorino-endurance', marca: 'fiat', nombre: 'Fiorino', version: 'Endurance 1.4', seg: 'utilitario', carroceria: 'Furgón compacto',
    lista: 27.4, calle: 26.2, motor: '1.4 Fire 8v, 87 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 7.4, plazas: 2, baul: 3100, puertas: 4, entrega: 5, usos: ['trabajo', 'carga', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['coradir-tita', 'sero-electric-cargo-alto', 'sero-electric-cargo-bajo'],
  },
  {
    slug: 'renault-kangoo-stepway', marca: 'renault', nombre: 'Kangoo', version: 'Stepway 1.5 dCi 5 plazas', seg: 'utilitario', carroceria: 'Furgón vidriado 5 plazas',
    lista: 34.8, calle: 33.5, motor: '1.5 dCi Turbodiésel, 115 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 5.6, plazas: 5, baul: 775, puertas: 5, entrega: 10, usos: ['trabajo', 'familia', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['peugeot-partner-confort', 'citroen-berlingo-furgon', 'fiat-fiorino-endurance'],
  },
  {
    slug: 'peugeot-partner-confort', marca: 'peugeot', nombre: 'Partner', version: 'Confort 1.6 HDi', seg: 'utilitario', carroceria: 'Furgón mediano',
    lista: 31.9, calle: 30.5, motor: '1.6 HDi Turbodiésel, 92 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 5.9, plazas: 2, baul: 3300, puertas: 4, entrega: 7, usos: ['trabajo', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['citroen-berlingo-furgon', 'renault-kangoo-stepway', 'fiat-fiorino-endurance'],
  },
  {
    slug: 'citroen-berlingo-furgon', marca: 'citroen', nombre: 'Berlingo', version: 'Furgón 1.6 HDi', seg: 'utilitario', carroceria: 'Furgón mediano',
    lista: 31.5, calle: 30.2, motor: '1.6 HDi Turbodiésel, 92 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 5.9, plazas: 2, baul: 3300, puertas: 4, entrega: 7, usos: ['trabajo', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['peugeot-partner-confort', 'renault-kangoo-stepway', 'fiat-fiorino-endurance'],
  },

  // ---------------------------------------------------------------- Premium
  {
    slug: 'peugeot-3008-gt', marca: 'peugeot', nombre: '3008', version: 'GT 1.6 THP AT', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 74.5, calle: 72.0, motor: '1.6 THP 16v, 165 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.9, plazas: 5, baul: 520, puertas: 5, entrega: 20, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['honda-zr-v-touring', 'hyundai-ioniq-5', 'kia-ev6'],
  },
  {
    slug: 'audi-q3-advanced', marca: 'audi', nombre: 'Q3', version: 'Advanced 35 TFSI S tronic', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 92.0, calle: 90.0, motor: '1.4 TFSI 16v, 150 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.1, plazas: 5, baul: 530, puertas: 5, entrega: 30, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['alfa-romeo-junior', 'chevrolet-captiva-phev', 'chevrolet-spark-euv'],
  },
  {
    slug: 'audi-a3-sportback', marca: 'audi', nombre: 'A3 Sportback', version: '35 TFSI S tronic', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 76.0, calle: 74.5, motor: '1.4 TFSI 16v, 150 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.4, plazas: 5, baul: 380, puertas: 5, entrega: 30, usos: ['ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['mercedes-clase-a-200', 'bmw-serie-1', 'ds-ds-4'],
  },
  {
    slug: 'bmw-x1-sdrive20i', marca: 'bmw', nombre: 'X1', version: 'sDrive20i M Sport', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 97.5, calle: 95.0, motor: '2.0 TwinPower Turbo, 204 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.3, plazas: 5, baul: 540, puertas: 5, entrega: 30, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['mercedes-gla-200', 'toyota-sw4-srx', 'nissan-x-trail-e-power'],
  },
  {
    slug: 'bmw-320i', marca: 'bmw', nombre: 'Serie 3', version: '320i M Sport', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 102.0, calle: 99.5, motor: '2.0 TwinPower Turbo, 184 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.9, plazas: 5, baul: 480, puertas: 4, entrega: 30, usos: ['ruta', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['volvo-s60', 'byd-seal', 'audi-a4'],
  },
  {
    slug: 'mercedes-gla-200', marca: 'mercedes-benz', nombre: 'GLA', version: '200 Progressive', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 96.0, calle: 94.0, motor: '1.3 Turbo 16v, 163 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.8, plazas: 5, baul: 435, puertas: 5, entrega: 30, usos: ['ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['bmw-x1-sdrive20i', 'toyota-sw4-srx', 'nissan-x-trail-e-power'],
  },
  {
    slug: 'mercedes-clase-a-200', marca: 'mercedes-benz', nombre: 'Clase A', version: 'A 200 Progressive', seg: 'hatch', carroceria: 'Hatchback 5 puertas',
    lista: 84.0, calle: 82.0, motor: '1.3 Turbo 16v, 163 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.3, plazas: 5, baul: 370, puertas: 5, entrega: 30, usos: ['ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['audi-a3-sportback', 'audi-a1', 'bmw-serie-1'],
  },
  {
    slug: 'volvo-xc60-b5', marca: 'volvo', nombre: 'XC60', version: 'B5 Plus AWD híbrido suave', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 118.0, calle: 115.0, motor: '2.0 Turbo híbrido 48V, 250 CV', comb: 'hibrido', caja: 'automatica', trac: 'awd',
    consumo: 7.8, plazas: 5, baul: 483, puertas: 5, entrega: 45, usos: ['familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['land-rover-range-rover-evoque', 'hyundai-santa-fe-hybrid', 'toyota-rav4-limited-hybrid'],
  },
  {
    slug: 'volvo-ex30-core', marca: 'volvo', nombre: 'EX30', version: 'Core eléctrico', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 82.0, calle: 80.0, motor: 'Eléctrico 200 kW, batería 69 kWh', comb: 'electrico', caja: 'automatica', trac: '4x2',
    consumo: 1.7, plazas: 5, baul: 318, puertas: 5, entrega: 40, usos: ['ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['peugeot-5008-allure', 'jaecoo-j8', 'jeep-commander-overland'],
  },
  {
    slug: 'lexus-nx-350h', marca: 'lexus', nombre: 'NX', version: '350h Luxury AWD híbrido', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 125.0, calle: 123.0, motor: '2.5 híbrido, 243 CV combinados', comb: 'hibrido', caja: 'automatica', trac: 'awd',
    consumo: 5.8, plazas: 5, baul: 520, puertas: 5, entrega: 45, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['jeep-wrangler-rubicon', 'audi-q5-advanced', 'land-rover-defender'],
  },
  {
    slug: 'lynk-co-01', marca: 'lynk-co', nombre: '01', version: 'PHEV híbrido enchufable', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 68.0, calle: 67.0, motor: '1.5 Turbo híbrido enchufable, 261 CV combinados', comb: 'hibrido', caja: 'automatica', trac: '4x2',
    consumo: 3.2, plazas: 5, baul: 466, puertas: 5, entrega: 30, usos: ['familia', 'ciudad', 'ruta'],
    veredicto: 'con reparos', estado: 'proximo',
    rivales: ['aion-v', 'arcfox-t1', 'arcfox-t5'],
  },
]

export const modelosBase: ModeloBase[] = [...modelosBaseCore, ...modelosExtra, ...modelosExtra2, ...modelosInventario]

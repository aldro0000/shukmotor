import type { ModeloBase } from './modelos-base'

/**
 * Segunda ampliación del catálogo: versiones y modelos de volumen que faltaban.
 * Datos de ejemplo.
 */
export const modelosExtra2: ModeloBase[] = [
  // ------------------------------------------------------------ Toyota
  {
    slug: 'toyota-rav4-limited-hybrid', marca: 'toyota', nombre: 'RAV4', version: 'Limited 2.5 Hybrid AWD', seg: 'suv', carroceria: 'SUV mediano 5 puertas',
    lista: 108.0, calle: 109.5, motor: '2.5 híbrido, 222 CV combinados', comb: 'hibrido', caja: 'automatica', trac: 'awd',
    consumo: 5.7, plazas: 5, baul: 580, puertas: 5, entrega: 45, usos: ['familia', 'ruta', 'ciudad'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['hyundai-santa-fe-hybrid', 'land-rover-range-rover-evoque', 'volvo-xc60-b5'],
  },

  // ------------------------------------------------------------ Ford
  {
    slug: 'ford-transit-furgon', marca: 'ford', nombre: 'Transit', version: 'Furgón 2.2 TDCi', seg: 'utilitario', carroceria: 'Furgón grande',
    lista: 62.0, calle: 60.0, motor: '2.2 TDCi Turbodiésel, 140 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 9.0, plazas: 3, baul: 9500, puertas: 4, entrega: 21, usos: ['trabajo', 'carga'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['maxus-edeliver-3', 'fiat-ducato-furgon', 'renault-master-furgon'],
  },

  // ------------------------------------------------------------ Chevrolet
  {
    slug: 'chevrolet-silverado-high-country', marca: 'chevrolet', nombre: 'Silverado', version: 'High Country 6.2 V8 4x4', seg: 'pickup', carroceria: 'Pickup grande cabina doble',
    lista: 148.0, calle: 144.0, motor: '6.2 V8, 420 CV', comb: 'nafta', caja: 'automatica', trac: '4x4',
    consumo: 14.5, plazas: 5, baul: 1500, puertas: 4, entrega: 30, usos: ['ruta', 'carga', 'familia'],
    veredicto: 'no conviene', estado: 'vigente',
    rivales: ['jeep-gladiator-rubicon', 'ram-1500-laramie', 'ram-2500-laramie'],
  },

  // ------------------------------------------------------------ Volkswagen
  {
    slug: 'volkswagen-saveiro-cross', marca: 'volkswagen', nombre: 'Saveiro', version: 'Cross 1.6 cabina doble', seg: 'pickup', carroceria: 'Pickup compacta cabina doble',
    lista: 36.5, calle: 35.2, motor: '1.6 MSI 16v, 110 CV', comb: 'nafta', caja: 'manual', trac: '4x2',
    consumo: 8.0, plazas: 5, baul: 715, puertas: 4, entrega: 10, usos: ['trabajo', 'carga', 'ciudad'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['fiat-strada-volcano', 'chevrolet-montana-ltz', 'dongfeng-rich-6'],
  },

  // ------------------------------------------------------------ Fiat
  {
    slug: 'fiat-ducato-furgon', marca: 'fiat', nombre: 'Ducato', version: 'Furgón 2.3 Multijet', seg: 'utilitario', carroceria: 'Furgón grande',
    lista: 58.0, calle: 56.0, motor: '2.3 Multijet Turbodiésel, 140 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 8.8, plazas: 3, baul: 10000, puertas: 4, entrega: 14, usos: ['trabajo', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['renault-master-furgon', 'ford-transit-furgon', 'maxus-edeliver-3'],
  },

  // ------------------------------------------------------------ Renault
  {
    slug: 'renault-master-furgon', marca: 'renault', nombre: 'Master', version: 'Furgón L2H2 2.3 dCi', seg: 'utilitario', carroceria: 'Furgón grande',
    lista: 56.5, calle: 54.5, motor: '2.3 dCi Turbodiésel, 136 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 8.5, plazas: 3, baul: 10800, puertas: 4, entrega: 14, usos: ['trabajo', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['fiat-ducato-furgon', 'citroen-jumper', 'citroen-jumpy'],
  },

  // ------------------------------------------------------------ Peugeot
  {
    slug: 'peugeot-5008-allure', marca: 'peugeot', nombre: '5008', version: 'Allure 1.6 THP AT 7 plazas', seg: 'suv', carroceria: 'SUV grande 5 puertas, 7 plazas',
    lista: 84.0, calle: 81.5, motor: '1.6 THP 16v, 165 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 8.1, plazas: 7, baul: 780, puertas: 5, entrega: 25, usos: ['familia', 'ruta'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['volvo-ex30-core', 'jeep-commander-overland', 'audi-q2'],
  },
  {
    slug: 'peugeot-landtrek-allure', marca: 'peugeot', nombre: 'Landtrek', version: 'Allure 1.9 HDi 4x4 MT', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 52.9, calle: 51.0, motor: '1.9 HDi Turbodiésel, 150 CV', comb: 'diesel', caja: 'manual', trac: '4x4',
    consumo: 8.3, plazas: 5, baul: 1000, puertas: 4, entrega: 14, usos: ['trabajo', 'carga', 'off-road'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['gwm-poer-elite', 'toyota-hilux-dx', 'fiat-toro-volcano'],
  },

  // ------------------------------------------------------------ Citroën

  // ------------------------------------------------------------ Nissan
  {
    slug: 'nissan-sentra-exclusive', marca: 'nissan', nombre: 'Sentra', version: 'Exclusive 2.0 CVT', seg: 'sedan', carroceria: 'Sedán 4 puertas',
    lista: 48.9, calle: 47.2, motor: '2.0 16v, 149 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 7.0, plazas: 5, baul: 482, puertas: 4, entrega: 14, usos: ['ciudad', 'ruta', 'familia'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['toyota-corolla-xli', 'hyundai-elantra', 'kia-k3'],
  },

  // ------------------------------------------------------------ Honda, Hyundai, Kia
  {
    slug: 'honda-wr-v-exl', marca: 'honda', nombre: 'WR-V', version: 'EXL 1.5 CVT', seg: 'suv', carroceria: 'SUV compacto 5 puertas',
    lista: 46.9, calle: 45.5, motor: '1.5 i-VTEC 16v, 126 CV', comb: 'nafta', caja: 'automatica', trac: '4x2',
    consumo: 6.8, plazas: 5, baul: 380, puertas: 5, entrega: 20, usos: ['ciudad', 'familia', 'primer auto'],
    veredicto: 'con reparos', estado: 'vigente',
    rivales: ['jeep-renegade-longitude', 'omoda-c5', 'byd-yuan-pro'],
  },

  // ------------------------------------------------------------ Jeep, RAM
  {
    slug: 'jeep-gladiator-rubicon', marca: 'jeep', nombre: 'Gladiator', version: 'Rubicon 3.6 V6 4x4', seg: 'pickup', carroceria: 'Pickup mediana cabina doble',
    lista: 142.0, calle: 139.0, motor: '3.6 Pentastar V6, 284 CV', comb: 'nafta', caja: 'automatica', trac: '4x4',
    consumo: 13.0, plazas: 5, baul: 1000, puertas: 4, entrega: 45, usos: ['off-road', 'ruta'],
    veredicto: 'no conviene', estado: 'vigente',
    rivales: ['chevrolet-silverado-high-country', 'ram-1500-laramie', 'ram-2500-laramie'],
  },

  // ------------------------------------------------------------ Chinas y premium que faltaban
  {
    slug: 'mercedes-sprinter-furgon', marca: 'mercedes-benz', nombre: 'Sprinter', version: 'Furgón 411 CDI 2.1', seg: 'utilitario', carroceria: 'Furgón grande',
    lista: 78.0, calle: 76.0, motor: '2.1 CDI Turbodiésel, 143 CV', comb: 'diesel', caja: 'manual', trac: '4x2',
    consumo: 9.2, plazas: 3, baul: 11000, puertas: 4, entrega: 21, usos: ['trabajo', 'carga'],
    veredicto: 'conviene', estado: 'vigente',
    rivales: ['ford-transit-furgon', 'maxus-edeliver-3', 'fiat-ducato-furgon'],
  },
]

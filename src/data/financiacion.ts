import type { OfertaFinanciacion, PlanFinanciacion } from '../types'

// Datos de ejemplo. Tasas, plazos y montos son ilustrativos.

export const planesFinanciacion: PlanFinanciacion[] = [
  {
    id: 'prendario-marca',
    nombre: 'Crédito prendario de la marca',
    resumen: 'La financiera de la propia marca te presta una parte del auto a tasa subsidiada. Es la forma más común de comprar 0km financiado.',
    comoFunciona: [
      'Elegís el auto en el concesionario y pedís financiación de la marca (Toyota Compañía Financiera, VW Financial, Fiat Crédito, etc.).',
      'Ponés un anticipo, en general entre el 30% y el 50% del valor, con plata o con tu usado.',
      'El resto lo pagás en cuotas fijas de 12 a 60 meses. El auto queda prendado: es tuyo, pero no lo podés vender hasta cancelar.',
      'Presentás DNI, recibos de sueldo o monotributo y un análisis crediticio que sale en 24 a 72 horas.',
    ],
    paraQuien: 'Para quien tiene el anticipo y quiere el auto ahora, con cuota conocida desde el principio.',
    ventajas: ['Tasas muy por debajo de un préstamo personal, a veces 0% en promociones de stock.', 'Cuota fija en pesos: la inflación juega a favor.', 'Entrega inmediata si hay stock.'],
    riesgos: ['Las tasas 0% suelen aplicar solo a montos chicos o a modelos que la marca necesita vender.', 'Los gastos de otorgamiento, sellado e inscripción de prenda suman entre 2% y 4% del monto.', 'Si dejás de pagar, la financiera puede ejecutar la prenda.'],
    tnaReferencia: 38,
    plazosMeses: [12, 24, 36, 48],
    anticipoMinimoPct: 30,
  },
  {
    id: 'prendario-banco',
    nombre: 'Crédito prendario bancario',
    resumen: 'Igual que el de la marca, pero lo da tu banco. Sirve para cualquier auto, de cualquier marca, nuevo o usado.',
    comoFunciona: [
      'Pedís el crédito en tu banco antes o después de elegir el auto. Te dicen hasta cuánto te prestan según tus ingresos.',
      'El banco financia hasta el 70% u 80% del valor del auto, con plazos de hasta 60 meses.',
      'Elegís entre tasa fija en pesos o UVA. La cuota no puede superar el 30% o 35% de tus ingresos.',
      'Vos le pagás al concesionario con el préstamo y el banco inscribe la prenda.',
    ],
    paraQuien: 'Para quien tiene sueldo acreditado en el banco y busca elegir el auto con libertad, sin atarse a una marca.',
    ventajas: ['Sirve para cualquier auto, también usados.', 'Los clientes con paquete de cuentas suelen tener tasa preferencial.', 'Trámite conocido, con seguro de vida incluido.'],
    riesgos: ['Tasa fija más alta que la de una marca en promoción.', 'Exige ingresos demostrables y buen historial en el Veraz.', 'Los plazos largos hacen que pagues el auto casi dos veces en intereses.'],
    tnaReferencia: 52,
    plazosMeses: [12, 24, 36, 48, 60],
    anticipoMinimoPct: 20,
  },
  {
    id: 'uva',
    nombre: 'Crédito prendario UVA',
    resumen: 'Cuota más baja al principio, ajustada por inflación mes a mes. Prestan más plata, pero la cuota sube.',
    comoFunciona: [
      'El préstamo se expresa en UVA, una unidad que sigue la inflación oficial (CER).',
      'La cuota inicial es más baja que la de tasa fija, porque la tasa de interés es chica (entre 5% y 12% anual sobre UVA).',
      'Cada mes la cuota se actualiza con el valor de la UVA. Si la inflación es alta, la cuota sube en pesos.',
      'Suele haber una cláusula que permite extender el plazo si la cuota supera cierto porcentaje del sueldo.',
    ],
    paraQuien: 'Para quien espera que su sueldo siga a la inflación y necesita que le presten más de lo que da una tasa fija.',
    ventajas: ['Prestan hasta el doble que con tasa fija para el mismo ingreso.', 'Cuota inicial baja.', 'Plazos largos, hasta 72 meses.'],
    riesgos: ['La cuota puede subir mucho si la inflación se acelera y el sueldo no acompaña.', 'La deuda en pesos crece con el tiempo aunque pagues.', 'Difícil de precancelar en los primeros meses porque el capital ajustado es alto.'],
    tnaReferencia: 9,
    plazosMeses: [24, 36, 48, 60, 72],
    anticipoMinimoPct: 20,
  },
  {
    id: 'plan-ahorro',
    nombre: 'Plan de ahorro',
    resumen: 'Pagás una cuota mensual junto con un grupo de personas, y cada mes se adjudican autos por sorteo y por licitación. No hay tasa de interés, pero la cuota sigue el precio del auto.',
    comoFunciona: [
      'Te suscribís a un plan de 84 o 120 cuotas de un modelo específico (por ejemplo, un Cronos o un Kwid).',
      'La cuota es un porcentaje del precio de lista del auto, más gastos administrativos y seguro. Si el auto sube, la cuota sube.',
      'Todos los meses se adjudican autos por sorteo entre los suscriptores y por licitación (quien ofrece adelantar más cuotas se lo lleva).',
      'Podés licitar con plata o con tu usado. Una vez adjudicado, seguís pagando las cuotas restantes con el auto prendado.',
    ],
    paraQuien: 'Para quien no tiene anticipo y puede esperar. También para quien quiere reservar un precio de lista y pagar de a poco.',
    ventajas: ['Sin anticipo ni análisis crediticio serio para entrar.', 'Sin tasa de interés: pagás el precio de lista dividido.', 'Se puede licitar con el usado.'],
    riesgos: ['Sin licitar podés esperar años. Los sorteos son pocos por mes.', 'Los gastos administrativos suman entre 8% y 15% del valor a lo largo del plan.', 'La cuota sigue el precio de lista, que en Argentina sube todos los meses.', 'Los planes de venta agresiva por teléfono suelen esconder cuotas más altas después de la adjudicación.'],
    tnaReferencia: 0,
    plazosMeses: [84, 120],
    anticipoMinimoPct: 0,
  },
  {
    id: 'concesionario',
    nombre: 'Financiación en el concesionario',
    resumen: 'El concesionario financia una parte con tarjeta de crédito en cuotas o con su propia financiera. Sirve para completar lo que falta.',
    comoFunciona: [
      'El concesionario ofrece cuotas sin interés con tarjeta para un monto acotado, en general entre 3 y 10 millones.',
      'Se combina con un anticipo, un usado y a veces con un prendario de la marca.',
      'El límite depende de tu tarjeta y del acuerdo del concesionario con el banco.',
    ],
    paraQuien: 'Para quien tiene casi todo el valor del auto y le falta un tramo chico.',
    ventajas: ['Sin trámite: se aprueba en el momento.', 'Cuotas sin interés en promociones puntuales.'],
    riesgos: ['Los montos son chicos.', 'Cuando no es sin interés, la tasa de tarjeta es de las más caras del mercado.'],
    tnaReferencia: 75,
    plazosMeses: [3, 6, 12],
    anticipoMinimoPct: 70,
  },
  {
    id: 'leasing',
    nombre: 'Leasing',
    resumen: 'Alquilás el auto con opción de compra al final. Pensado para empresas y monotributistas que descargan IVA.',
    comoFunciona: [
      'Un banco o la financiera de la marca compra el auto y te lo alquila por 24 a 48 meses.',
      'Al final pagás un valor residual, en general entre 5% y 20%, y el auto pasa a ser tuyo. O lo devolvés.',
      'Los cánones se deducen de Ganancias y el IVA se descarga mes a mes.',
    ],
    paraQuien: 'Para empresas, profesionales con factura y flotas. No tiene sentido para un particular sin actividad.',
    ventajas: ['Ventaja impositiva real para quien factura.', 'No inmoviliza capital.', 'Se puede renovar el auto cada tres años.'],
    riesgos: ['Más caro que un prendario si no aprovechás la parte impositiva.', 'Exige balance o facturación demostrable.', 'Penalidades por kilómetros o daños en algunos contratos.'],
    tnaReferencia: 45,
    plazosMeses: [24, 36, 48],
    anticipoMinimoPct: 10,
  },
  {
    id: 'usado-parte-pago',
    nombre: 'Entrega del usado como parte de pago',
    resumen: 'No es un crédito, pero es la forma en que la mayoría paga el anticipo. Conviene saber cuánto vale tu usado antes de entrar al concesionario.',
    comoFunciona: [
      'El concesionario tasa tu usado, en general entre 5% y 15% por debajo del precio de venta al público.',
      'Ese valor se descuenta del precio del 0km y el resto se paga con plata o con crédito.',
      'Algunas marcas dan un bono extra por entregar un usado de la misma marca.',
    ],
    paraQuien: 'Para quien tiene un auto y no quiere venderlo por su cuenta.',
    ventajas: ['Cero trámite de venta: sin publicar, sin mostrarlo, sin transferencias con desconocidos.', 'Se combina con cualquier crédito.', 'Bonos por usado de la misma marca.'],
    riesgos: ['Te lo pagan menos que vendiéndolo vos. Esa diferencia es el costo de la comodidad.', 'Algunas tasaciones bajan cuando aparece el descuento del 0km. Negociá los dos números por separado.'],
    tnaReferencia: 0,
    plazosMeses: [],
    anticipoMinimoPct: 0,
  },
]

const M = 1_000_000

export const ofertasFinanciacion: OfertaFinanciacion[] = [
  { id: 'of-01', marcaId: 'toyota', planId: 'prendario-marca', titulo: 'Toyota Plan Cuota Fija', tna: 29.9, plazoMeses: 36, montoMaximoARS: 25 * M, vigenciaHasta: '2026-09-30', condiciones: 'Yaris, Corolla y Corolla Cross. Anticipo mínimo 40%.' },
  { id: 'of-02', marcaId: 'volkswagen', planId: 'prendario-marca', titulo: 'VW Financial tasa 0%', tna: 0, plazoMeses: 12, montoMaximoARS: 12 * M, vigenciaHasta: '2026-09-30', condiciones: 'Polo, Virtus y T-Cross con stock. Anticipo 50%.' },
  { id: 'of-03', marcaId: 'fiat', planId: 'prendario-marca', titulo: 'Fiat Crédito 24 cuotas', tna: 19.9, plazoMeses: 24, montoMaximoARS: 15 * M, vigenciaHasta: '2026-10-15', condiciones: 'Cronos, Argo y Strada. Anticipo 40%.' },
  { id: 'of-04', marcaId: 'chevrolet', planId: 'prendario-marca', titulo: 'GM Financial 0% a 18 meses', tna: 0, plazoMeses: 18, montoMaximoARS: 14 * M, vigenciaHasta: '2026-09-30', condiciones: 'Onix, Onix Plus y Tracker. Anticipo 50%.' },
  { id: 'of-05', marcaId: 'renault', planId: 'prendario-marca', titulo: 'Mobilize Financial', tna: 24.9, plazoMeses: 36, montoMaximoARS: 18 * M, vigenciaHasta: '2026-10-31', condiciones: 'Kwid, Kardian y Duster. Anticipo 35%.' },
  { id: 'of-06', marcaId: 'chery', planId: 'prendario-marca', titulo: 'Chery Financia', tna: 34.9, plazoMeses: 36, montoMaximoARS: 20 * M, vigenciaHasta: '2026-10-31', condiciones: 'Toda la gama Tiggo. Anticipo 30%.' },
  { id: 'of-07', marcaId: 'byd', planId: 'prendario-marca', titulo: 'BYD tasa fija 36 meses', tna: 27.5, plazoMeses: 36, montoMaximoARS: 28 * M, vigenciaHasta: '2026-11-30', condiciones: 'Dolphin Mini, Yuan Pro y Song Pro. Anticipo 30%.' },
  { id: 'of-08', marcaId: 'ford', planId: 'prendario-marca', titulo: 'Ford Credit Ranger', tna: 32.0, plazoMeses: 48, montoMaximoARS: 35 * M, vigenciaHasta: '2026-10-31', condiciones: 'Ranger y Territory. Anticipo 30%.' },
  { id: 'of-09', marcaId: 'peugeot', planId: 'prendario-marca', titulo: 'Peugeot Financiación 18 cuotas', tna: 9.9, plazoMeses: 18, montoMaximoARS: 13 * M, vigenciaHasta: '2026-09-30', condiciones: '208 y 2008 con stock. Anticipo 50%.' },
  { id: 'of-10', marcaId: 'haval', planId: 'prendario-marca', titulo: 'Haval Plan H6', tna: 29.9, plazoMeses: 36, montoMaximoARS: 30 * M, vigenciaHasta: '2026-11-30', condiciones: 'Jolion y H6 HEV. Anticipo 30%.' },
  { id: 'of-11', marcaId: 'jaecoo', planId: 'prendario-marca', titulo: 'Jaecoo lanzamiento 0%', tna: 0, plazoMeses: 12, montoMaximoARS: 15 * M, vigenciaHasta: '2026-10-31', condiciones: 'J7 con anticipo 50%. Cupo limitado.' },
  { id: 'of-12', marcaId: 'hyundai', planId: 'prendario-marca', titulo: 'Hyundai Capital', tna: 36.0, plazoMeses: 36, montoMaximoARS: 22 * M, vigenciaHasta: '2026-10-31', condiciones: 'Creta y Tucson. Anticipo 35%.' },
  { id: 'of-13', marcaId: 'fiat', planId: 'plan-ahorro', titulo: 'Plan Fiat Cronos 84 cuotas', tna: 0, plazoMeses: 84, montoMaximoARS: 31 * M, vigenciaHasta: '2026-12-31', condiciones: '100% del valor en 84 cuotas. Adjudicación por sorteo y licitación.' },
  { id: 'of-14', marcaId: 'volkswagen', planId: 'plan-ahorro', titulo: 'Autoahorro VW Polo', tna: 0, plazoMeses: 84, montoMaximoARS: 37 * M, vigenciaHasta: '2026-12-31', condiciones: '70/30: 70% en cuotas y 30% a la adjudicación.' },
  { id: 'of-15', marcaId: 'toyota', planId: 'plan-ahorro', titulo: 'Toyota Plan Yaris', tna: 0, plazoMeses: 120, montoMaximoARS: 33 * M, vigenciaHasta: '2026-12-31', condiciones: '100% en 120 cuotas. Sorteo mensual.' },
  { id: 'of-16', marcaId: 'great-wall', planId: 'prendario-marca', titulo: 'GWM Poer 36 cuotas', tna: 24.9, plazoMeses: 36, montoMaximoARS: 26 * M, vigenciaHasta: '2026-11-30', condiciones: 'Poer y Haval Jolion. Anticipo 30%.' },
]

/** Cuota mensual con sistema francés. Tasa nominal anual en %. */
export function cuotaFrances(capital: number, tnaPct: number, meses: number): number {
  if (meses <= 0) return capital
  const i = tnaPct / 100 / 12
  if (i === 0) return capital / meses
  return (capital * i) / (1 - Math.pow(1 + i, -meses))
}

/** CFT aproximado: TNA + gastos de otorgamiento y seguro, ilustrativo. */
export function cftAproximado(tnaPct: number): number {
  const tea = (Math.pow(1 + tnaPct / 100 / 12, 12) - 1) * 100
  return Math.round((tea + 6) * 10) / 10
}

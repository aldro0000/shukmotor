import { useMoneda } from '../../hooks/monedaContexto'

/**
 * Pesos o dólares. Un solo control con los dos estados a la vista: así se
 * entiende de un vistazo en qué moneda se está mirando, cosa que un botón que
 * dice sólo la otra moneda no logra.
 *
 * La cotización usada va en el pie, no acá: en el header peleaba lugar con la
 * navegación y terminaba montándose encima de un link. Pasando el mouse por el
 * control también aparece.
 */
export function BotonMoneda() {
  const { moneda, cambiar, dolar } = useMoneda()

  const fecha =
    dolar.actualizado &&
    new Date(dolar.actualizado).toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  const detalle =
    dolar.estado === 'vivo'
      ? `Precios convertidos al dólar oficial de $${dolar.valor.toLocaleString('es-AR')}, según ${dolar.fuente}${fecha ? `, ${fecha}` : ''}`
      : dolar.estado === 'cargando'
        ? 'Buscando la cotización del dólar oficial'
        : `Sin conexión con la fuente. Se usa $${dolar.valor.toLocaleString('es-AR')} como referencia`

  return (
    <div className="conmutador" role="group" aria-label="Moneda de los precios" title={detalle}>
      {(['ARS', 'USD'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => cambiar(m)}
          aria-pressed={moneda === m}
          title={m === 'ARS' ? 'Precios en pesos, en millones' : 'Precios en dólares, en miles'}
        >
          {m === 'ARS' ? '$' : 'US$'}
        </button>
      ))}
    </div>
  )
}

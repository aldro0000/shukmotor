import { useMoneda } from '../../hooks/monedaContexto'

/**
 * Pesos o dólares. Un solo control con los dos estados a la vista: así se
 * entiende de un vistazo en qué moneda se está mirando, cosa que un botón que
 * dice sólo la otra moneda no logra.
 *
 * Al lado va la cotización usada. Un precio convertido sin decir a qué cambio
 * no se puede verificar, y este sitio se apoya en que todo número sea
 * comprobable.
 */
export function BotonMoneda({ conCotizacion = true }: { conCotizacion?: boolean }) {
  const { moneda, cambiar, dolar } = useMoneda()

  const fecha =
    dolar.actualizado &&
    new Date(dolar.actualizado).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const detalle =
    dolar.estado === 'vivo'
      ? `Dólar oficial $ ${dolar.valor.toLocaleString('es-AR')} según ${dolar.fuente}${fecha ? `, actualizado el ${fecha}` : ''}`
      : dolar.estado === 'cargando'
        ? 'Buscando la cotización del dólar oficial'
        : `Sin conexión con la fuente. Se usa $ ${dolar.valor.toLocaleString('es-AR')} como referencia`

  return (
    <div className="flex items-center gap-2">
      <div className="conmutador" role="group" aria-label="Moneda de los precios">
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

      {conCotizacion && (
        <span className="tabular hidden text-xs leading-tight text-soft xl:block" title={detalle}>
          {dolar.estado === 'cargando' ? (
            'dólar…'
          ) : (
            <>
              <span className="block">dólar ${dolar.valor.toLocaleString('es-AR')}</span>
              <span className={`block ${dolar.estado === 'vivo' ? '' : 'text-warn'}`}>
                {dolar.estado === 'vivo' ? dolar.fuente : 'sin conexión'}
              </span>
            </>
          )}
        </span>
      )}
    </div>
  )
}

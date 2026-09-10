import { useMoneda } from '../../hooks/monedaContexto'

/**
 * La cotización con la que se convierten los precios, su fuente y su hora.
 *
 * Va en el pie y no en el header: arriba peleaba lugar con la navegación y
 * terminaba montándose encima de un link. Acá siempre se ve, que es lo que
 * importa — un precio convertido sin decir a qué cambio no se puede verificar.
 *
 * Devuelve un span porque va dentro del párrafo de la letra chica.
 */
export function Cotizacion() {
  const { dolar } = useMoneda()

  if (dolar.estado === 'cargando') return <span className="tabular">Buscando la cotización del dólar…</span>

  const fecha =
    dolar.actualizado &&
    new Date(dolar.actualizado).toLocaleString('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (dolar.estado === 'respaldo') {
    return (
      <span className="tabular text-warn">
        Sin conexión con la fuente del dólar: los precios en dólares usan ${dolar.valor.toLocaleString('es-AR')} de
        referencia.
      </span>
    )
  }

  return (
    <span className="tabular">
      Dólar oficial ${dolar.valor.toLocaleString('es-AR')} ·{' '}
      <a href={dolar.sitio} target="_blank" rel="noopener noreferrer" className="hover:text-text">
        {dolar.fuente}
      </a>
      {fecha && `, ${fecha}`}
    </span>
  )
}

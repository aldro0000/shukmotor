import { Link } from 'react-router-dom'
import { Fuel, Gauge, Star } from 'lucide-react'
import type { Modelo } from '../../types'
import { formatMillones, marcasPorId, ETIQUETA_COMBUSTIBLE } from '../../data'
import { Img } from '../ui'
import { etiquetaDe } from '../../lib/encaje'
import { useMoneda } from '../../hooks/monedaContexto'

export function ModeloCard({
  modelo,
  motivo,
  eager = false,
}: {
  modelo: Modelo
  /** "Por qué te lo mostramos", una línea */
  motivo?: string
  eager?: boolean
}) {
  // Suscribe la card al cambio de moneda: los formateadores leen un store que
  // vive fuera de React, así que sin esto la card no se enteraría de que hay
  // que volver a dibujar el precio.
  useMoneda()
  const marca = marcasPorId[modelo.marcaId]
  const foto = modelo.fotos[0]
  return (
    <article className="card card-link flex h-full flex-col overflow-hidden">
      <Link to={`/modelos/${modelo.slug}`} className="card-img block aspect-[16/10]">
        <Img
          src={foto.url}
          alt={foto.alt}
          width={foto.width}
          height={foto.height}
          eager={eager}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow truncate">{marca.nombre}</p>
            <h3 className="mt-0.5 truncate text-xl leading-tight">
              <Link to={`/modelos/${modelo.slug}`} className="hover:text-accent">
                {modelo.nombre}
              </Link>
            </h3>
            <p className="truncate text-sm text-soft">{modelo.version}</p>
          </div>
          <span className={`badge max-w-[9.5rem] whitespace-normal text-right leading-tight ${modelo.estado === 'proximo' ? 'badge-warn' : 'badge-neutral'}`}>
            {modelo.estado === 'proximo' ? 'Todavía no se vende' : etiquetaDe(modelo)}
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="tabular font-display text-2xl font-bold leading-none">{formatMillones(modelo.precioCalleARS)}</p>
          <p className="tabular text-xs text-soft">
            {modelo.estado === 'proximo' ? 'precio estimado' : `lista ${formatMillones(modelo.precioListaARS)}`}
          </p>
        </div>

        <ul className="tabular mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-soft">
          <li className="inline-flex items-center gap-1">
            <Fuel className="size-3.5" aria-hidden />
            {ETIQUETA_COMBUSTIBLE[modelo.combustible]}
            {modelo.combustible !== 'electrico' && ` · ${modelo.consumoLitros100km.toLocaleString('es-AR')} L/100`}
          </li>
          <li className="inline-flex items-center gap-1">
            <Gauge className="size-3.5" aria-hidden />
            {modelo.transmision === 'automatica' ? 'Automático' : 'Manual'}
          </li>
          <li className="inline-flex items-center gap-1">
            <Star className="size-3.5" aria-hidden />
            {modelo.opinionesResumen.promedio.toLocaleString('es-AR')} · {modelo.opinionesResumen.cantidad}{' '}
            {modelo.opinionesResumen.cantidad === 1 ? 'dueño' : 'dueños'}
          </li>
        </ul>

        {motivo && (
          <p className="mt-3 border-t border-border pt-3 text-sm leading-snug">
            <span className="eyebrow mr-1.5">Por qué</span>
            {motivo}
          </p>
        )}
      </div>
    </article>
  )
}

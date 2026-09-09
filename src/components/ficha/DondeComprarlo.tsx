import { ArrowUpRight, BadgeCheck, Store, Tag } from 'lucide-react'
import type { LinkCompra, Modelo } from '../../types'
import { formatMillones, marcasPorId } from '../../data'
import { conUtm } from '../../lib/utm'

const ETIQUETA_TIPO: Record<LinkCompra['tipo'], string> = {
  oficial: 'Sitio oficial',
  concesionaria: 'Concesionaria',
  clasificado: 'Clasificados',
  comparador: 'Comparador',
}

export function DondeComprarlo({ modelo }: { modelo: Modelo }) {
  const marca = marcasPorId[modelo.marcaId]
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-2xl">Dónde comprarlo</h3>
          <p className="mt-1 text-soft">
            No vendemos autos. Te llevamos a donde se vende, con el precio de referencia a la vista.
          </p>
        </div>
        <p className="tabular text-right">
          <span className="eyebrow block">Precio de calle de referencia</span>
          <span className="font-display text-2xl font-black">{formatMillones(modelo.precioCalleARS)}</span>
        </p>
      </div>

      <ul className="mt-4 divide-y divide-border rounded-md border border-border" role="list">
        {modelo.linksCompra.map((l) => (
          <li key={l.tienda} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-soft">
              {l.tipo === 'oficial' ? <BadgeCheck className="size-4" aria-hidden /> : l.tipo === 'comparador' ? <Tag className="size-4" aria-hidden /> : <Store className="size-4" aria-hidden />}
            </span>
            <span className="min-w-[180px] flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{l.tienda}</span>
                <span className="badge badge-neutral">{ETIQUETA_TIPO[l.tipo]}</span>
                {l.comision && <span className="text-xs text-soft">puede generarnos comisión</span>}
              </span>
              <span className="mt-0.5 block text-sm text-soft">{l.nota}</span>
            </span>
            <a
              href={conUtm(l.url, modelo.slug, l.tienda)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="btn btn-ghost btn-sm shrink-0"
            >
              Ir a {l.tienda.split(' ')[0]}
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-soft">
        Algunos links pueden generarnos una comisión. Nunca cobramos por escribir una opinión. El orden de esta lista no se
        vende: primero va el sitio oficial de {marca.nombre} y después los demás, siempre igual en todas las fichas.
      </p>
    </div>
  )
}

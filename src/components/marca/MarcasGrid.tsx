import { Link } from 'react-router-dom'
import type { Marca } from '../../types'
import { ETIQUETA_ORIGEN } from '../../data'
import { LogoMarca } from '../ui'

/** Grilla de logos: cinco columnas, alfabética, logo a la izquierda y nombre a la derecha. */
export function MarcasGrid({ marcas, compacta = false }: { marcas: Marca[]; compacta?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="list">
      {marcas.map((m) => (
        <li key={m.id}>
          <Link
            to={`/marcas/${m.slug}`}
            className="logo-gris card flex items-center gap-3 p-2.5 hover:border-text-soft focus-visible:border-accent"
          >
            <LogoMarca marca={m} size={40} />
            <span className="min-w-0">
              <span className="block truncate font-semibold leading-tight">{m.nombre}</span>
              {!compacta && (
                <span className="block truncate text-xs text-soft">
                  {ETIQUETA_ORIGEN[m.origen]}
                  {m.tipo === 'nueva' && ` · llegó en ${m.anioLlegada}`}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

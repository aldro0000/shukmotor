import { Link } from 'react-router-dom'
import { Check, Minus } from 'lucide-react'
import type { Modelo } from '../../types'
import { encajeDe, puntajesDe } from '../../lib/encaje'

const DIMENSIONES: { k: keyof ReturnType<typeof puntajesDe>; label: string; nota: string }[] = [
  { k: 'andar', label: 'Andar', nota: 'potencia y caja para su tamaño' },
  { k: 'consumo', label: 'Consumo', nota: 'contra el promedio de su segmento' },
  { k: 'posventa', label: 'Posventa', nota: 'red y tiempos que medimos' },
  { k: 'reventa', label: 'Reventa', nota: 'según nuestro índice' },
]

function Barra({ label, nota, valor }: { label: string; nota: string; valor: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="tabular font-display text-lg font-bold leading-none">{valor.toLocaleString('es-AR')}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${valor * 10}%` }} />
      </div>
      <p className="mt-1 text-xs text-soft">{nota}</p>
    </div>
  )
}

/**
 * Juicio de encaje: para quién es este auto y para quién no.
 *
 * Los dos bloques tienen el mismo peso visual a propósito. Poner lo bueno
 * grande y lo malo en gris chiquito sería vender, no informar.
 */
export function Encaje({ modelo }: { modelo: Modelo }) {
  const { aFavor, enContra } = encajeDe(modelo)
  const p = puntajesDe(modelo)

  return (
    <section aria-label="Para quién es este auto" className="card overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="border-b border-border p-5 md:border-b-0 md:border-r">
          <p className="inline-flex items-center gap-1.5 eyebrow text-ok">
            <Check className="size-3.5" aria-hidden />
            Te sirve si
          </p>
          <ul className="mt-3 space-y-2.5">
            {aFavor.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.95rem] leading-snug">
                <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-ok" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5">
          <p className="inline-flex items-center gap-1.5 eyebrow text-bad">
            <Minus className="size-3.5" aria-hidden />
            Buscá otra si
          </p>
          <ul className="mt-3 space-y-2.5">
            {enContra.map((t) => (
              <li key={t} className="flex gap-2.5 text-[0.95rem] leading-snug">
                <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-bad" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-4">
        {DIMENSIONES.map((d) => (
          <Barra key={d.k} label={d.label} nota={d.nota} valor={p[d.k]} />
        ))}
      </div>

      <p className="border-t border-border px-5 py-3 text-xs text-soft">
        Los espacios publicitarios se compran. Este bloque no.{' '}
        <Link to="/como-trabajamos" className="font-semibold hover:text-accent">
          Cómo trabajamos
        </Link>
        .
      </p>
    </section>
  )
}

import { useMemo, useState, type FormEvent } from 'react'
import { Check, Gauge, ThumbsUp, UserRound } from 'lucide-react'
import type { Dimensiones, Modelo, Opinion } from '../../types'
import { formatFecha, formatNumero, opinionesDeModelo } from '../../data'

const ETIQUETA_DIMENSION: Record<keyof Dimensiones, string> = {
  andar: 'Andar',
  consumo: 'Consumo',
  posventa: 'Posventa',
  calidad: 'Calidad percibida',
}

export function BarraDimension({ label, valor }: { label: string; valor: number }) {
  const pct = (valor / 5) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="tabular font-semibold">{valor.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function TarjetaOpinion({ o }: { o: Opinion }) {
  return (
    <article className="card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-2 text-soft">
            <UserRound className="size-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold leading-tight">{o.autor}</p>
            <p className="tabular text-xs text-soft">
              Dueño · {formatNumero(o.kmRecorridos)} km · {formatFecha(o.fecha)}
            </p>
          </div>
        </div>
        <p className="tabular shrink-0 font-display text-2xl font-black leading-none">
          {o.puntaje.toLocaleString('es-AR')}
          <span className="text-base font-normal text-soft">/5</span>
        </p>
      </header>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div>
          <dt className="eyebrow text-ok">Lo bueno</dt>
          <dd className="mt-0.5">{o.loBueno}</dd>
        </div>
        <div>
          <dt className="eyebrow text-bad">Lo malo</dt>
          <dd className="mt-0.5">{o.loMalo}</dd>
        </div>
      </dl>
      <p className="tabular mt-3 inline-flex items-center gap-1.5 border-t border-border pt-2 text-xs text-soft">
        <ThumbsUp className="size-3.5" aria-hidden />A {o.util} personas les sirvió
      </p>
    </article>
  )
}

function FormOpinion({ modelo }: { modelo: Modelo }) {
  const [enviado, setEnviado] = useState(false)
  const [puntaje, setPuntaje] = useState(4)

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="card p-5" role="status">
        <p className="inline-flex items-center gap-2 font-display text-2xl font-bold">
          <Check className="size-6 text-ok" aria-hidden />
          Gracias
        </p>
        <p className="mt-2 text-soft">
          Recibimos tu opinión sobre el {modelo.nombre}. La leemos antes de publicarla, y nunca cobramos ni pagamos por una
          opinión.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="card p-5">
      <h3 className="text-2xl">¿Lo tenés? Contá cómo te fue</h3>
      <p className="mt-1 text-sm text-soft">Solo dueños. Los kilómetros son obligatorios porque una opinión a 500 km no dice nada.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="op-autor" className="text-sm font-medium text-soft">
            Tu nombre
          </label>
          <input id="op-autor" required className="field mt-1" placeholder="Nombre y apellido" />
        </div>
        <div>
          <label htmlFor="op-km" className="text-sm font-medium text-soft">
            Kilómetros recorridos
          </label>
          <input id="op-km" required inputMode="numeric" className="field mt-1" placeholder="ej. 24000" />
        </div>
      </div>
      <div className="mt-3">
        <label htmlFor="op-puntaje" className="flex items-baseline justify-between text-sm font-medium text-soft">
          Puntaje general
          <output className="tabular font-display text-xl font-bold text-text">{puntaje}/5</output>
        </label>
        <input
          id="op-puntaje"
          type="range"
          min={1}
          max={5}
          step={1}
          value={puntaje}
          onChange={(e) => setPuntaje(Number(e.target.value))}
          className="range"
          style={{ ['--pct' as string]: `${((puntaje - 1) / 4) * 100}%` }}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="op-bueno" className="text-sm font-medium text-soft">
            Qué te gusta
          </label>
          <textarea id="op-bueno" required rows={3} className="field mt-1" placeholder="Lo que mejor funciona en el día a día" />
        </div>
        <div>
          <label htmlFor="op-malo" className="text-sm font-medium text-soft">
            Qué no
          </label>
          <textarea id="op-malo" required rows={3} className="field mt-1" placeholder="Lo que te molesta o te falló" />
        </div>
      </div>
      <button type="submit" className="btn btn-primary mt-4">
        Publicar mi opinión
      </button>
    </form>
  )
}

export function Opiniones({ modelo }: { modelo: Modelo }) {
  const todas = useMemo(() => opinionesDeModelo(modelo.id), [modelo.id])
  const [verTodas, setVerTodas] = useState(false)
  const utiles = useMemo(() => [...todas].sort((a, b) => b.util - a.util), [todas])
  const mostradas = verTodas ? utiles : utiles.slice(0, 3)
  const r = modelo.opinionesResumen
  const kmPromedio = todas.length ? Math.round(todas.reduce((a, o) => a + o.kmRecorridos, 0) / todas.length) : 0

  return (
    <section aria-label={`Opiniones de dueños del ${modelo.nombre}`}>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="card p-5">
          <p className="eyebrow">Promedio de dueños</p>
          <p className="tabular font-display text-6xl font-black leading-none">
            {r.promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </p>
          <p className="tabular mt-1 text-sm text-soft">
            {r.cantidad} {r.cantidad === 1 ? 'opinión' : 'opiniones'} de dueños
          </p>
          <p className="tabular mt-3 inline-flex items-center gap-1.5 border-t border-border pt-3 text-xs text-soft">
            <Gauge className="size-3.5" aria-hidden />
            {formatNumero(kmPromedio)} km de promedio recorridos
          </p>
        </div>
        <div className="card space-y-3 p-5">
          <p className="eyebrow">Por dimensión</p>
          {(Object.keys(ETIQUETA_DIMENSION) as (keyof Dimensiones)[]).map((k) => (
            <BarraDimension key={k} label={ETIQUETA_DIMENSION[k]} valor={r.dimensiones[k]} />
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-soft">
        Son opiniones de dueños con kilómetros recorridos, no reviews de prensa ni de la marca.
      </p>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {mostradas.map((o) => (
          <TarjetaOpinion key={o.id} o={o} />
        ))}
      </div>

      {utiles.length > 3 && (
        <button type="button" className="btn btn-ghost mt-4" onClick={() => setVerTodas((v) => !v)}>
          {verTodas ? 'Ver solo las tres más útiles' : `Ver las ${utiles.length} opiniones`}
        </button>
      )}

      <div className="mt-8">
        <FormOpinion modelo={modelo} />
      </div>
    </section>
  )
}

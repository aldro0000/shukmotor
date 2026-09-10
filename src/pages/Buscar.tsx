import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Link2, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { Modelo } from '../types'
import { ETIQUETA_COMBUSTIBLE, ETIQUETA_SEGMENTO, formatMillones, formatUSD, modelosALaVenta } from '../data'
import { useMoneda } from '../hooks/monedaContexto'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, DatosEjemplo } from '../components/ui'
import { ModeloCard } from '../components/modelo/ModeloCard'
import {
  ORDENES,
  PRESUPUESTO_MAX,
  PRESUPUESTO_MIN,
  PRESUPUESTO_PASO,
  REQUISITOS,
  USOS,
  buscar,
  escribirEstado,
  leerEstado,
  type Estado,
} from '../lib/buscador'

const PASOS = [
  { n: 1, label: 'Presupuesto' },
  { n: 2, label: 'Uso' },
  { n: 3, label: 'No negociable' },
] as const

const SEGMENTOS = Object.keys(ETIQUETA_SEGMENTO) as Modelo['segmento'][]
const COMBUSTIBLES = Object.keys(ETIQUETA_COMBUSTIBLE) as Modelo['combustible'][]

function alternar<T>(lista: T[], v: T): T[] {
  return lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]
}

export default function Buscar() {
  useTitle('Buscar por presupuesto')
  const [params, setParams] = useSearchParams()
  const estado = useMemo(() => leerEstado(params), [params])
  // Dirección de la transición: patrón "estado derivado del anterior" sin efectos.
  const [pasoPrevio, setPasoPrevio] = useState(estado.paso)
  const [direccion, setDireccion] = useState<'adelante' | 'atras'>('adelante')
  if (pasoPrevio !== estado.paso) {
    setDireccion(estado.paso > pasoPrevio ? 'adelante' : 'atras')
    setPasoPrevio(estado.paso)
  }

  const set = (cambios: Partial<Estado>, opts: { replace?: boolean } = {}) => {
    setParams(escribirEstado({ ...estado, ...cambios }), { replace: opts.replace ?? false })
  }

  const irA = (paso: Estado['paso']) => {
    set({ paso })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] overflow-x-hidden">
      {estado.paso < 4 ? (
        <Container className="py-8 md:py-12">
          <Progreso paso={estado.paso} irA={irA} estado={estado} />
          <div key={estado.paso} className={direccion === 'adelante' ? 'paso-in' : 'paso-in-atras'}>
            {estado.paso === 1 && <PasoPresupuesto estado={estado} set={set} />}
            {estado.paso === 2 && <PasoUsos estado={estado} set={set} siguiente={() => irA(3)} atras={() => irA(1)} />}
            {estado.paso === 3 && <PasoRequisitos estado={estado} set={set} siguiente={() => irA(4)} atras={() => irA(2)} />}
          </div>
        </Container>
      ) : (
        <Resultados estado={estado} set={set} irA={irA} />
      )}
    </div>
  )
}

function Progreso({ paso, irA, estado }: { paso: Estado['paso']; irA: (p: Estado['paso']) => void; estado: Estado }) {
  const resumen: Record<number, string> = {
    1: formatMillones(estado.presupuesto + estado.usado),
    2: estado.usos.length ? estado.usos.map((u) => USOS.find((x) => x.id === u)!.label).join(', ') : 'Sin elegir',
    3: estado.requisitos.length ? estado.requisitos.map((r) => REQUISITOS.find((x) => x.id === r)!.label).join(', ') : 'Sin elegir',
  }
  return (
    <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Pasos">
      {PASOS.map((p) => {
        const hecho = p.n < paso
        const actual = p.n === paso
        return (
          <li key={p.n}>
            <button
              type="button"
              disabled={!hecho}
              onClick={() => irA(p.n)}
              className={`w-full border-t-2 pt-3 text-left transition-colors ${
                actual ? 'border-accent' : hecho ? 'border-text hover:border-accent' : 'border-border'
              } ${!hecho ? 'cursor-default' : ''}`}
              aria-current={actual ? 'step' : undefined}
            >
              <span className={`eyebrow flex items-center gap-1.5 ${actual ? 'text-accent' : ''}`}>
                {hecho ? <Check className="size-3.5" aria-hidden /> : `${p.n}.`} {p.label}
              </span>
              <span className={`mt-0.5 block truncate text-sm ${hecho ? 'text-text' : 'text-soft'}`}>
                {hecho ? resumen[p.n] : actual ? 'Ahora' : 'Después'}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function PasoPresupuesto({ estado, set }: { estado: Estado; set: (c: Partial<Estado>, o?: { replace?: boolean }) => void }) {
  // El monto se tipea en la unidad de la moneda elegida: millones de pesos o
  // miles de dólares. Se guarda siempre en pesos.
  const { moneda, dolar } = useMoneda()
  const unidad = moneda === 'USD' ? dolar.valor * 1000 : 1_000_000
  const [usadoTxt, setUsadoTxt] = useState(estado.usado ? String(Math.round(estado.usado / unidad)) : '')
  const usado = Number(usadoTxt) * unidad || 0
  const total = estado.presupuesto + usado
  const entran = useMemo(() => modelosALaVenta.filter((m) => m.precioCalleARS <= total).length, [total])
  const pct = ((estado.presupuesto - PRESUPUESTO_MIN) / (PRESUPUESTO_MAX - PRESUPUESTO_MIN)) * 100

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    set({ usado, paso: 2 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      <p className="eyebrow">Paso 1 de 3</p>
      <h1 className="mt-2 text-4xl md:text-6xl">¿Cuánto podés poner?</h1>
      <p className="mt-3 max-w-xl text-lg text-soft">Contando ahorros, crédito y lo que te den por tu usado. Después se puede ajustar.</p>

      <div className="card mt-8 p-5 md:p-8">
        <label htmlFor="b-monto" className="text-sm font-medium text-soft">
          Tenés para poner
        </label>
        <output htmlFor="b-monto" className="tabular mt-1 block font-display text-5xl font-black leading-none md:text-7xl">
          {formatMillones(estado.presupuesto)}
        </output>
        <input
          id="b-monto"
          type="range"
          min={PRESUPUESTO_MIN}
          max={PRESUPUESTO_MAX}
          step={PRESUPUESTO_PASO}
          value={estado.presupuesto}
          onChange={(e) => set({ presupuesto: Number(e.target.value) }, { replace: true })}
          className="range mt-6"
          style={{ ['--pct' as string]: `${pct}%` }}
          aria-valuetext={formatMillones(estado.presupuesto)}
          autoFocus
        />
        <div className="tabular flex justify-between text-xs text-soft">
          <span>{formatMillones(PRESUPUESTO_MIN)}</span>
          <span>{formatMillones(PRESUPUESTO_MAX)}+</span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <label htmlFor="b-usado" className="text-sm font-medium text-soft">
              Entrego mi usado por <span className="text-xs">(opcional)</span>
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-soft">{moneda === 'USD' ? 'US$' : '$'}</span>
              <input
                id="b-usado"
                inputMode="numeric"
                placeholder={moneda === 'USD' ? 'ej. 8' : 'ej. 12'}
                value={usadoTxt}
                onChange={(e) => setUsadoTxt(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                onBlur={() => set({ usado }, { replace: true })}
                className={`field pr-20 ${moneda === 'USD' ? 'pl-12' : 'pl-7'}`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-soft">{moneda === 'USD' ? 'miles' : 'millones'}</span>
            </div>
          </div>
          <p className="tabular text-sm text-soft" aria-live="polite">
            {usado > 0 && (
              <>
                Total <strong className="text-text">{formatMillones(total)}</strong>.{' '}
              </>
            )}
            {entran > 0 ? (
              <>
                Entran <strong className="text-text">{entran}</strong> {entran === 1 ? 'auto' : 'autos'} 0km.
              </>
            ) : (
              'Ningún 0km entra, pero te mostramos lo más cercano.'
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn btn-primary">
          Siguiente
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  )
}

function PasoUsos({ estado, set, siguiente, atras }: { estado: Estado; set: (c: Partial<Estado>) => void; siguiente: () => void; atras: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Paso 2 de 3</p>
      <h1 className="mt-2 text-4xl md:text-6xl">¿Para qué lo vas a usar?</h1>
      <p className="mt-3 max-w-xl text-lg text-soft">Elegí todo lo que aplique. Ordena los resultados, no los filtra.</p>
      <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Usos">
        {USOS.map((u) => (
          <Chip key={u.id} on={estado.usos.includes(u.id)} onClick={() => set({ usos: alternar(estado.usos, u.id) })} className="chip px-5! py-3! text-base!">
            {estado.usos.includes(u.id) && <Check className="size-4" aria-hidden />}
            {u.label}
          </Chip>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost" onClick={atras}>
          <ArrowLeft className="size-4" aria-hidden />
          Volver
        </button>
        <button type="button" className="btn btn-primary" onClick={siguiente}>
          {estado.usos.length ? 'Siguiente' : 'Saltar este paso'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function PasoRequisitos({ estado, set, siguiente, atras }: { estado: Estado; set: (c: Partial<Estado>) => void; siguiente: () => void; atras: () => void }) {
  const total = estado.presupuesto + estado.usado
  const cuantos = useMemo(() => buscar({ ...estado, paso: 4 }).entran.length, [estado])
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Paso 3 de 3</p>
      <h1 className="mt-2 text-4xl md:text-6xl">¿Algo que no negociás?</h1>
      <p className="mt-3 max-w-xl text-lg text-soft">Esto sí filtra. Si con todo junto no queda nada, relajamos lo último que elegiste y te avisamos.</p>
      <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Requisitos">
        {REQUISITOS.map((r) => (
          <Chip key={r.id} on={estado.requisitos.includes(r.id)} onClick={() => set({ requisitos: alternar(estado.requisitos, r.id) })} className="chip px-5! py-3! text-base!">
            {estado.requisitos.includes(r.id) && <Check className="size-4" aria-hidden />}
            {r.label}
          </Chip>
        ))}
      </div>
      <p className="tabular mt-6 text-sm text-soft" aria-live="polite">
        Con {formatMillones(total)}
        {estado.requisitos.length ? ' y eso' : ''}: <strong className="text-text">{cuantos}</strong> {cuantos === 1 ? 'auto entra' : 'autos entran'}.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn btn-ghost" onClick={atras}>
          <ArrowLeft className="size-4" aria-hidden />
          Volver
        </button>
        <button type="button" className="btn btn-primary" onClick={siguiente}>
          Ver qué me conviene
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function Resultados({ estado, set, irA }: { estado: Estado; set: (c: Partial<Estado>, o?: { replace?: boolean }) => void; irA: (p: Estado['paso']) => void }) {
  const r = useMemo(() => buscar(estado), [estado])
  const [copiado, setCopiado] = useState(false)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const hayFiltros = estado.segmentos.length + estado.combustibles.length > 0 || estado.tipoMarca !== 'todas'

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      window.prompt('Copiá este link', window.location.href)
    }
  }

  const pct = ((estado.presupuesto - PRESUPUESTO_MIN) / (PRESUPUESTO_MAX - PRESUPUESTO_MIN)) * 100

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-border bg-bg/95 backdrop-blur">
        <Container className="flex flex-wrap items-center gap-2 py-3">
          <button type="button" onClick={() => irA(1)} className="chip tabular">
            <strong>{formatMillones(r.total)}</strong>
            {estado.usado > 0 && <span className="text-soft">con usado</span>}
          </button>
          <button type="button" onClick={() => irA(2)} className="chip">
            {estado.usos.length ? estado.usos.map((u) => USOS.find((x) => x.id === u)!.corto).join(' · ') : 'Uso: cualquiera'}
          </button>
          <button type="button" onClick={() => irA(3)} className="chip">
            {estado.requisitos.length ? estado.requisitos.map((q) => REQUISITOS.find((x) => x.id === q)!.corto).join(' · ') : 'Sin requisitos'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setFiltrosAbiertos((v) => !v)} className="chip" aria-expanded={filtrosAbiertos} aria-controls="filtros">
              <SlidersHorizontal className="size-4" aria-hidden />
              Filtrar
              {hayFiltros && <span className="size-1.5 rounded-full bg-accent" aria-hidden />}
            </button>
            <div className="relative">
              <label htmlFor="orden" className="sr-only">
                Ordenar
              </label>
              <select id="orden" value={estado.orden} onChange={(e) => set({ orden: e.target.value as Estado['orden'] }, { replace: true })} className="field rounded-full! py-[0.45rem]! pr-9! text-sm!">
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
            </div>
            <button type="button" onClick={copiar} className="chip" aria-live="polite">
              {copiado ? <Check className="size-4 text-ok" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
              {copiado ? 'Link copiado' : 'Compartir'}
            </button>
          </div>
        </Container>
        {filtrosAbiertos && (
          <div id="filtros" className="drawer border-t border-border bg-surface">
            <Container className="grid gap-5 py-4 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <p className="eyebrow mb-2">Ajustar presupuesto</p>
                <input
                  type="range"
                  min={PRESUPUESTO_MIN}
                  max={PRESUPUESTO_MAX}
                  step={PRESUPUESTO_PASO}
                  value={estado.presupuesto}
                  onChange={(e) => set({ presupuesto: Number(e.target.value) }, { replace: true })}
                  className="range"
                  style={{ ['--pct' as string]: `${pct}%` }}
                  aria-label="Presupuesto"
                  aria-valuetext={formatMillones(estado.presupuesto)}
                />
                <p className="eyebrow mb-2 mt-3">Segmento</p>
                <div className="flex flex-wrap gap-2">
                  {SEGMENTOS.map((s) => (
                    <Chip key={s} on={estado.segmentos.includes(s)} onClick={() => set({ segmentos: alternar(estado.segmentos, s) }, { replace: true })}>
                      {ETIQUETA_SEGMENTO[s]}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2">Combustible</p>
                <div className="flex flex-wrap gap-2">
                  {COMBUSTIBLES.map((c) => (
                    <Chip key={c} on={estado.combustibles.includes(c)} onClick={() => set({ combustibles: alternar(estado.combustibles, c) }, { replace: true })}>
                      {ETIQUETA_COMBUSTIBLE[c]}
                    </Chip>
                  ))}
                </div>
                <p className="eyebrow mb-2 mt-3">Marca</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['todas', 'Todas'],
                      ['tradicional', 'Tradicionales'],
                      ['nueva', 'Recién llegadas'],
                    ] as [Estado['tipoMarca'], string][]
                  ).map(([v, l]) => (
                    <Chip key={v} on={estado.tipoMarca === v} onClick={() => set({ tipoMarca: v }, { replace: true })}>
                      {l}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => set({ segmentos: [], combustibles: [], tipoMarca: 'todas', orden: 'match' }, { replace: true })}>
                  <RotateCcw className="size-4" aria-hidden />
                  Limpiar filtros
                </button>
              </div>
            </Container>
          </div>
        )}
      </div>

      <Container className="py-8">
        {r.relajados.length > 0 && (
          <p className="mb-6 rounded-md border border-warn bg-warn-soft px-4 py-3 text-sm" role="status">
            Con todo lo que pediste no quedaba nada. Dejamos de lado{' '}
            <strong>{r.relajados.map((q) => REQUISITOS.find((x) => x.id === q)!.label.toLowerCase()).join(' y ')}</strong> para
            mostrarte lo más parecido.
          </p>
        )}

        {r.entran.length > 0 ? (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow">
                  {r.entran.length} {r.entran.length === 1 ? 'auto entra' : 'autos entran'} con {formatMillones(r.total)}
                </p>
                <h1 className="mt-1 text-3xl md:text-4xl">Lo que te conviene</h1>
              </div>
              <DatosEjemplo />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.entran.map((x, i) => (
                <ModeloCard key={x.modelo.id} modelo={x.modelo} motivo={x.motivo} eager={i < 3} />
              ))}
            </div>
          </section>
        ) : (
          <section className="card p-6">
            <p className="eyebrow">Con {formatMillones(r.total)}</p>
            <h1 className="mt-1 text-3xl md:text-4xl">No entra ningún 0km así, pero estás cerca</h1>
            <p className="mt-2 max-w-xl text-soft">
              Abajo van los que quedan justo por arriba y por abajo de tu número. Un poco más de usado o unas cuotas suelen
              cerrar la diferencia.
            </p>
          </section>
        )}

        {r.arriba.length > 0 && (
          <section className="mt-12">
            <p className="eyebrow">Estirando un poco</p>
            <h2 className="mt-1 text-3xl md:text-4xl">Por {formatUSD(r.saltoArriba)} más entrás a estos</h2>
            <p className="mt-1 text-soft">
              Unos {formatMillones(r.saltoArriba)} arriba de tu presupuesto. Los ordenamos por lo cerca que quedan.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.arriba.map((x) => (
                <ModeloCard key={x.modelo.id} modelo={x.modelo} motivo={x.motivo} />
              ))}
            </div>
          </section>
        )}

        {r.abajo.length > 0 && (
          <section className="mt-12">
            <p className="eyebrow">Por abajo</p>
            <h2 className="mt-1 text-3xl md:text-4xl">Lo más cercano que sí entra</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {r.abajo.map((x) => (
                <ModeloCard key={x.modelo.id} modelo={x.modelo} motivo={x.motivo} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-sm text-soft">
          Los resultados se ordenan por match con lo que pediste, reventa de la marca, opiniones de dueños y La Posta. Nunca
          por lo que pague una marca.
        </p>
      </Container>
    </>
  )
}

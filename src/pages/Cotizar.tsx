import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { formatMillones, indicePorMarca, marcasOrdenadas, marcasPorId, modelosALaVenta } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container } from '../components/ui'

const ANIOS = Array.from({ length: 16 }, (_, i) => 2026 - i)
const ESTADOS = ['Impecable', 'Muy bueno', 'Bueno', 'Para arreglar'] as const
const CONTACTO = ['Mail', 'WhatsApp', 'Teléfono'] as const

type Datos = {
  marca: string
  modelo: string
  anio: number
  km: string
  estado: (typeof ESTADOS)[number]
  buscando: string
  presupuesto: number
  nombre: string
  contacto: (typeof CONTACTO)[number]
  dato: string
}

const INICIAL: Datos = {
  marca: '',
  modelo: '',
  anio: 2020,
  km: '',
  estado: 'Muy bueno',
  buscando: '',
  presupuesto: 40_000_000,
  nombre: '',
  contacto: 'Mail',
  dato: '',
}

const PASOS = ['Qué auto tenés', 'Qué buscás', 'Cómo te contactamos'] as const

export default function Cotizar() {
  useTitle('Cotizar mi usado')
  const [paso, setPaso] = useState(0)
  const [d, setD] = useState<Datos>(INICIAL)
  const [listo, setListo] = useState(false)

  const set = <K extends keyof Datos>(k: K, v: Datos[K]) => setD((p) => ({ ...p, [k]: v }))

  const modelosDeLaMarca = useMemo(
    () => (d.marca ? modelosALaVenta.filter((m) => m.marcaId === d.marca).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) : []),
    [d.marca],
  )

  /** Estimación propia a partir del índice de reventa. Es una referencia, no una oferta. */
  const estimado = useMemo(() => {
    const m = modelosALaVenta.find((x) => x.slug === d.modelo)
    if (!m) return null
    const idx = indicePorMarca[m.marcaId]
    const anios = Math.max(0, 2026 - d.anio)
    const r12 = idx?.retencion12m ?? 80
    const r36 = idx?.retencion36m ?? r12 - 18
    const porAnio = (r12 - r36) / 2
    const retencion = Math.max(18, anios === 0 ? 100 : r12 - porAnio * (anios - 1))
    const ajusteEstado = d.estado === 'Impecable' ? 1.05 : d.estado === 'Muy bueno' ? 1 : d.estado === 'Bueno' ? 0.94 : 0.82
    const km = Number(d.km.replace(/\D/g, '')) || anios * 15000
    const ajusteKm = km > anios * 20000 ? 0.93 : km < anios * 8000 ? 1.04 : 1
    const base = m.precioCalleARS * (retencion / 100) * ajusteEstado * ajusteKm
    return { min: Math.round(base * 0.93), max: Math.round(base * 1.05), retencion: Math.round(retencion), modelo: m }
  }, [d.modelo, d.anio, d.estado, d.km])

  if (listo) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-2 eyebrow">
            <Check className="size-4 text-ok" aria-hidden />
            Resumen guardado
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl">Listo, {d.nombre.split(' ')[0] || 'gracias'}</h1>
          <p className="mt-3 text-lg text-soft">
            Esto es lo que cargaste. No mandamos tus datos a ninguna concesionaria ni los vendemos: esta pantalla es un
            resumen para vos.
          </p>

          <div className="card mt-8 p-5 md:p-6">
            <p className="eyebrow">Tu auto</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {marcasPorId[d.marca]?.nombre} {modelosALaVenta.find((m) => m.slug === d.modelo)?.nombre} {d.anio}
            </p>
            <p className="tabular text-soft">
              {d.km ? `${Number(d.km).toLocaleString('es-AR')} km` : 'Kilómetros sin cargar'} · Estado: {d.estado}
            </p>

            {estimado && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="eyebrow">Referencia según nuestro índice de reventa</p>
                <p className="tabular mt-1 font-display text-4xl font-black leading-none">
                  {formatMillones(estimado.min)} a {formatMillones(estimado.max)}
                </p>
                <p className="mt-2 text-sm text-soft">
                  Sale de aplicar la retención medida de la marca ({estimado.retencion}% para un auto de {2026 - d.anio}{' '}
                  {2026 - d.anio === 1 ? 'año' : 'años'}) sobre el precio de calle del 0km equivalente, ajustada por estado y
                  kilómetros. Es una referencia para que no te agarren desprevenido, no una oferta de compra.
                </p>
                <Link to="/reventa" className="mt-3 inline-block text-sm font-semibold hover:text-accent">
                  Ver cómo calculamos el índice
                </Link>
              </div>
            )}

            <div className="mt-5 border-t border-border pt-5">
              <p className="eyebrow">Qué estás buscando</p>
              <p className="mt-1">{d.buscando || 'Sin definir'}</p>
              <p className="tabular text-soft">Presupuesto: {formatMillones(d.presupuesto)}</p>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <p className="eyebrow">Contacto</p>
              <p className="mt-1">
                {d.nombre} · prefiere {d.contacto.toLowerCase()}
                {d.dato ? ` (${d.dato})` : ''}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/buscar?p=${d.presupuesto + (estimado?.min ?? 0)}&u=${estimado?.min ?? 0}&paso=2`} className="btn btn-primary">
              Ver qué me compro con eso
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setListo(false)
                setPaso(0)
                setD(INICIAL)
              }}
            >
              Empezar de nuevo
            </button>
          </div>
        </div>
      </Container>
    )
  }

  const puedeSeguir = paso === 0 ? Boolean(d.marca && d.modelo) : paso === 1 ? true : Boolean(d.nombre)

  return (
    <Container className="py-10 md:py-12">
      <div className="mx-auto max-w-2xl">
        <ol className="mb-10 grid grid-cols-3 gap-2" aria-label="Pasos">
          {PASOS.map((p, i) => (
            <li key={p}>
              <button
                type="button"
                disabled={i > paso}
                onClick={() => setPaso(i)}
                className={`w-full border-t-2 pt-3 text-left transition-colors ${
                  i === paso ? 'border-accent' : i < paso ? 'border-text hover:border-accent' : 'border-border'
                }`}
                aria-current={i === paso ? 'step' : undefined}
              >
                <span className={`eyebrow ${i === paso ? 'text-accent' : ''}`}>{i + 1}.</span>
                <span className={`block text-sm ${i <= paso ? 'text-text' : 'text-soft'}`}>{p}</span>
              </button>
            </li>
          ))}
        </ol>

        {paso === 0 && (
          <div className="paso-in">
            <p className="eyebrow">Paso 1 de 3</p>
            <h1 className="mt-2 text-4xl md:text-5xl">¿Qué auto tenés?</h1>
            <div className="card mt-6 space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-marca" className="text-sm font-medium text-soft">
                    Marca
                  </label>
                  <div className="relative mt-1">
                    <select id="c-marca" className="field" value={d.marca} onChange={(e) => setD((p) => ({ ...p, marca: e.target.value, modelo: '' }))}>
                      <option value="">Elegí</option>
                      {marcasOrdenadas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-modelo" className="text-sm font-medium text-soft">
                    Modelo
                  </label>
                  <div className="relative mt-1">
                    <select id="c-modelo" className="field" value={d.modelo} onChange={(e) => set('modelo', e.target.value)} disabled={!d.marca}>
                      <option value="">{d.marca ? 'Elegí' : 'Primero la marca'}</option>
                      {modelosDeLaMarca.map((m) => (
                        <option key={m.slug} value={m.slug}>
                          {m.nombre} {m.version}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-anio" className="text-sm font-medium text-soft">
                    Año
                  </label>
                  <div className="relative mt-1">
                    <select id="c-anio" className="field" value={d.anio} onChange={(e) => set('anio', Number(e.target.value))}>
                      {ANIOS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-km" className="text-sm font-medium text-soft">
                    Kilómetros
                  </label>
                  <input id="c-km" inputMode="numeric" className="field mt-1" placeholder="ej. 62000" value={d.km} onChange={(e) => set('km', e.target.value.replace(/\D/g, '').slice(0, 7))} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-soft">Estado general</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {ESTADOS.map((e) => (
                    <Chip key={e} on={d.estado === e} onClick={() => set('estado', e)}>
                      {e}
                    </Chip>
                  ))}
                </div>
              </div>
              {estimado && (
                <p className="tabular rounded-sm bg-surface-2 p-3 text-sm" aria-live="polite">
                  Referencia de nuestro índice:{' '}
                  <strong>
                    {formatMillones(estimado.min)} a {formatMillones(estimado.max)}
                  </strong>
                  . Es una estimación propia, no una oferta.
                </p>
              )}
            </div>
          </div>
        )}

        {paso === 1 && (
          <div className="paso-in">
            <p className="eyebrow">Paso 2 de 3</p>
            <h1 className="mt-2 text-4xl md:text-5xl">¿Qué estás buscando?</h1>
            <div className="card mt-6 space-y-5 p-5">
              <div>
                <label htmlFor="c-buscando" className="text-sm font-medium text-soft">
                  Qué querés comprar
                </label>
                <textarea
                  id="c-buscando"
                  rows={3}
                  className="field mt-1"
                  placeholder="ej. un SUV chico automático, para ciudad, que no gaste mucho"
                  value={d.buscando}
                  onChange={(e) => set('buscando', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="c-presu" className="flex items-baseline justify-between text-sm font-medium text-soft">
                  Presupuesto además de tu usado
                  <output className="tabular font-display text-xl font-bold text-text">{formatMillones(d.presupuesto)}</output>
                </label>
                <input
                  id="c-presu"
                  type="range"
                  min={0}
                  max={120_000_000}
                  step={500_000}
                  value={d.presupuesto}
                  onChange={(e) => set('presupuesto', Number(e.target.value))}
                  className="range"
                  style={{ ['--pct' as string]: `${(d.presupuesto / 120_000_000) * 100}%` }}
                />
                {estimado && (
                  <p className="tabular text-sm text-soft">
                    Con tu usado, tendrías cerca de{' '}
                    <strong className="text-text">{formatMillones(d.presupuesto + estimado.min)}</strong>.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="paso-in">
            <p className="eyebrow">Paso 3 de 3</p>
            <h1 className="mt-2 text-4xl md:text-5xl">¿Cómo te contactamos?</h1>
            <p className="mt-3 text-soft">No hay backend: esto queda en tu pantalla. No mandamos tus datos a nadie.</p>
            <div className="card mt-6 space-y-4 p-5">
              <div>
                <label htmlFor="c-nombre" className="text-sm font-medium text-soft">
                  Tu nombre
                </label>
                <input id="c-nombre" className="field mt-1" placeholder="Nombre y apellido" value={d.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </div>
              <div>
                <p className="text-sm font-medium text-soft">Por dónde preferís</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {CONTACTO.map((c) => (
                    <Chip key={c} on={d.contacto === c} onClick={() => set('contacto', c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="c-dato" className="text-sm font-medium text-soft">
                  {d.contacto === 'Mail' ? 'Tu mail' : 'Tu número'} <span className="text-xs">(opcional)</span>
                </label>
                <input id="c-dato" className="field mt-1" placeholder={d.contacto === 'Mail' ? 'tu@mail.com' : '11 5555 5555'} value={d.dato} onChange={(e) => set('dato', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="btn btn-ghost" onClick={() => setPaso((p) => Math.max(0, p - 1))} disabled={paso === 0}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!puedeSeguir}
            onClick={() => (paso === 2 ? setListo(true) : setPaso((p) => p + 1))}
          >
            {paso === 2 ? 'Ver mi resumen' : 'Siguiente'}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </Container>
  )
}

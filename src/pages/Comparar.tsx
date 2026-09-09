import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Plus, X } from 'lucide-react'
import type { Dimensiones, Modelo } from '../types'
import {
  ETIQUETA_COMBUSTIBLE,
  ETIQUETA_SEGMENTO,
  formatARS,
  formatMillones,
  formatNumero,
  indicePorMarca,
  marcasPorId,
  modelos,
  modelosPorId,
  posventaPorMarca,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container, Img } from '../components/ui'
import { encajeDe, etiquetaDe } from '../lib/encaje'
import { BarraDimension } from '../components/ficha/Opiniones'

const MAX = 3

type FilaDef = {
  k: string
  get: (m: Modelo) => string
  /** 'alto' = más es mejor, 'bajo' = menos es mejor */
  mejor?: 'alto' | 'bajo'
  num?: (m: Modelo) => number | null
}

const FILAS: { grupo: string; filas: FilaDef[] }[] = [
  {
    grupo: 'Precio',
    filas: [
      { k: 'Precio de calle', get: (m) => formatARS(m.precioCalleARS), num: (m) => m.precioCalleARS, mejor: 'bajo' },
      { k: 'Precio de lista', get: (m) => formatARS(m.precioListaARS) },
      {
        k: 'Diferencia sobre lista',
        get: (m) => {
          const d = m.precioCalleARS - m.precioListaARS
          return d > 0 ? `+${formatMillones(d)}` : d < 0 ? `−${formatMillones(-d)}` : 'Sin diferencia'
        },
      },
    ],
  },
  {
    grupo: 'Mecánica',
    filas: [
      { k: 'Motor', get: (m) => m.motor },
      { k: 'Combustible', get: (m) => ETIQUETA_COMBUSTIBLE[m.combustible] },
      { k: 'Transmisión', get: (m) => (m.transmision === 'automatica' ? 'Automática' : 'Manual') },
      { k: 'Tracción', get: (m) => m.traccion.toUpperCase() },
      { k: 'Consumo cada 100 km', get: (m) => `${m.consumoLitros100km.toLocaleString('es-AR')} ${m.combustible === 'electrico' ? 'kWh/10' : 'L'}`, num: (m) => m.consumoLitros100km, mejor: 'bajo' },
    ],
  },
  {
    grupo: 'Espacio',
    filas: [
      { k: 'Segmento', get: (m) => ETIQUETA_SEGMENTO[m.segmento] },
      { k: 'Baúl', get: (m) => `${formatNumero(m.baulLitros)} L`, num: (m) => m.baulLitros, mejor: 'alto' },
      { k: 'Plazas', get: (m) => String(m.plazas), num: (m) => m.plazas, mejor: 'alto' },
      { k: 'Puertas', get: (m) => String(m.puertas) },
    ],
  },
  {
    grupo: 'Comprarlo y tenerlo',
    filas: [
      { k: 'Entrega', get: (m) => `${m.entregaDias} días`, num: (m) => m.entregaDias, mejor: 'bajo' },
      { k: 'Service oficial', get: (m) => formatARS(m.posventa.costoServiceARS), num: (m) => m.posventa.costoServiceARS, mejor: 'bajo' },
      { k: 'Service cada', get: (m) => `${formatNumero(m.posventa.intervaloKm)} km`, num: (m) => m.posventa.intervaloKm, mejor: 'alto' },
      {
        k: 'Garantía',
        get: (m) => {
          const mm = marcasPorId[m.marcaId]
          return `${mm.garantiaAnios} años / ${formatNumero(mm.garantiaKm)} km`
        },
        num: (m) => marcasPorId[m.marcaId].garantiaAnios,
        mejor: 'alto',
      },
      { k: 'Talleres oficiales', get: (m) => String(marcasPorId[m.marcaId].talleresOficiales), num: (m) => marcasPorId[m.marcaId].talleresOficiales, mejor: 'alto' },
      {
        k: 'Repuesto común (medido)',
        get: (m) => {
          const p = posventaPorMarca[m.marcaId]
          return p?.diasRepuestoComun != null ? `${p.diasRepuestoComun} días` : 'Sin dato'
        },
        num: (m) => posventaPorMarca[m.marcaId]?.diasRepuestoComun ?? null,
        mejor: 'bajo',
      },
      {
        k: 'Reventa a 12 meses',
        get: (m) => {
          const i = indicePorMarca[m.marcaId]
          return i?.retencion12m != null ? `${i.retencion12m}%` : 'Sin dato'
        },
        num: (m) => indicePorMarca[m.marcaId]?.retencion12m ?? null,
        mejor: 'alto',
      },
      {
        k: 'Reventa a 36 meses',
        get: (m) => {
          const i = indicePorMarca[m.marcaId]
          return i?.retencion36m != null ? `${i.retencion36m}%` : 'Sin dato'
        },
        num: (m) => indicePorMarca[m.marcaId]?.retencion36m ?? null,
        mejor: 'alto',
      },
    ],
  },
]

const DIMS: [keyof Dimensiones, string][] = [
  ['andar', 'Andar'],
  ['consumo', 'Consumo'],
  ['posventa', 'Posventa'],
  ['calidad', 'Calidad percibida'],
]

function Selector({ excluir, onElegir }: { excluir: string[]; onElegir: (slug: string) => void }) {
  const ordenados = useMemo(() => [...modelos].sort((a, b) => `${marcasPorId[a.marcaId].nombre} ${a.nombre}`.localeCompare(`${marcasPorId[b.marcaId].nombre} ${b.nombre}`, 'es')), [])
  return (
    <div className="card flex min-h-[260px] flex-col items-center justify-center gap-3 border-dashed p-5 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-2 text-soft">
        <Plus className="size-5" aria-hidden />
      </span>
      <p className="font-semibold">Sumá otro auto</p>
      <div className="relative w-full">
        <label htmlFor={`sel-${excluir.length}`} className="sr-only">
          Elegir modelo para comparar
        </label>
        <select id={`sel-${excluir.length}`} className="field" defaultValue="" onChange={(e) => e.target.value && onElegir(e.target.value)}>
          <option value="" disabled>
            Elegí un modelo
          </option>
          {ordenados
            .filter((m) => !excluir.includes(m.slug))
            .map((m) => (
              <option key={m.slug} value={m.slug}>
                {marcasPorId[m.marcaId].nombre} {m.nombre} {m.version}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
      </div>
    </div>
  )
}

export default function Comparar() {
  useTitle('Comparar')
  const [params, setParams] = useSearchParams()
  const slugs = (params.get('m') ?? '').split(',').filter((s) => modelosPorId[s]).slice(0, MAX)
  const elegidos = slugs.map((s) => modelosPorId[s])

  const set = (nuevos: string[]) => {
    const q = new URLSearchParams()
    if (nuevos.length) q.set('m', nuevos.join(','))
    setParams(q)
  }

  const columnas = Math.max(elegidos.length, 1)

  return (
    <Container className="py-10">
      <p className="eyebrow">Sin registro, sin fricción</p>
      <h1 className="mt-2 text-4xl md:text-6xl">Comparar</h1>
      <p className="mt-3 max-w-2xl text-lg text-soft">
        Hasta tres autos lado a lado. Los indicadores quedan alineados en la misma fila y marcamos en verde el mejor de cada
        una.
      </p>

      <div className="scroll-x mt-8">
        <div className="cmp-wrap" style={{ ['--cols' as string]: String(elegidos.length < MAX ? columnas + 1 : columnas) }}>
          {/* Cabeceras */}
          <div className="cmp-grid items-stretch">
            <div />
            {elegidos.map((m) => {
              const marca = marcasPorId[m.marcaId]
              return (
                <article key={m.slug} className="card overflow-hidden">
                  <div className="relative">
                    <Link to={`/modelos/${m.slug}`} className="card-img block aspect-[16/10]">
                      <Img src={m.fotos[0].url} alt={m.fotos[0].alt} width={m.fotos[0].width} height={m.fotos[0].height} eager />
                    </Link>
                    <button
                      type="button"
                      onClick={() => set(slugs.filter((s) => s !== m.slug))}
                      className="absolute right-2 top-2 rounded-full border border-border bg-bg/85 p-1.5 backdrop-blur hover:bg-bg"
                      aria-label={`Sacar ${marca.nombre} ${m.nombre} de la comparación`}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="eyebrow truncate">{marca.nombre}</p>
                    <Link to={`/modelos/${m.slug}`} className="mt-0.5 block font-display text-xl font-bold leading-tight hover:text-accent">
                      {m.nombre}
                    </Link>
                    <p className="truncate text-sm text-soft">{m.version}</p>
                    <p className="badge badge-neutral mt-2 whitespace-normal leading-tight">{etiquetaDe(m)}</p>
                  </div>
                </article>
              )
            })}
            {elegidos.length < MAX && <Selector excluir={slugs} onElegir={(s) => set([...slugs, s])} />}
          </div>

          {elegidos.length > 0 && (
            <>
              {FILAS.map((g) => (
                <section key={g.grupo} className="mt-8">
                  <h2 className="mb-2 border-b border-border pb-2 text-xl">{g.grupo}</h2>
                  <dl>
                    {g.filas.map((f) => {
                      const nums = f.num ? elegidos.map(f.num) : []
                      const validos = nums.filter((n): n is number => n != null)
                      const objetivo = f.mejor === 'alto' ? Math.max(...validos) : Math.min(...validos)
                      const hayGanador = f.mejor && validos.length > 1 && new Set(validos).size > 1
                      return (
                        <div
                          key={f.k}
                          className="cmp-grid border-b border-border py-2.5 last:border-0"
                        >
                          <dt className="text-sm text-soft">{f.k}</dt>
                          {elegidos.map((m, i) => {
                            const esMejor = hayGanador && nums[i] === objetivo
                            return (
                              <dd key={m.slug} className={`tabular text-sm ${esMejor ? 'font-semibold text-ok' : ''}`}>
                                {f.get(m)}
                                {esMejor && <span className="sr-only"> (el mejor de la fila)</span>}
                              </dd>
                            )
                          })}
                        </div>
                      )
                    })}
                  </dl>
                </section>
              ))}

              <section className="mt-8">
                <h2 className="mb-2 border-b border-border pb-2 text-xl">Opiniones de dueños</h2>
                <div className="cmp-grid items-start border-b border-border py-3">
                  <p className="text-sm text-soft">Promedio general</p>
                  {elegidos.map((m) => (
                    <p key={m.slug} className="tabular font-display text-3xl font-black leading-none">
                      {m.opinionesResumen.promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      <span className="ml-1 text-sm font-normal text-soft">de {m.opinionesResumen.cantidad}</span>
                    </p>
                  ))}
                </div>
                {DIMS.map(([k, label]) => (
                  <div key={k} className="cmp-grid border-b border-border py-2.5 last:border-0">
                    <p className="text-sm text-soft">{label}</p>
                    {elegidos.map((m) => (
                      <div key={m.slug}>
                        <BarraDimension label="" valor={m.opinionesResumen.dimensiones[k]} />
                      </div>
                    ))}
                  </div>
                ))}
              </section>

              <section className="mt-8">
                <h2 className="mb-2 border-b border-border pb-2 text-xl">Para quién es cada uno</h2>
                <div className="cmp-grid items-start border-b border-border py-3">
                  <p className="text-sm text-soft">Te sirve si</p>
                  {elegidos.map((m) => (
                    <ul key={m.slug} className="space-y-1.5 text-sm leading-snug">
                      {encajeDe(m).aFavor.map((t) => (
                        <li key={t} className="flex gap-2">
                          <span className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-ok" aria-hidden />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
                <div className="cmp-grid items-start py-3">
                  <p className="text-sm text-soft">Buscá otra si</p>
                  {elegidos.map((m) => (
                    <ul key={m.slug} className="space-y-1.5 text-sm leading-snug">
                      {encajeDe(m).enContra.map((t) => (
                        <li key={t} className="flex gap-2">
                          <span className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-bad" aria-hidden />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {elegidos.length === 0 && (
        <p className="mt-6 text-soft">
          Elegí un modelo arriba, o entrá a cualquier ficha y usá el botón de comparar contra sus rivales.
        </p>
      )}

      <p className="mt-8 text-xs text-soft">
        Datos de ejemplo. La reventa y la demora de repuestos salen de nuestras propias mediciones:{' '}
        <Link to="/reventa" className="font-semibold hover:text-accent">
          índice de reventa
        </Link>{' '}
        y{' '}
        <Link to="/posventa" className="font-semibold hover:text-accent">
          relevamiento de posventa
        </Link>
        .
      </p>
    </Container>
  )
}

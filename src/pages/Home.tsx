import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Megaphone, PhoneCall, TrendingDown } from 'lucide-react'
import {
  ETIQUETA_TIPO_EVENTO,
  FECHA_CORTE,
  eventosCalendario,
  formatFecha,
  formatMillones,
  indicePorMarca,
  indiceReventaModelos,
  marcasOrdenadas,
  marcasPorId,
  masMirados,
  modelos,
  modelosALaVenta,
  modelosProximos,
  modelosPorId,
  novedades,
  patrocinios,
  promedioReventa12m,
} from '../data'
import { useMoneda } from '../hooks/monedaContexto'
import { useTitle } from '../hooks/useTitle'
import { Container, DatosEjemplo, Img, SectionHead } from '../components/ui'
import { MarcasGrid } from '../components/marca/MarcasGrid'
import { ModeloCard } from '../components/modelo/ModeloCard'

const MIN = 20_000_000
const MAX = 140_000_000

/** Notas con foto que pasó la curaduría. La portada no usa otra cosa. */
const NOTAS_CON_FOTO = novedades.filter((n) => n.imagen && !n.imagen.endsWith('.svg'))
/** Llegadas confirmadas con foto real. Sin foto la card promete algo que no muestra. */
const PROXIMOS = modelosProximos.filter((m) => !m.fotos[0].esIlustracion).slice(0, 4)

/**
 * El buscador por presupuesto: primero, ancho completo. Es la pregunta con la
 * que llega la mayoría y la razón de ser del sitio.
 */
function Buscador() {
  const navigate = useNavigate()
  const [monto, setMonto] = useState(38_000_000)
  const [usado, setUsado] = useState('')
  // Igual que en el buscador: se tipea en la unidad de la moneda elegida.
  const { moneda, dolar } = useMoneda()
  const unidad = moneda === 'USD' ? dolar.valor * 1000 : 1_000_000
  const usadoNum = Number(usado.replace(/\D/g, '')) * unidad || 0
  const total = monto + usadoNum
  const entran = useMemo(() => modelosALaVenta.filter((m) => m.precioCalleARS <= total).length, [total])
  const pct = ((monto - MIN) / (MAX - MIN)) * 100

  const ir = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams({ p: String(monto), paso: '2' })
    if (usadoNum) q.set('u', String(usadoNum))
    navigate(`/buscar?${q.toString()}`)
  }

  return (
    <section className="grid-lines border-b border-border">
      <Container className="py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <p className="eyebrow">Empezá por lo que importa</p>
            <h1 className="mt-2 text-4xl leading-[0.95] md:text-6xl">
              ¿Cuánto podés
              <br />
              poner?
            </h1>
            <p className="mt-4 max-w-md text-lg text-soft">
              Todos los 0km que se venden en Argentina, ordenados por lo que te conviene a vos. Sin registro y sin catálogo
              infinito.
            </p>
          </div>

          <form onSubmit={ir}>
            <label htmlFor="home-monto" className="text-sm font-medium text-soft">
              Tenés para poner
            </label>
            <output htmlFor="home-monto" className="tabular mt-1 block font-display text-6xl font-black leading-none md:text-8xl">
              {formatMillones(monto)}
            </output>
            <input
              id="home-monto"
              type="range"
              min={MIN}
              max={MAX}
              step={500_000}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="range mt-5"
              style={{ ['--pct' as string]: `${pct}%` }}
              aria-valuetext={formatMillones(monto)}
            />
            <div className="tabular flex justify-between text-xs text-soft">
              <span>{formatMillones(MIN)}</span>
              <span>{formatMillones(MAX)}+</span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="home-usado" className="text-sm font-medium text-soft">
                  Entrego mi usado por <span className="text-xs">(opcional, en {moneda === 'USD' ? 'miles' : 'millones'})</span>
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-soft">{moneda === 'USD' ? 'US$' : '$'}</span>
                  <input
                    id="home-usado"
                    inputMode="numeric"
                    placeholder={moneda === 'USD' ? 'ej. 8' : 'ej. 12'}
                    value={usado}
                    onChange={(e) => setUsado(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                    className={`field pr-10 ${moneda === 'USD' ? 'pl-12' : 'pl-7'}`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-soft">{moneda === 'USD' ? 'mil' : 'M'}</span>
                </div>
              </div>
              <button type="submit" className="btn btn-primary h-[46px]">
                Ver qué me conviene
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>

            <p className="tabular mt-4 text-lg" aria-live="polite">
              Entran{' '}
              <strong className="font-display text-2xl font-black">
                {entran} de {modelosALaVenta.length}
              </strong>{' '}
              <span className="text-soft">modelos 0km a la venta hoy</span>
              {usadoNum > 0 && <span className="text-soft"> con {formatMillones(total)} en total</span>}.
            </p>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-soft">
          {['Todas las marcas del mercado', 'Opiniones de dueños, no de prensa', 'No cobramos de marcas ni importadores'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-ok" aria-hidden />
              {t}
            </span>
          ))}
          <DatosEjemplo className="ml-auto" />
        </div>
      </Container>
    </section>
  )
}

/** El índice, como franja de un solo dato fuerte. Excelente, pero no la puerta. */
function FranjaIndice() {
  const chinos = indiceReventaModelos.filter((i) => {
    const m = modelosPorId[i.modeloSlug]
    return m && marcasPorId[m.marcaId].origen === 'china' && i.retencion12m != null
  })
  const peor = [...chinos].sort((a, b) => (a.retencion12m ?? 0) - (b.retencion12m ?? 0))[0]
  const modeloPeor = peor ? modelosPorId[peor.modeloSlug] : null
  const sinDato = marcasOrdenadas.filter((m) => indicePorMarca[m.id]?.retencion12m == null).length

  return (
    <section className="border-b border-border bg-surface">
      <Container className="flex flex-wrap items-center gap-x-10 gap-y-5 py-7">
        <div className="flex items-center gap-4">
          <TrendingDown className="size-7 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="eyebrow">Índice de reventa · corte de {formatFecha(FECHA_CORTE)}</p>
            <p className="tabular font-display text-3xl font-black leading-none md:text-4xl">
              {modeloPeor ? `−${100 - (peor.retencion12m ?? 0)}%` : `${promedioReventa12m}%`}
              <span className="ml-2 font-body text-base font-normal text-soft">
                {modeloPeor
                  ? `pierde en un año el ${marcasPorId[modeloPeor.marcaId].nombre} ${modeloPeor.nombre}`
                  : 'retiene el mercado a 12 meses'}
              </span>
            </p>
          </div>
        </div>
        <p className="max-w-md text-sm text-soft">
          Nadie más mide esto en Argentina. Publicamos el número con su muestra y su método, y decimos cuáles son las{' '}
          {sinDato} marcas que todavía no se pueden medir.
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link to="/reventa" className="btn btn-primary btn-sm">
            Ver el índice
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link to="/posventa" className="btn btn-ghost btn-sm">
            <PhoneCall className="size-4" aria-hidden />
            Posventa medida
          </Link>
        </div>
      </Container>
    </section>
  )
}

/**
 * Portada editorial. Solo usa fotos que pasaron la curaduría; si no hay
 * ninguna, va como card de texto con la tipografía grande, que se ve mucho
 * mejor que una foto mala.
 */
function Portada() {
  const principal = NOTAS_CON_FOTO[0] ?? novedades[0]
  const hayFoto = NOTAS_CON_FOTO.length > 0
  const resto = novedades.filter((n) => n.id !== principal.id).slice(0, 3)

  return (
    <Container className="mt-12">
      <SectionHead eyebrow="Lo último" titulo="Novedades" accion={{ to: '/novedades', label: 'Todas las notas' }} />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {hayFoto ? (
          <article className="card card-link overflow-hidden">
            <Link to={`/novedades/${principal.slug}`} className="card-img block aspect-[16/10]">
              <Img
                src={principal.imagen}
                alt=""
                width={principal.imagenWidth}
                height={principal.imagenHeight}
                eager
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="p-5 md:p-6">
              <p className="eyebrow">
                {principal.categoria} · {formatFecha(principal.fecha)}
              </p>
              <h3 className="mt-2 text-3xl leading-[1.02] md:text-4xl">
                <Link to={`/novedades/${principal.slug}`} className="hover:text-accent">
                  {principal.titulo}
                </Link>
              </h3>
              <p className="mt-3 text-lg text-soft">{principal.bajada}</p>
            </div>
          </article>
        ) : (
          <article className="card flex flex-col justify-center border-l-4 p-6 md:p-10" style={{ borderLeftColor: 'var(--accent)' }}>
            <p className="eyebrow">
              {principal.categoria} · {formatFecha(principal.fecha)}
            </p>
            <h3 className="mt-3 text-4xl leading-[0.98] md:text-6xl">
              <Link to={`/novedades/${principal.slug}`} className="hover:text-accent">
                {principal.titulo}
              </Link>
            </h3>
            <p className="mt-4 max-w-2xl text-lg text-soft">{principal.bajada}</p>
          </article>
        )}

        <div className="flex flex-col divide-y divide-border">
          {resto.map((n) => {
            const tieneFoto = !n.imagen.endsWith('.svg')
            return (
              <article key={n.id} className="group flex gap-4 py-4 first:pt-0 last:pb-0">
                {tieneFoto && (
                  <Link to={`/novedades/${n.slug}`} className="block w-28 shrink-0 overflow-hidden rounded-sm bg-skeleton md:w-36">
                    <Img src={n.imagen} alt="" width={n.imagenWidth} height={n.imagenHeight} className="h-full w-full object-cover" />
                  </Link>
                )}
                <div className="min-w-0">
                  <p className="eyebrow">{n.categoria}</p>
                  <h4 className="mt-1 text-lg leading-tight md:text-xl">
                    <Link to={`/novedades/${n.slug}`} className="group-hover:text-accent">
                      {n.titulo}
                    </Link>
                  </h4>
                  <p className="mt-1 text-xs text-soft">{formatFecha(n.fecha)}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Container>
  )
}

function Patrocinado() {
  const p = patrocinios.find((x) => modelosPorId[x.modeloSlug])
  if (!p) return null
  const modelo = modelosPorId[p.modeloSlug]
  const marca = marcasPorId[p.marcaId]
  const foto = modelo.fotos[1] ?? modelo.fotos[0]
  return (
    <aside className="card grid overflow-hidden md:grid-cols-[280px_1fr]" aria-label="Espacio patrocinado">
      <Link to={`/modelos/${modelo.slug}`} className="card-img block aspect-[16/10] md:aspect-auto">
        <Img src={foto.url} alt={foto.alt} width={foto.width} height={foto.height} className="h-full w-full object-cover" />
      </Link>
      <div className="flex flex-col justify-center p-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-soft">
          <Megaphone className="size-3.5" aria-hidden />
          Espacio patrocinado · {marca.nombre}
        </p>
        <h3 className="mt-2 text-2xl">{p.titulo}</h3>
        <p className="mt-1 text-soft">{p.texto}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to={`/modelos/${modelo.slug}`} className="btn btn-ghost btn-sm">
            Ver la ficha
          </Link>
          <Link to="/como-trabajamos" className="text-xs text-soft hover:text-text">
            La publicidad no cambia ni una línea de lo editorial
          </Link>
        </div>
      </div>
    </aside>
  )
}

function CapturaMail() {
  const [mail, setMail] = useState('')
  const [listo, setListo] = useState(false)
  return (
    <section className="card grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10">
      <div>
        <p className="eyebrow">Una vez por semana</p>
        <h2 className="mt-1 text-2xl md:text-3xl">El índice, los precios y lo que dicen los dueños</h2>
        <p className="mt-2 text-soft">Un mail corto los viernes. Sin spam y sin vender tu dirección a nadie.</p>
      </div>
      {listo ? (
        <p className="inline-flex items-center gap-2 text-lg font-semibold" role="status">
          <Check className="size-5 text-ok" aria-hidden />
          Listo, te llega el viernes.
        </p>
      ) : (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            setListo(true)
          }}
        >
          <label htmlFor="mail" className="sr-only">
            Tu mail
          </label>
          <input id="mail" type="email" required value={mail} onChange={(e) => setMail(e.target.value)} placeholder="tu@mail.com" className="field flex-1" />
          <button type="submit" className="btn btn-primary">
            Anotarme
          </button>
        </form>
      )}
    </section>
  )
}

export default function Home() {
  useTitle('')
  const proximos = [...eventosCalendario].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 5)
  const masNotas = novedades.slice(4, 10)

  return (
    <>
      <Buscador />
      <FranjaIndice />
      <Portada />

      <Container className="mt-12">
        <SectionHead
          eyebrow="Esta semana"
          titulo="Los más mirados"
          bajada="Las fichas que más se abrieron en los últimos siete días."
          accion={{ to: '/buscar', label: 'Buscar por presupuesto' }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {masMirados.map((m, i) => (
            <ModeloCard key={m.id} modelo={m} eager={i < 2} />
          ))}
        </div>
        <DatosEjemplo className="mt-4" />
      </Container>

      <Container className="mt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHead eyebrow="Calendario" titulo="Lo que se viene" accion={{ to: '/calendario', label: 'Ver todo' }} />
            <ol className="timeline space-y-5 pl-8">
              {proximos.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className={`timeline-dot -left-8 ${ev.estado === 'confirmado' ? 'ok' : 'warn'}`} aria-hidden />
                  <p className="tabular text-xs text-soft">
                    {ev.estado === 'confirmado' ? formatFecha(ev.fecha) : `${formatFecha(ev.fecha).replace(/^\d+ /, '')}, estimado`} ·{' '}
                    {ETIQUETA_TIPO_EVENTO[ev.tipo]}
                  </p>
                  <p className="font-semibold">{ev.titulo}</p>
                  <p className="text-sm text-soft">{ev.detalle}</p>
                </li>
              ))}
            </ol>
            <Link to="/calendario" className="btn btn-ghost btn-sm mt-6">
              <CalendarDays className="size-4" aria-hidden />
              Calendario completo
            </Link>
          </div>

          {PROXIMOS.length > 0 && (
            <div>
              <SectionHead
                eyebrow={`${modelosProximos.length} con llegada confirmada`}
                titulo="Los que se vienen"
                accion={{ to: '/calendario', label: 'Ver el calendario' }}
              />
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
                {PROXIMOS.map((m) => (
                  <li key={m.id}>
                    <Link to={`/modelos/${m.slug}`} className="card card-link block overflow-hidden">
                      <span className="card-img block aspect-[16/10]">
                        <Img
                          src={m.fotos[0].url}
                          alt={m.fotos[0].alt}
                          width={m.fotos[0].width}
                          height={m.fotos[0].height}
                          sizes="(max-width: 640px) 100vw, 320px"
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="block p-3">
                        <span className="badge badge-warn">Todavía no se vende</span>
                        <span className="mt-2 block font-display text-lg font-bold leading-tight">
                          {marcasPorId[m.marcaId].nombre} {m.nombre}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>

      <Container className="mt-12">
        <SectionHead eyebrow="Seguir leyendo" titulo="Más notas" accion={{ to: '/novedades', label: 'Todas' }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {masNotas.map((n) => {
            const tieneFoto = !n.imagen.endsWith('.svg')
            return (
              <Link key={n.id} to={`/novedades/${n.slug}`} className="card card-link overflow-hidden">
                {tieneFoto && (
                  <span className="card-img block aspect-[16/10]">
                    <Img src={n.imagen} alt="" width={n.imagenWidth} height={n.imagenHeight} className="h-full w-full object-cover" />
                  </span>
                )}
                <span className="block p-4">
                  <span className="eyebrow">
                    {n.categoria} · {formatFecha(n.fecha)}
                  </span>
                  <span className="mt-1 block font-display text-xl font-bold leading-tight">{n.titulo}</span>
                  <span className="mt-2 block text-sm text-soft">{n.bajada}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </Container>

      <Container className="mt-12">
        <Patrocinado />
      </Container>

      <Container className="mt-12">
        <SectionHead
          eyebrow="Todas, de la A a la Z"
          titulo="Buscar por marca"
          bajada={`Las ${marcasOrdenadas.length} marcas que venden 0km en Argentina hoy, con ${modelos.length} modelos publicados.`}
          accion={{ to: '/marcas', label: 'Ver hubs de marca' }}
        />
        <MarcasGrid marcas={marcasOrdenadas} />
      </Container>

      <Container className="mt-12">
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="eyebrow">Tenés uno para entregar</p>
            <h2 className="mt-1 text-2xl">Cotizá tu usado sin dar tu teléfono</h2>
          </div>
          <Link to="/cotizar" className="btn btn-ghost">
            Cotizar mi auto
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Container>

      <Container className="mt-12">
        <CapturaMail />
      </Container>
      <Container className="mt-12">
        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="eyebrow">Referencias de ACARA</p><h2 className="mt-1 text-2xl">Qué subió y qué bajó</h2><p className="mt-2 text-sm text-soft">Últimos cambios e historial de precios oficiales por versión.</p></div>
          <Link to="/precios" className="btn btn-ghost">Ver precios oficiales <ArrowUpRight className="size-4" aria-hidden /></Link>
        </div>
      </Container>
    </>
  )
}

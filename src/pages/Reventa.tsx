import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Info, TrendingDown } from 'lucide-react'
import {
  FECHA_CORTE,
  METODOLOGIA_REVENTA,
  MUESTRA_CHICA,
  formatFecha,
  indicePorMarca,
  indiceReventaModelos,
  marcasOrdenadas,
  marcasPorId,
  modelosPorId,
  promedioReventa12m,
  promedioReventa36m,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, SectionHead, LogoMarca} from '../components/ui'

type Orden = 'r12' | 'r36' | 'muestra' | 'nombre'
type Filtro = 'todas' | 'tradicional' | 'nueva'

/** Sparkline de la serie mensual. Sin librería: un path SVG. */
function Serie({ puntos }: { puntos: number[] }) {
  if (puntos.length < 2) return <span className="text-xs text-soft">—</span>
  const min = Math.min(...puntos)
  const max = Math.max(...puntos)
  const rango = max - min || 1
  const w = 64
  const h = 20
  const d = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (puntos.length - 1)) * w} ${h - ((p - min) / rango) * h}`)
    .join(' ')
  const sube = puntos[puntos.length - 1] >= puntos[0]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Tendencia: ${sube ? 'en alza' : 'en baja'}`} className="overflow-visible">
      <path d={d} fill="none" stroke={sube ? 'var(--ok)' : 'var(--bad)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Celda({ valor, promedio }: { valor: number | null; promedio: number }) {
  if (valor == null) return <span className="text-soft">Sin dato</span>
  const diff = valor - promedio
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-semibold">{valor}%</span>
      <span className={`text-xs ${diff >= 0 ? 'text-ok' : 'text-bad'}`}>
        {diff >= 0 ? '+' : ''}
        {diff}
      </span>
    </span>
  )
}

export default function Reventa() {
  useTitle('Índice de reventa')
  const [orden, setOrden] = useState<Orden>('r12')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const filas = useMemo(() => {
    const l = marcasOrdenadas
      .filter((m) => filtro === 'todas' || m.tipo === filtro)
      .map((m) => ({ marca: m, idx: indicePorMarca[m.id] }))
    const val = (v: number | null | undefined) => (v == null ? -1 : v)
    switch (orden) {
      case 'r36':
        return l.sort((a, b) => val(b.idx?.retencion36m) - val(a.idx?.retencion36m))
      case 'muestra':
        return l.sort((a, b) => (b.idx?.muestra ?? 0) - (a.idx?.muestra ?? 0))
      case 'nombre':
        return l.sort((a, b) => a.marca.nombre.localeCompare(b.marca.nombre, 'es'))
      default:
        return l.sort((a, b) => val(b.idx?.retencion12m) - val(a.idx?.retencion12m))
    }
  }, [orden, filtro])

  const sinDato = marcasOrdenadas.filter((m) => indicePorMarca[m.id]?.retencion12m == null)
  const nuevasConDato = marcasOrdenadas.filter((m) => m.tipo === 'nueva' && indicePorMarca[m.id]?.retencion12m != null)
  const modelosOrdenados = [...indiceReventaModelos].sort((a, b) => (b.retencion12m ?? 0) - (a.retencion12m ?? 0))

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-12">
          <p className="eyebrow">Producto propio · corte de {formatFecha(FECHA_CORTE)}</p>
          <h1 className="mt-2 max-w-4xl text-4xl leading-[0.95] md:text-6xl">
            Índice de reventa: cuánto vale tu auto dentro de un año
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-soft">
            En Argentina nadie mide de forma sistemática cuánto valor conserva cada marca, y menos todavía las que llegaron
            hace poco. Lo medimos nosotros, todos los meses, y publicamos el método y la muestra junto al número.
          </p>
          <dl className="tabular mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
            <div>
              <dt className="eyebrow">Promedio del mercado, 12 meses</dt>
              <dd className="font-display text-4xl font-black leading-none">{promedioReventa12m}%</dd>
            </div>
            <div>
              <dt className="eyebrow">Promedio, 36 meses</dt>
              <dd className="font-display text-4xl font-black leading-none">{promedioReventa36m}%</dd>
            </div>
            <div>
              <dt className="eyebrow">Marcas medidas</dt>
              <dd className="font-display text-4xl font-black leading-none">{marcasOrdenadas.length - sinDato.length}</dd>
              <p className="mt-1 text-xs text-soft">de {marcasOrdenadas.length}</p>
            </div>
            <div>
              <dt className="eyebrow">Sin muestra suficiente</dt>
              <dd className="font-display text-4xl font-black leading-none text-warn">{sinDato.length}</dd>
              <p className="mt-1 text-xs text-soft">no publicamos número</p>
            </div>
          </dl>
        </Container>
      </section>

      <Container className="py-10">
        <Link to="/precios" className="btn btn-ghost mb-6">Consultar referencias 0km de ACARA</Link>
        <details className="acc card">
          <summary className="flex items-center gap-4 p-5">
            <Info className="size-5 shrink-0 text-soft" aria-hidden />
            <span className="flex-1">
              <span className="block font-display text-2xl font-bold">Cómo lo medimos</span>
              <span className="mt-0.5 block text-sm text-soft">{METODOLOGIA_REVENTA.resumen}</span>
            </span>
            <ChevronDown className="acc-icon size-5 shrink-0 text-soft" aria-hidden />
          </summary>
          <div className="grid gap-8 border-t border-border p-5 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow">Paso a paso</p>
              <ol className="mt-2 space-y-2">
                {METODOLOGIA_REVENTA.pasos.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="tabular mt-0.5 shrink-0 font-semibold text-accent">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow">Lo que este índice no es</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-soft">
                {METODOLOGIA_REVENTA.limites.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="mt-4 rounded-sm bg-surface-2 p-3 text-sm">
                Publicamos este índice aunque incomode. Nuestros ingresos no vienen de las marcas ni de sus importadores,
                justamente para poder decir que una marca pierde 30% en un año.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            eyebrow="Todas las marcas del país"
            titulo="Retención de valor por marca"
            bajada="El número entre paréntesis es la diferencia contra el promedio del mercado. Verde: retiene más que el promedio."
            className="mb-0"
          />
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['todas', 'Todas'],
                ['tradicional', 'Tradicionales'],
                ['nueva', 'Recién llegadas'],
              ] as [Filtro, string][]
            ).map(([v, l]) => (
              <Chip key={v} on={filtro === v} onClick={() => setFiltro(v)}>
                {l}
              </Chip>
            ))}
            <div className="relative">
              <label htmlFor="orden-reventa" className="sr-only">
                Ordenar por
              </label>
              <select id="orden-reventa" value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="field rounded-full! py-[0.45rem]! pr-9! text-sm!">
                <option value="r12">Ordenar: retención 12 meses</option>
                <option value="r36">Retención 36 meses</option>
                <option value="muestra">Tamaño de muestra</option>
                <option value="nombre">Alfabético</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
            </div>
          </div>
        </div>

        <div className="scroll-x mt-5 card">
          <table className="w-full min-w-[820px] text-sm">
            <caption className="sr-only">Retención de valor por marca, corte de {formatFecha(FECHA_CORTE)}</caption>
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-soft">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Marca</th>
                <th scope="col" className="px-4 py-3 font-semibold">Origen</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">12 meses</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">24 meses</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">36 meses</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Muestra</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">6 meses</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border bg-surface-2/60">
                <th scope="row" className="px-4 py-2.5 text-left font-semibold">Promedio del mercado</th>
                <td className="px-4 py-2.5 text-soft">44 marcas</td>
                <td className="tabular px-4 py-2.5 text-right font-semibold">{promedioReventa12m}%</td>
                <td className="tabular px-4 py-2.5 text-right text-soft">—</td>
                <td className="tabular px-4 py-2.5 text-right font-semibold">{promedioReventa36m}%</td>
                <td className="tabular px-4 py-2.5 text-right text-soft">—</td>
                <td className="px-4 py-2.5" />
              </tr>
              {filas.map(({ marca, idx }) => (
                <tr key={marca.id} className="border-t border-border">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    <Link to={`/marcas/${marca.slug}`} className="logo-gris inline-flex items-center gap-2 font-semibold hover:text-accent">
                      <LogoMarca marca={marca} size={22} />
                      {marca.nombre}
                    </Link>
                  </th>
                  <td className="px-4 py-2.5 text-soft">
                    {marca.paisOrigen}
                    {marca.tipo === 'nueva' && <span className="ml-2 badge badge-warn">llegó en {marca.anioLlegada}</span>}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <Celda valor={idx?.retencion12m ?? null} promedio={promedioReventa12m} />
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    {idx?.retencion24m != null ? <span className="font-semibold">{idx.retencion24m}%</span> : <span className="text-soft">Sin dato</span>}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <Celda valor={idx?.retencion36m ?? null} promedio={promedioReventa36m} />
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    {idx?.muestra ?? 0}
                    {idx && idx.muestra < MUESTRA_CHICA && <span className="ml-1.5 badge badge-warn">chica</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-block align-middle">
                      <Serie puntos={idx?.serie.map((s) => s.retencion12m) ?? []} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-soft">
          Corte de {formatFecha(FECHA_CORTE)}. Datos de ejemplo. Las marcas con menos de 10 avisos relevados aparecen como
          "Sin dato": preferimos no publicar antes que publicar un número que no se sostiene.
        </p>

        <section className="mt-14">
          <SectionHead
            eyebrow="Modelo por modelo"
            titulo="Las marcas nuevas, una por una"
            bajada="Acá está la pregunta que casi nadie responde en Argentina: cuánto pierde de verdad un auto chino. Sumamos cuatro modelos tradicionales como referencia."
          />
          <div className="scroll-x card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-soft">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Modelo</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">12 meses</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">24 meses</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Muestra</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Nota</th>
                </tr>
              </thead>
              <tbody>
                {modelosOrdenados.map((i) => {
                  const m = modelosPorId[i.modeloSlug]
                  if (!m) return null
                  const marca = marcasPorId[m.marcaId]
                  return (
                    <tr key={i.modeloSlug} className="border-t border-border">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal">
                        <Link to={`/modelos/${m.slug}`} className="font-semibold hover:text-accent">
                          {marca.nombre} {m.nombre}
                        </Link>
                        <span className="ml-2 text-xs text-soft">{marca.tipo === 'nueva' ? 'marca nueva' : marca.origen === 'china' ? 'China' : 'referencia'}</span>
                      </th>
                      <td className="tabular px-4 py-2.5 text-right font-semibold">{i.retencion12m != null ? `${i.retencion12m}%` : 'Sin dato'}</td>
                      <td className="tabular px-4 py-2.5 text-right">{i.retencion24m != null ? `${i.retencion24m}%` : <span className="text-soft">Sin dato</span>}</td>
                      <td className="tabular px-4 py-2.5 text-right">
                        {i.muestra}
                        {i.muestra < MUESTRA_CHICA && <span className="ml-1.5 badge badge-warn">chica</span>}
                      </td>
                      <td className="px-4 py-2.5 text-soft">{i.nota ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="card p-5">
            <p className="inline-flex items-center gap-2 eyebrow">
              <TrendingDown className="size-4" aria-hidden />
              Lo que todavía no podemos medir
            </p>
            <h3 className="mt-2 text-2xl">{sinDato.length} marcas sin número</h3>
            <p className="mt-2 text-soft">
              Son marcas con menos de diez usados relevados en el último corte. Casi todas llegaron en los últimos dos años.
              Que no haya dato es, en sí, el dato: nadie sabe todavía cuánto van a valer.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {sinDato.map((m) => (
                <li key={m.id}>
                  <Link to={`/marcas/${m.slug}`} className="chip">
                    {m.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <p className="eyebrow">Las recién llegadas que ya tienen dato</p>
            <h3 className="mt-2 text-2xl">{nuevasConDato.length} marcas con primer año cumplido</h3>
            <p className="mt-2 text-soft">
              Tienen usados suficientes para medir 12 meses, pero todavía no llegan a los 24 ni a los 36. La serie recién
              empieza y la vamos a seguir publicando mes a mes.
            </p>
            <ul className="mt-4 divide-y divide-border">
              {nuevasConDato.slice(0, 8).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/marcas/${m.slug}`} className="font-semibold hover:text-accent">
                    {m.nombre}
                  </Link>
                  <span className="tabular text-sm">
                    {indicePorMarca[m.id].retencion12m}%{' '}
                    <span className="text-xs text-soft">({indicePorMarca[m.id].muestra} avisos)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>
    </>
  )
}

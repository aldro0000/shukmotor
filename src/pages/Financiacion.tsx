import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, ChevronDown, Info } from 'lucide-react'
import {
  cftAproximado,
  cuotaFrances,
  formatARS,
  formatMillones,
  marcasOrdenadas,
  marcasPorId,
  modelosALaVenta,
  ofertasFinanciacion,
  planesFinanciacion,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, DatosEjemplo, SectionHead, LogoMarca} from '../components/ui'

const GLOSARIO = [
  { t: 'TNA', d: 'Tasa nominal anual. Es la que publican las marcas. No incluye capitalización ni gastos: es la más chica de las tres, y por eso es la que muestran.' },
  { t: 'TEA', d: 'Tasa efectiva anual. Lo que realmente rinde la TNA cuando se capitaliza mes a mes. Siempre es más alta que la TNA.' },
  { t: 'CFT', d: 'Costo financiero total. La TEA más seguros, sellados y gastos de otorgamiento. Es el único número que sirve para comparar dos créditos.' },
  { t: 'Prenda', d: 'El auto queda como garantía del préstamo. Es tuyo y lo usás, pero no lo podés vender ni transferir hasta cancelar y levantar la prenda.' },
  { t: 'Sistema francés', d: 'Cuota fija todos los meses. Al principio pagás más interés y menos capital; al final, al revés.' },
  { t: 'Anticipo', d: 'Lo que ponés al inicio, con plata o con tu usado. Cuanto más anticipo, menos capital financiado y menos intereses.' },
]

function Calculadora() {
  const [modeloId, setModeloId] = useState('fiat-cronos-drive-cvt')
  const [anticipoPct, setAnticipoPct] = useState(40)
  const [planId, setPlanId] = useState('prendario-marca')
  const [meses, setMeses] = useState(36)
  const [tna, setTna] = useState(38)

  const modelo = modelosALaVenta.find((m) => m.id === modeloId) ?? modelosALaVenta[0]
  const plan = planesFinanciacion.find((p) => p.id === planId) ?? planesFinanciacion[0]
  const precio = modelo.precioCalleARS
  const anticipo = Math.round((precio * anticipoPct) / 100)
  const capital = precio - anticipo
  const cuota = cuotaFrances(capital, tna, meses)
  const total = cuota * meses
  const intereses = total - capital
  const cft = cftAproximado(tna)

  const elegirPlan = (id: string) => {
    const p = planesFinanciacion.find((x) => x.id === id)
    if (!p) return
    setPlanId(id)
    setTna(p.tnaReferencia)
    if (p.plazosMeses.length) setMeses(p.plazosMeses[Math.min(2, p.plazosMeses.length - 1)])
    setAnticipoPct(Math.max(p.anticipoMinimoPct, anticipoPct))
  }

  const ordenados = useMemo(() => [...modelosALaVenta].sort((a, b) => a.precioCalleARS - b.precioCalleARS), [])

  return (
    <div className="card grid gap-6 p-5 md:grid-cols-[1fr_1fr] md:p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="calc-modelo" className="text-sm font-medium text-soft">
            El auto
          </label>
          <div className="relative mt-1">
            <select id="calc-modelo" className="field" value={modeloId} onChange={(e) => setModeloId(e.target.value)}>
              {ordenados.map((m) => (
                <option key={m.id} value={m.id}>
                  {marcasPorId[m.marcaId].nombre} {m.nombre} {m.version} · {formatMillones(m.precioCalleARS)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
          </div>
        </div>

        <div>
          <label htmlFor="calc-plan" className="text-sm font-medium text-soft">
            Tipo de financiación
          </label>
          <div className="relative mt-1">
            <select id="calc-plan" className="field" value={planId} onChange={(e) => elegirPlan(e.target.value)}>
              {planesFinanciacion
                .filter((p) => p.plazosMeses.length > 0)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="calc-anticipo" className="text-sm font-medium text-soft">
              Anticipo (plata o usado)
            </label>
            <output className="tabular font-semibold">
              {anticipoPct}% · {formatMillones(anticipo)}
            </output>
          </div>
          <input
            id="calc-anticipo"
            type="range"
            min={plan.anticipoMinimoPct}
            max={90}
            step={5}
            value={anticipoPct}
            onChange={(e) => setAnticipoPct(Number(e.target.value))}
            className="range"
            style={{ ['--pct' as string]: `${((anticipoPct - plan.anticipoMinimoPct) / (90 - plan.anticipoMinimoPct)) * 100}%` }}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-soft">Plazo</p>
          <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Plazo en meses">
            {plan.plazosMeses.map((m) => (
              <Chip key={m} on={meses === m} onClick={() => setMeses(m)}>
                {m} cuotas
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="calc-tna" className="text-sm font-medium text-soft">
              TNA
            </label>
            <output className="tabular font-semibold">{tna.toLocaleString('es-AR')}%</output>
          </div>
          <input
            id="calc-tna"
            type="range"
            min={0}
            max={90}
            step={0.5}
            value={tna}
            onChange={(e) => setTna(Number(e.target.value))}
            className="range"
            style={{ ['--pct' as string]: `${(tna / 90) * 100}%` }}
          />
          <p className="text-xs text-soft">Arranca en la tasa de referencia del plan. Movela con la que te ofrezcan.</p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-md border border-border bg-bg p-5">
        <div>
          <p className="eyebrow">Cuota mensual estimada</p>
          <p className="tabular mt-1 font-display text-5xl font-extrabold leading-none">{formatARS(Math.round(cuota))}</p>
          <p className="tabular mt-1 text-sm text-soft">
            {meses} cuotas fijas · CFT aproximado {cft.toLocaleString('es-AR')}%
          </p>
        </div>
        <dl className="tabular mt-6 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-soft">Precio de calle</dt>
            <dd>{formatARS(precio)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-soft">Anticipo</dt>
            <dd>{formatARS(anticipo)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-soft">Financiás</dt>
            <dd>{formatARS(capital)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-soft">Intereses en total</dt>
            <dd className={intereses > capital * 0.5 ? 'text-warn' : ''}>{formatARS(Math.round(intereses))}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Terminás pagando</dt>
            <dd>{formatARS(Math.round(anticipo + total))}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-soft">
          Sistema francés sin gastos de otorgamiento ni seguro. Sirve para comparar, no reemplaza la simulación del banco.{' '}
          <Link to={`/modelos/${modelo.slug}`} className="font-semibold hover:text-accent">
            Ver la ficha del {modelo.nombre}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default function Financiacion() {
  useTitle('Cómo financiar un 0km')
  const [marcaFiltro, setMarcaFiltro] = useState('todas')
  const marcasConOferta = marcasOrdenadas.filter((m) => ofertasFinanciacion.some((o) => o.marcaId === m.id))
  const ofertas = ofertasFinanciacion
    .filter((o) => marcaFiltro === 'todas' || o.marcaId === marcaFiltro)
    .sort((a, b) => a.tna - b.tna)

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-12">
          <p className="eyebrow">Guía práctica</p>
          <h1 className="mt-2 max-w-3xl text-4xl leading-[0.95] md:text-5xl">Cómo se financia un 0km en Argentina, sin letra chica</h1>
          <p className="mt-4 max-w-2xl text-lg text-soft">
            Casi nadie compra un auto al contado. Hay siete formas de pagarlo de a poco, cada una sirve para un caso
            distinto y todas tienen una trampa que conviene conocer antes de firmar.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GLOSARIO.map((g) => (
              <div key={g.t} className="rounded-md border border-border bg-bg p-4">
                <p className="font-display text-xl font-bold">{g.t}</p>
                <p className="mt-1 text-sm text-soft">{g.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <SectionHead
          eyebrow="Simulá antes de ir al concesionario"
          titulo="Calculadora de cuota"
          bajada="Elegí el auto, cuánto ponés y a cuánto tiempo. Te mostramos la cuota y, sobre todo, cuánto terminás pagando."
        />
        <Calculadora />
        <DatosEjemplo className="mt-3" />
      </Container>

      <Container className="pb-12">
        <SectionHead
          eyebrow="Una por una"
          titulo="Las siete formas de pagar un auto"
          bajada="Cómo funciona cada una, para quién es y qué mirar antes de firmar."
        />
        <div className="space-y-3">
          {planesFinanciacion.map((p, i) => (
            <details key={p.id} className="acc card" open={i === 0}>
              <summary className="flex items-center gap-4 p-5">
                <span className="tabular font-display text-3xl font-extrabold text-soft">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl font-bold leading-tight">{p.nombre}</span>
                  <span className="mt-0.5 block text-sm text-soft">{p.resumen}</span>
                </span>
                <span className="tabular hidden shrink-0 text-right text-sm md:block">
                  {p.tnaReferencia > 0 ? (
                    <>
                      <span className="block text-soft">TNA de referencia</span>
                      <span className="font-semibold">{p.tnaReferencia}%</span>
                    </>
                  ) : (
                    <span className="text-soft">Sin tasa</span>
                  )}
                </span>
                <ChevronDown className="acc-icon size-5 shrink-0 text-soft" aria-hidden />
              </summary>
              <div className="grid gap-6 border-t border-border p-5 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="eyebrow">Cómo funciona</p>
                  <ol className="mt-2 space-y-2">
                    {p.comoFunciona.map((paso, j) => (
                      <li key={j} className="flex gap-3 text-sm">
                        <span className="tabular mt-0.5 shrink-0 font-semibold text-accent">{j + 1}.</span>
                        <span>{paso}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 inline-flex items-start gap-2 rounded-sm bg-surface-2 p-3 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-soft" aria-hidden />
                    <span>
                      <strong>Para quién:</strong> {p.paraQuien}
                    </span>
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="eyebrow text-ok">A favor</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                      {p.ventajas.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow text-bad">Ojo con</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                      {p.riesgos.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                  {p.plazosMeses.length > 0 && (
                    <p className="tabular text-xs text-soft">
                      Plazos habituales: {p.plazosMeses.join(', ')} meses · Anticipo mínimo {p.anticipoMinimoPct}%
                    </p>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      </Container>

      <Container className="pb-12">
        <SectionHead
          eyebrow="Vigentes este mes"
          titulo="Ofertas de financiación por marca"
          bajada="Lo que las marcas están ofreciendo hoy. Ordenadas de menor a mayor tasa. Las tasas 0% aplican a montos acotados."
        />
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por marca">
          <Chip on={marcaFiltro === 'todas'} onClick={() => setMarcaFiltro('todas')}>
            Todas
          </Chip>
          {marcasConOferta.map((m) => (
            <Chip key={m.id} on={marcaFiltro === m.id} onClick={() => setMarcaFiltro(m.id)}>
              {m.nombre}
            </Chip>
          ))}
        </div>
        <div className="scroll-x card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Marca</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 text-right font-semibold">TNA</th>
                <th className="px-4 py-3 text-right font-semibold">Cuotas</th>
                <th className="px-4 py-3 text-right font-semibold">Financia hasta</th>
                <th className="px-4 py-3 font-semibold">Condiciones</th>
                <th className="px-4 py-3 text-right font-semibold">Vence</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => {
                const marca = marcasPorId[o.marcaId]
                const plan = planesFinanciacion.find((p) => p.id === o.planId)
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link to={`/marcas/${marca.slug}`} className="inline-flex items-center gap-2 font-semibold hover:text-accent">
                        <LogoMarca marca={marca} size={22} />
                        {marca.nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium">{o.titulo}</span>
                      <span className="text-xs text-soft">{plan?.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {o.tna === 0 ? <span className="badge badge-ok">0%</span> : `${o.tna.toLocaleString('es-AR')}%`}
                    </td>
                    <td className="px-4 py-3 text-right">{o.plazoMeses}</td>
                    <td className="px-4 py-3 text-right">{formatMillones(o.montoMaximoARS)}</td>
                    <td className="max-w-xs px-4 py-3 text-soft">{o.condiciones}</td>
                    <td className="px-4 py-3 text-right text-soft">{o.vigenciaHasta.slice(8, 10)}/{o.vigenciaHasta.slice(5, 7)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-soft">
          <Calculator className="size-3.5" aria-hidden />
          Datos de ejemplo. Las marcas que quieran publicar sus planes acá lo hacen en un espacio marcado como patrocinado; la
          tabla editorial no se vende.
        </p>
      </Container>
    </>
  )
}

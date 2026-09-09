import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Info, PhoneCall } from 'lucide-react'
import {
  FECHA_CORTE_POSVENTA,
  METODOLOGIA_POSVENTA,
  formatARS,
  formatFecha,
  marcasOrdenadas,
  posventaPorMarca,
  posventaRelevada,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, SectionHead, LogoMarca} from '../components/ui'

type Orden = 'repuesto' | 'carroceria' | 'service' | 'respuesta' | 'nombre'
type Filtro = 'todas' | 'tradicional' | 'nueva'

function Dias({ dias, corte }: { dias: number | null; corte: [number, number] }) {
  if (dias == null) return <span className="text-soft">Sin dato</span>
  const clase = dias <= corte[0] ? 'text-ok' : dias <= corte[1] ? 'text-warn' : 'text-bad'
  return (
    <span className={`font-semibold ${clase}`}>
      {dias} {dias === 1 ? 'día' : 'días'}
    </span>
  )
}

export default function Posventa() {
  useTitle('Posventa medida')
  const [orden, setOrden] = useState<Orden>('carroceria')
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const filas = useMemo(() => {
    const l = marcasOrdenadas
      .filter((m) => filtro === 'todas' || m.tipo === filtro)
      .map((m) => ({ marca: m, pv: posventaPorMarca[m.id] }))
    const val = (v: number | null | undefined) => (v == null ? 9999 : v)
    switch (orden) {
      case 'repuesto':
        return l.sort((a, b) => val(a.pv?.diasRepuestoComun) - val(b.pv?.diasRepuestoComun))
      case 'service':
        return l.sort((a, b) => val(a.pv?.presupuestoServiceARS) - val(b.pv?.presupuestoServiceARS))
      case 'respuesta':
        return l.sort((a, b) => (b.pv?.talleresRespondieron ?? 0) / (b.pv?.talleresLlamados ?? 1) - (a.pv?.talleresRespondieron ?? 0) / (a.pv?.talleresLlamados ?? 1))
      case 'nombre':
        return l.sort((a, b) => a.marca.nombre.localeCompare(b.marca.nombre, 'es'))
      default:
        return l.sort((a, b) => val(a.pv?.diasRepuestoCarroceria) - val(b.pv?.diasRepuestoCarroceria))
    }
  }, [orden, filtro])

  const totalLlamados = posventaRelevada.reduce((a, p) => a + p.talleresLlamados, 0)
  const totalRespondieron = posventaRelevada.reduce((a, p) => a + p.talleresRespondieron, 0)
  const conCarroceria = posventaRelevada.filter((p) => p.diasRepuestoCarroceria != null)
  const medianaCarroceria = Math.round(conCarroceria.reduce((a, p) => a + (p.diasRepuestoCarroceria ?? 0), 0) / conCarroceria.length)

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-12">
          <p className="eyebrow">Relevamiento propio · corte de {formatFecha(FECHA_CORTE_POSVENTA)}</p>
          <h1 className="mt-2 max-w-4xl text-4xl leading-[0.95] md:text-6xl">
            Posventa: lo que dicen los talleres, no lo que declara la marca
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-soft">
            Todo lo que se publica en Argentina sobre red de service y stock de repuestos son cifras que declaran las propias
            marcas. Nosotros levantamos el teléfono y preguntamos del otro lado del mostrador.
          </p>
          <dl className="tabular mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
            <div>
              <dt className="eyebrow">Talleres llamados</dt>
              <dd className="font-display text-4xl font-black leading-none">{totalLlamados}</dd>
            </div>
            <div>
              <dt className="eyebrow">Respondieron</dt>
              <dd className="font-display text-4xl font-black leading-none">{totalRespondieron}</dd>
              <p className="mt-1 text-xs text-soft">{Math.round((totalRespondieron / totalLlamados) * 100)}% de respuesta</p>
            </div>
            <div>
              <dt className="eyebrow">Óptica delantera</dt>
              <dd className="font-display text-4xl font-black leading-none">{medianaCarroceria} días</dd>
              <p className="mt-1 text-xs text-soft">mediana del mercado</p>
            </div>
            <div>
              <dt className="eyebrow">Marcas relevadas</dt>
              <dd className="font-display text-4xl font-black leading-none">{posventaRelevada.length}</dd>
            </div>
          </dl>
        </Container>
      </section>

      <Container className="py-10">
        <details className="acc card">
          <summary className="flex items-center gap-4 p-5">
            <Info className="size-5 shrink-0 text-soft" aria-hidden />
            <span className="flex-1">
              <span className="block font-display text-2xl font-bold">Cómo lo medimos</span>
              <span className="mt-0.5 block text-sm text-soft">{METODOLOGIA_POSVENTA.resumen}</span>
            </span>
            <ChevronDown className="acc-icon size-5 shrink-0 text-soft" aria-hidden />
          </summary>
          <div className="grid gap-8 border-t border-border p-5 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow">Paso a paso</p>
              <ol className="mt-2 space-y-2">
                {METODOLOGIA_POSVENTA.pasos.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="tabular mt-0.5 shrink-0 font-semibold text-accent">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow">Lo que este relevamiento no es</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-soft">
                {METODOLOGIA_POSVENTA.limites.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <p className="mt-4 rounded-sm bg-surface-2 p-3 text-sm">
                Ninguna marca sabe de antemano que la vamos a llamar, y ninguna puede pagar para salir mejor en esta tabla.
              </p>
            </div>
          </div>
        </details>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            eyebrow="Todas las marcas"
            titulo="Cuánto tardás en arreglarlo"
            bajada="Verde, ámbar y rojo según la demora medida. Una marca con pocos talleres llamados no se compara igual que una con cuarenta."
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
              <label htmlFor="orden-posventa" className="sr-only">
                Ordenar por
              </label>
              <select id="orden-posventa" value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="field rounded-full! py-[0.45rem]! pr-9! text-sm!">
                <option value="carroceria">Ordenar: demora de carrocería</option>
                <option value="repuesto">Demora de repuesto común</option>
                <option value="service">Precio del service</option>
                <option value="respuesta">Tasa de respuesta</option>
                <option value="nombre">Alfabético</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
            </div>
          </div>
        </div>

        <div className="scroll-x mt-5 card">
          <table className="w-full min-w-[900px] text-sm">
            <caption className="sr-only">Relevamiento de posventa por marca, corte de {formatFecha(FECHA_CORTE_POSVENTA)}</caption>
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-soft">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Marca</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Llamados</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Respondieron</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Turno</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Pastillas</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Óptica</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Stock</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Service 10.000</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ marca, pv }) => (
                <tr key={marca.id} className="border-t border-border">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    <Link to={`/marcas/${marca.slug}`} className="logo-gris inline-flex items-center gap-2 font-semibold hover:text-accent">
                      <LogoMarca marca={marca} size={22} />
                      {marca.nombre}
                    </Link>
                    {marca.tipo === 'nueva' && <span className="ml-2 badge badge-warn">nueva</span>}
                  </th>
                  <td className="tabular px-4 py-2.5 text-right text-soft">{pv.talleresLlamados}</td>
                  <td className="tabular px-4 py-2.5 text-right">
                    {pv.talleresRespondieron}
                    <span className="ml-1 text-xs text-soft">({Math.round((pv.talleresRespondieron / pv.talleresLlamados) * 100)}%)</span>
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <Dias dias={pv.diasTurno} corte={[5, 10]} />
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <Dias dias={pv.diasRepuestoComun} corte={[3, 7]} />
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    <Dias dias={pv.diasRepuestoCarroceria} corte={[10, 25]} />
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    {pv.stockEnMostrador}/{pv.talleresRespondieron}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">
                    {pv.presupuestoServiceARS != null ? formatARS(pv.presupuestoServiceARS) : <span className="text-soft">Sin dato</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-soft">
          "Stock" es cuántos talleres tenían las pastillas en el mostrador el día que llamamos, sobre los que atendieron el
          teléfono. Datos de ejemplo.
        </p>

        <section className="mt-14">
          <SectionHead
            eyebrow="Lo que nos contestaron"
            titulo="Notas del relevamiento"
            bajada="Lo que anotó quien llamó, marca por marca. Es la parte que ningún dato agregado muestra."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posventaRelevada
              .filter((p) => p.nota)
              .map((p) => {
                const marca = marcasOrdenadas.find((m) => m.id === p.marcaId)!
                return (
                  <article key={p.marcaId} className="card p-4">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="size-4 shrink-0 text-soft" aria-hidden />
                      <Link to={`/marcas/${marca.slug}`} className="font-display text-xl font-bold hover:text-accent">
                        {marca.nombre}
                      </Link>
                      <span className="tabular ml-auto text-xs text-soft">
                        {p.talleresRespondieron}/{p.talleresLlamados} atendieron
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-soft">{p.nota}</p>
                  </article>
                )
              })}
          </div>
        </section>
      </Container>
    </>
  )
}

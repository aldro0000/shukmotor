import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Landmark, MapPin, ShieldCheck, TrendingUp, Wrench } from 'lucide-react'
import {
  ETIQUETA_ORIGEN,
  ETIQUETA_TIPO_EVENTO,
  eventosCalendario,
  formatFecha,
  formatMillones,
  formatNumero,
  getMarca,
  modelosDeMarca,
  ofertasFinanciacion,
  promedioReventa12m,
  promedioReventa36m,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container, DatosEjemplo, SectionHead, LogoMarca} from '../components/ui'
import { ModeloCard } from '../components/modelo/ModeloCard'
import NotFound from './NotFound'

function Reventa({ label, valor, promedio }: { label: string; valor: number; promedio: number }) {
  const diff = valor - promedio
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="tabular mt-0.5 font-display text-3xl font-bold leading-none">{valor}%</p>
      <p className={`tabular mt-1 text-xs ${diff >= 0 ? 'text-ok' : 'text-bad'}`}>
        {diff >= 0 ? '+' : ''}
        {diff} pts vs. mercado ({promedio}%)
      </p>
    </div>
  )
}

export default function MarcaPage() {
  const { slug = '' } = useParams()
  const marca = getMarca(slug)
  useTitle(marca ? marca.nombre : 'Marca')
  if (!marca) return <NotFound />

  const lista = modelosDeMarca(marca.id)
  const eventos = eventosCalendario.filter((e) => e.marcaId === marca.id).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const ofertas = ofertasFinanciacion.filter((o) => o.marcaId === marca.id)
  const masBarato = lista[0]
  const masCaro = lista[lista.length - 1]

  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="py-10">
          <nav className="text-sm text-soft" aria-label="Migas">
            <Link to="/marcas" className="hover:text-text">
              Marcas
            </Link>{' '}
            / {marca.nombre}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <LogoMarca marca={marca} size={72} />
            <div>
              <h1 className="text-4xl md:text-5xl">{marca.nombre}</h1>
              <p className="mt-1 text-soft">
                {marca.paisOrigen}
                {ETIQUETA_ORIGEN[marca.origen] !== marca.paisOrigen && ` (${ETIQUETA_ORIGEN[marca.origen]})`} · en Argentina
                desde {marca.anioLlegada}
                {marca.tipo === 'nueva' && ' · marca nueva'}
              </p>
            </div>
            <div className="ml-auto flex items-end gap-8">
              <Reventa label="Reventa a 12 meses" valor={marca.reventa12mPct} promedio={promedioReventa12m} />
              <Reventa label="A 36 meses" valor={marca.reventa36mPct} promedio={promedioReventa36m} />
            </div>
          </div>

          <dl className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex gap-3">
              <Landmark className="mt-1 size-5 shrink-0 text-soft" aria-hidden />
              <div>
                <dt className="eyebrow">Importa y representa</dt>
                <dd className="mt-0.5 text-sm font-medium">{marca.importador}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 size-5 shrink-0 text-soft" aria-hidden />
              <div>
                <dt className="eyebrow">Garantía</dt>
                <dd className="tabular mt-0.5 text-sm font-medium">
                  {marca.garantiaAnios} años o {formatNumero(marca.garantiaKm)} km
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Wrench className="mt-1 size-5 shrink-0 text-soft" aria-hidden />
              <div>
                <dt className="eyebrow">Talleres oficiales</dt>
                <dd className="tabular mt-0.5 text-sm font-medium">{marca.talleresOficiales} en el país</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-soft" aria-hidden />
              <div>
                <dt className="eyebrow">Service en</dt>
                <dd className="tabular mt-0.5 text-sm font-medium">
                  {marca.provinciasConService.length} de 24 provincias
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="mt-1 size-5 shrink-0 text-soft" aria-hidden />
              <div>
                <dt className="eyebrow">Rango de precios</dt>
                <dd className="tabular mt-0.5 text-sm font-medium">
                  {formatMillones(masBarato.precioCalleARS)} a {formatMillones(masCaro.precioCalleARS)}
                </dd>
              </div>
            </div>
          </dl>
          <details className="acc mt-4 text-sm text-soft">
            <summary className="inline-flex cursor-pointer items-center gap-1 hover:text-text">
              Ver provincias con service oficial
            </summary>
            <p className="mt-2 max-w-3xl">{marca.provinciasConService.join(', ')}.</p>
          </details>
        </Container>
      </section>

      <Container className="py-10">
        <SectionHead
          eyebrow={`${lista.length} ${lista.length === 1 ? 'modelo' : 'modelos'} en venta`}
          titulo={`Todos los ${marca.nombre} 0km`}
          bajada="Ordenados de más barato a más caro por precio de calle, el que se paga de verdad."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((m, i) => (
            <ModeloCard key={m.id} modelo={m} eager={i < 3} />
          ))}
        </div>
        <DatosEjemplo className="mt-4" />
      </Container>

      {(eventos.length > 0 || ofertas.length > 0) && (
        <Container className="pb-10">
          <div className="grid gap-8 md:grid-cols-2">
            {eventos.length > 0 && (
              <section className="card p-5">
                <h2 className="inline-flex items-center gap-2 text-2xl">
                  <CalendarDays className="size-5 text-soft" aria-hidden />
                  Lo que viene de {marca.nombre}
                </h2>
                <ol className="mt-4 space-y-4">
                  {eventos.map((ev) => (
                    <li key={ev.id} className="border-t border-border pt-3">
                      <p className="tabular text-xs text-soft">
                        {formatFecha(ev.fecha)} · {ev.estado === 'confirmado' ? 'confirmado' : 'estimado'} ·{' '}
                        {ETIQUETA_TIPO_EVENTO[ev.tipo]}
                      </p>
                      <p className="font-semibold">{ev.titulo}</p>
                      <p className="text-sm text-soft">{ev.detalle}</p>
                    </li>
                  ))}
                </ol>
                <Link to="/calendario" className="mt-4 inline-block text-sm font-semibold hover:text-accent">
                  Calendario completo
                </Link>
              </section>
            )}
            {ofertas.length > 0 && (
              <section className="card p-5">
                <h2 className="text-2xl">Financiación de {marca.nombre}</h2>
                <ul className="mt-4 space-y-4">
                  {ofertas.map((o) => (
                    <li key={o.id} className="border-t border-border pt-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-semibold">{o.titulo}</p>
                        <p className="tabular text-sm">
                          {o.tna === 0 ? 'Sin interés' : `TNA ${o.tna.toLocaleString('es-AR')}%`} · {o.plazoMeses} cuotas
                        </p>
                      </div>
                      <p className="text-sm text-soft">{o.condiciones}</p>
                    </li>
                  ))}
                </ul>
                <Link to="/financiacion" className="mt-4 inline-block text-sm font-semibold hover:text-accent">
                  Cómo funciona cada plan
                </Link>
              </section>
            )}
          </div>
        </Container>
      )}

    </>
  )
}

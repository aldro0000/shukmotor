import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CalendarClock } from 'lucide-react'
import type { EstadoEvento, TipoEvento } from '../types'
import {
  ETIQUETA_TIPO_EVENTO,
  ETIQUETA_SEGMENTO,
  eventosCalendario,
  modelosProximos,
  formatFecha,
  formatMillones,
  marcasOrdenadas,
  marcasPorId,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, DatosEjemplo, SectionHead, LogoMarca} from '../components/ui'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function claveMes(iso: string) {
  return iso.slice(0, 7)
}
function tituloMes(clave: string) {
  const [y, m] = clave.split('-').map(Number)
  return `${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)} ${y}`
}

export default function Calendario() {
  useTitle('Calendario de llegadas y lanzamientos')
  const [estado, setEstado] = useState<EstadoEvento | 'todos'>('todos')
  const [tipo, setTipo] = useState<TipoEvento | 'todos'>('todos')

  const grupos = useMemo(() => {
    const lista = [...eventosCalendario]
      .filter((e) => (estado === 'todos' || e.estado === estado) && (tipo === 'todos' || e.tipo === tipo))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    const map = new Map<string, typeof lista>()
    for (const e of lista) {
      const k = claveMes(e.fecha)
      map.set(k, [...(map.get(k) ?? []), e])
    }
    return [...map.entries()]
  }, [estado, tipo])

  const confirmados = eventosCalendario.filter((e) => e.estado === 'confirmado').length
  const nuevas = marcasOrdenadas.filter((m) => m.tipo === 'nueva').sort((a, b) => b.anioLlegada - a.anioLlegada)

  const porMarcaProximos = useMemo(() => {
    const mapa = new Map<string, typeof modelosProximos>()
    for (const m of modelosProximos) mapa.set(m.marcaId, [...(mapa.get(m.marcaId) ?? []), m])
    return [...mapa.entries()].sort((a, b) => marcasPorId[a[0]].nombre.localeCompare(marcasPorId[b[0]].nombre, 'es'))
  }, [])
  const total = grupos.reduce((a, [, l]) => a + l.length, 0)

  return (
    <Container className="py-10">
      <SectionHead
        eyebrow={`${eventosCalendario.length} fechas · ${confirmados} confirmadas por la marca`}
        titulo="Calendario de llegadas y lanzamientos"
        bajada="Qué marcas llegan, qué modelos se presentan y cuándo. Si estás por comprar, conviene saber si tu candidato cambia de generación en tres meses."
      />

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
          {(
            [
              ['todos', 'Todas las fechas'],
              ['confirmado', 'Confirmadas'],
              ['estimado', 'Estimadas'],
            ] as [EstadoEvento | 'todos', string][]
          ).map(([v, l]) => (
            <Chip key={v} on={estado === v} onClick={() => setEstado(v)}>
              {v === 'confirmado' && <CalendarCheck className="size-4 text-ok" aria-hidden />}
              {v === 'estimado' && <CalendarClock className="size-4 text-warn" aria-hidden />}
              {l}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo">
          <Chip on={tipo === 'todos'} onClick={() => setTipo('todos')}>
            Todo
          </Chip>
          {(Object.keys(ETIQUETA_TIPO_EVENTO) as TipoEvento[]).map((t) => (
            <Chip key={t} on={tipo === t} onClick={() => setTipo(t)}>
              {ETIQUETA_TIPO_EVENTO[t]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {total === 0 ? (
            <div className="card p-6">
              <p className="font-semibold">No hay {tipo !== 'todos' ? ETIQUETA_TIPO_EVENTO[tipo].toLowerCase() : 'fechas'} {estado !== 'todos' ? `${estado}s` : ''} en la agenda.</p>
              <p className="mt-1 text-soft">Probá con otro filtro o mirá todas las fechas.</p>
              <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => { setEstado('todos'); setTipo('todos') }}>
                Ver todas
              </button>
            </div>
          ) : (
            grupos.map(([mes, lista]) => (
              <section key={mes} className="mb-10">
                <h2 className="sticky top-14 z-10 -mx-4 mb-4 border-b border-border bg-bg/95 px-4 py-2 text-2xl backdrop-blur md:mx-0 md:px-0">
                  {tituloMes(mes)}
                </h2>
                <ol className="timeline space-y-6 pl-8">
                  {lista.map((ev) => {
                    const marca = marcasPorId[ev.marcaId]
                    return (
                      <li key={ev.id} className="relative">
                        <span className={`timeline-dot -left-8 ${ev.estado === 'confirmado' ? 'ok' : 'warn'}`} aria-hidden />
                        <div className="card p-4 md:p-5">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className={`badge ${ev.estado === 'confirmado' ? 'badge-ok' : 'badge-warn'}`}>
                              {ev.estado === 'confirmado' ? formatFecha(ev.fecha) : `${tituloMes(mes)}, estimado`}
                            </span>
                            <span className="badge badge-neutral">{ETIQUETA_TIPO_EVENTO[ev.tipo]}</span>
                            <Link to={`/marcas/${marca.slug}`} className="ml-auto inline-flex items-center gap-2 text-soft hover:text-text">
                              <LogoMarca marca={marca} size={20} />
                              {marca.nombre}
                            </Link>
                          </div>
                          <h3 className="mt-3 text-2xl leading-tight">{ev.titulo}</h3>
                          <p className="mt-1 text-soft">{ev.detalle}</p>
                          <div className="tabular mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                            {ev.precioEstimadoARS && (
                              <span>
                                <span className="text-soft">Precio estimado </span>
                                <strong>{formatMillones(ev.precioEstimadoARS)}</strong>
                              </span>
                            )}
                            {ev.modeloSlug && (
                              <Link to={`/modelos/${ev.modeloSlug}`} className="font-semibold hover:text-accent">
                                Ver el modelo actual
                              </Link>
                            )}
                            <span className="text-xs text-soft">Fuente: {ev.fuente}</span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))
          )}
          {/*
            El inventario confirma la llegada durante 2026 pero no da el mes. Inventar
            una fecha para meterlos en la línea de tiempo sería peor que no tenerla:
            van acá, agrupados por marca, diciendo exactamente lo que sabemos.
          */}
          {porMarcaProximos.length > 0 && (
            <section className="mt-14">
              <SectionHead
                eyebrow={`${modelosProximos.length} modelos · ${porMarcaProximos.length} marcas`}
                titulo="Confirmados para 2026, sin fecha anunciada"
              />
              <p className="mt-2 max-w-prose text-soft">
                La llegada está confirmada, el mes no. Cuando la marca o el importador anuncien una fecha, el modelo
                pasa a la línea de tiempo de arriba.
              </p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2" role="list">
                {porMarcaProximos.map(([marcaId, lista]) => {
                  const marca = marcasPorId[marcaId]
                  return (
                    <li key={marcaId} className="card p-4">
                      <Link to={`/marcas/${marca.slug}`} className="logo-gris flex items-center gap-3 hover:text-accent">
                        <LogoMarca marca={marca} size={28} />
                        <span className="font-display font-bold">{marca.nombre}</span>
                      </Link>
                      <ul className="mt-3 divide-y divide-border text-sm" role="list">
                        {lista.map((m) => (
                          <li key={m.id} className="flex items-baseline justify-between gap-3 py-1.5">
                            <Link to={`/modelos/${m.slug}`} className="truncate font-semibold hover:text-accent">
                              {m.nombre}
                            </Link>
                            <span className="tabular shrink-0 text-xs text-soft">{ETIQUETA_SEGMENTO[m.segmento]}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <DatosEjemplo />
        </div>

        <aside>
          <div className="card p-5">
            <p className="eyebrow">Cómo leer el calendario</p>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="mt-1 size-3 shrink-0 rounded-full bg-ok" aria-hidden />
                <span>
                  <strong>Confirmado:</strong> fecha anunciada por la marca o el importador. Puede correrse unas semanas,
                  no meses.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 size-3 shrink-0 rounded-full bg-warn" aria-hidden />
                <span>
                  <strong>Estimado:</strong> nuestra proyección según homologaciones, prensa internacional y lo que dicen
                  los importadores. Mostramos solo el mes.
                </span>
              </li>
              <li className="text-soft">
                Los precios estimados salen de comparar con la gama actual y con el precio en Brasil o Chile. Son una
                referencia, no una promesa.
              </li>
            </ul>
          </div>

          <div className="card mt-6 p-5">
            <p className="eyebrow">Marcas que llegaron hace menos de 3 años</p>
            <ul className="mt-3 divide-y divide-border">
              {nuevas.map((m) => (
                <li key={m.id}>
                  <Link to={`/marcas/${m.slug}`} className="logo-gris flex items-center gap-3 py-2 hover:text-accent">
                    <LogoMarca marca={m} size={28} />
                    <span className="font-semibold">{m.nombre}</span>
                    <span className="tabular ml-auto text-sm text-soft">{m.anioLlegada}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  )
}

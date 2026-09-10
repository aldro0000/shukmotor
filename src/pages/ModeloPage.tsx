import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Armchair, Briefcase, Clock, Fuel, GitCompare, TrendingUp, Wrench } from 'lucide-react'
import {
  ETIQUETA_COMBUSTIBLE,
  ETIQUETA_SEGMENTO,
  ETIQUETA_USO,
  MUESTRA_CHICA,
  formatARS,
  formatFecha,
  formatMillones,
  formatNumero,
  getModelo,
  indicePorMarca,
  indicePorModelo,
  marcasPorId,
  modelosPorId,
  posventaPorMarca,
} from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container, DatosEjemplo, LogoMarca } from '../components/ui'
import { Encaje } from '../components/ficha/Encaje'
import { Galeria } from '../components/ficha/Galeria'
import { Videos } from '../components/ficha/Videos'
import { Opiniones } from '../components/ficha/Opiniones'
import { DondeComprarlo } from '../components/ficha/DondeComprarlo'
import NotFound from './NotFound'
import { movimientos } from '../data/movimientos'
import { resumenModelo } from '../lib/precios'

type Tab = 'ficha' | 'posventa' | 'comprar'

function Indicador({ icon: Icon, label, valor, sub }: { icon: typeof Fuel; label: string; valor: string; sub?: string }) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <Icon className="mt-1 size-4 shrink-0 text-soft" aria-hidden />
      <div className="min-w-0">
        <p className="eyebrow">{label}</p>
        <p className="tabular font-display text-xl font-bold leading-tight">{valor}</p>
        {sub && <p className="truncate text-xs text-soft">{sub}</p>}
      </div>
    </div>
  )
}

function Fila({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-soft">{k}</dt>
      <dd className="tabular text-right font-medium">{v}</dd>
    </div>
  )
}

export default function ModeloPage() {
  const { slug = '' } = useParams()
  const modelo = getModelo(slug)
  const [tab, setTab] = useState<Tab>('ficha')
  useTitle(modelo ? `${marcasPorId[modelo.marcaId].nombre} ${modelo.nombre} ${modelo.version}` : 'Modelo')
  if (!modelo) return <NotFound />

  const marca = marcasPorId[modelo.marcaId]
  const nombre = `${marca.nombre} ${modelo.nombre}`
  const rivales = modelo.rivales.map((id) => modelosPorId[id]).filter(Boolean)
  const diff = modelo.precioCalleARS - modelo.precioListaARS
  const idxMarca = indicePorMarca[marca.id]
  const idxModelo = indicePorModelo[modelo.slug]
  const pv = posventaPorMarca[marca.id]
  const movimiento = resumenModelo(movimientos, modelo.slug)

  return (
    <Container className="py-6 md:py-8">
      <nav className="text-sm text-soft" aria-label="Migas">
        <Link to="/marcas" className="hover:text-text">
          Marcas
        </Link>{' '}
        /{' '}
        <Link to={`/marcas/${marca.slug}`} className="hover:text-text">
          {marca.nombre}
        </Link>{' '}
        / {modelo.nombre}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* 1. Galería */}
        <Galeria fotos={modelo.fotos} titulo={`${nombre} ${modelo.version}`} />

        <div className="min-w-0">
          {/* 2. Nombre, versión y precios */}
          <p className="eyebrow">
            {marca.nombre} · {ETIQUETA_SEGMENTO[modelo.segmento]} · {modelo.anio}
          </p>
          <h1 className="mt-1 text-4xl leading-none md:text-5xl">{modelo.nombre}</h1>
          <p className="mt-1.5 text-lg text-soft">{modelo.version}</p>

          {modelo.estado === 'proximo' && (
            <p className="badge badge-warn mt-3">Llegada confirmada · todavía no se vende</p>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <p className="eyebrow">{modelo.estado === 'proximo' ? 'Precio estimado' : 'Precio de calle'}</p>
              <p className="tabular font-display text-4xl font-black leading-none">{formatMillones(modelo.precioCalleARS)}</p>
            </div>
            {modelo.estado === 'vigente' && (
              <div>
                <p className="eyebrow">Lista</p>
                <p className="tabular text-lg leading-tight">{formatARS(modelo.precioListaARS)}</p>
              </div>
            )}
          </div>
          {modelo.estado === 'proximo' ? (
            <p className="mt-1.5 text-sm text-soft">
              No hay precio de calle hasta que llegue a los salones. El de arriba es una estimación.
            </p>
          ) : (
          <p className={`tabular mt-1.5 text-sm ${diff > 0 ? 'text-warn' : diff < 0 ? 'text-ok' : 'text-soft'}`}>
            {diff > 0
              ? `Se está pagando ${formatMillones(diff)} sobre lista`
              : diff < 0
                ? `Se consigue ${formatMillones(-diff)} abajo de lista`
                : 'Se paga precio de lista'}
          </p>
          )}
          <DatosEjemplo className="mt-2" />
          {movimiento && <p className="mt-3 text-sm text-soft">{movimiento}</p>}
          <Link to={`/precios?modelo=${encodeURIComponent(modelo.slug)}`} className="mt-2 inline-block text-sm underline">Ver referencias e historial de ACARA</Link>

          {/* 3. Para quién es y para quién no */}
          <div className="mt-6 lg:hidden">
            <Encaje modelo={modelo} />
          </div>

          {/* 4. Indicadores */}
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <Indicador
              icon={Fuel}
              label="Consumo"
              valor={modelo.combustible === 'electrico' ? `${modelo.consumoLitros100km.toLocaleString('es-AR')} kWh/10 km` : `${modelo.consumoLitros100km.toLocaleString('es-AR')} L`}
              sub={modelo.combustible === 'electrico' ? 'Eléctrico' : `cada 100 km · ${ETIQUETA_COMBUSTIBLE[modelo.combustible]}`}
            />
            <Indicador icon={Briefcase} label="Baúl" valor={`${formatNumero(modelo.baulLitros)} L`} sub={modelo.segmento === 'pickup' ? 'de carga útil (kg)' : 'con asientos arriba'} />
            <Indicador icon={Armchair} label="Plazas" valor={String(modelo.plazas)} sub={`${modelo.puertas} puertas`} />
            <Indicador icon={Clock} label="Entrega" valor={`${modelo.entregaDias} días`} sub={modelo.entregaDias <= 10 ? 'hay stock' : 'con lista de espera'} />
            <Indicador
              icon={TrendingUp}
              label="Reventa de la marca"
              valor={idxMarca?.retencion36m != null ? `${idxMarca.retencion36m}%` : idxMarca?.retencion12m != null ? `${idxMarca.retencion12m}%` : 'Sin dato'}
              sub={idxMarca?.retencion36m != null ? 'a 3 años' : idxMarca?.retencion12m != null ? 'a 1 año, no hay usados de 3' : 'muestra insuficiente'}
            />
            <Indicador icon={Wrench} label="Repuesto común" valor={pv?.diasRepuestoComun != null ? `${pv.diasRepuestoComun} días` : 'Sin dato'} sub="medido por nosotros" />
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {modelo.usos.map((u) => (
              <span key={u} className="badge badge-neutral">
                {ETIQUETA_USO[u]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Para quién es y para quién no, en ancho completo en desktop */}
      <div className="mt-10 hidden lg:block">
        <Encaje modelo={modelo} />
      </div>

      {/* Reventa medida de este modelo */}
      {idxModelo && (
        <section className="card mt-10 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Índice de reventa SHUKMOTOR</p>
              <h2 className="mt-1 text-2xl md:text-3xl">Cuánto vale este {modelo.nombre} usado</h2>
              <p className="mt-1 max-w-xl text-soft">
                Medimos el precio pedido por usados contra el 0km de hoy. Corte de {formatFecha(idxModelo.fechaCorte)}, sobre{' '}
                {idxModelo.muestra} {idxModelo.muestra === 1 ? 'aviso' : 'avisos'} relevados.
                {idxModelo.muestra < MUESTRA_CHICA && ' Muestra chica: tomalo con pinzas.'}
              </p>
            </div>
            <Link to="/reventa" className="btn btn-ghost btn-sm">
              Ver el índice completo
            </Link>
          </div>
          <dl className="tabular mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { k: 'A 12 meses', v: idxModelo.retencion12m },
              { k: 'A 24 meses', v: idxModelo.retencion24m },
            ].map(({ k, v }) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="font-display text-4xl font-black leading-none">
                  {v != null ? `${v}%` : <span className="text-xl text-soft">Sin dato</span>}
                </dd>
                {v != null && <p className="mt-1 text-xs text-soft">del valor de un 0km</p>}
              </div>
            ))}
            <div>
              <dt className="eyebrow">Muestra</dt>
              <dd className="font-display text-4xl font-black leading-none">{idxModelo.muestra}</dd>
              <p className="mt-1 text-xs text-soft">avisos relevados</p>
            </div>
            <div>
              <dt className="eyebrow">Perdés en 1 año</dt>
              <dd className="font-display text-4xl font-black leading-none text-bad">
                {idxModelo.retencion12m != null ? formatMillones(Math.round((modelo.precioCalleARS * (100 - idxModelo.retencion12m)) / 100)) : '—'}
              </dd>
              <p className="mt-1 text-xs text-soft">sobre el precio de calle</p>
            </div>
          </dl>
          {idxModelo.nota && <p className="mt-4 border-t border-border pt-3 text-sm text-soft">{idxModelo.nota}</p>}
        </section>
      )}

      {/* 5. Opiniones */}
      <section className="mt-12">
        <p className="eyebrow">De dueños, no de prensa</p>
        <h2 className="mt-1 text-3xl md:text-4xl">Qué dicen los que lo tienen</h2>
        <div className="mt-5">
          <Opiniones modelo={modelo} />
        </div>
      </section>

      {/* 6. Videos */}
      {modelo.videoReviews.length > 0 && (
        <section className="mt-12">
          <p className="eyebrow">Video reviews</p>
          <h2 className="mt-1 text-3xl md:text-4xl">Miralo antes de ir a la concesionaria</h2>
          <div className="mt-5">
            <Videos videos={modelo.videoReviews} titulo={nombre} />
          </div>
        </section>
      )}

      {/* 7. Rivales */}
      {rivales.length > 0 && (
        <section className="mt-12">
          <p className="eyebrow">Contra quién compite</p>
          <h2 className="mt-1 text-3xl md:text-4xl">Los que también deberías mirar</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {rivales.map((r) => {
              const rm = marcasPorId[r.marcaId]
              const dr = r.precioCalleARS - modelo.precioCalleARS
              return (
                <Link key={r.id} to={`/modelos/${r.slug}`} className="card card-link flex items-center gap-3 p-4">
                  <LogoMarca marca={rm} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {rm.nombre} {r.nombre}
                    </span>
                    <span className="tabular block text-sm text-soft">
                      {formatMillones(r.precioCalleARS)} · {r.opinionesResumen.promedio.toLocaleString('es-AR')}/5 de dueños
                    </span>
                    <span className={`tabular block text-xs ${dr > 0 ? 'text-warn' : 'text-ok'}`}>
                      {dr > 0 ? `${formatMillones(dr)} más caro` : dr < 0 ? `${formatMillones(-dr)} más barato` : 'mismo precio'}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
          <Link to={`/comparar?m=${[modelo.slug, ...rivales.slice(0, 2).map((r) => r.slug)].join(',')}`} className="btn btn-ghost mt-4">
            <GitCompare className="size-4" aria-hidden />
            Compararlos lado a lado
          </Link>
        </section>
      )}

      {/* 8. Tabs */}
      <section className="mt-12">
        <div className="scroll-x flex gap-1 border-b border-border" role="tablist" aria-label="Detalle del modelo">
          {(
            [
              ['ficha', 'Ficha técnica'],
              ['posventa', 'Posventa'],
              // Sin nada que comprar todavía, la solapa no tendría qué mostrar.
              ...(modelo.estado === 'vigente' ? [['comprar', 'Dónde comprarlo']] : []),
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 font-display text-lg font-bold transition-colors ${
                tab === id ? 'border-accent text-text' : 'border-transparent text-soft hover:text-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {tab === 'ficha' && (
            <div id="panel-ficha" role="tabpanel" aria-labelledby="tab-ficha" className="grid gap-x-10 gap-y-0 md:grid-cols-2">
              <dl className="text-sm">
                <Fila k="Motor" v={modelo.motor} />
                <Fila k="Combustible" v={ETIQUETA_COMBUSTIBLE[modelo.combustible]} />
                <Fila k="Transmisión" v={modelo.transmision === 'automatica' ? 'Automática' : 'Manual'} />
                <Fila k="Tracción" v={modelo.traccion.toUpperCase()} />
                <Fila k="Consumo mixto" v={`${modelo.consumoLitros100km.toLocaleString('es-AR')} ${modelo.combustible === 'electrico' ? 'kWh/10 km' : 'L/100 km'}`} />
                <Fila k="Carrocería" v={modelo.carroceria} />
              </dl>
              <dl className="text-sm">
                <Fila k="Segmento" v={ETIQUETA_SEGMENTO[modelo.segmento]} />
                <Fila k="Plazas" v={String(modelo.plazas)} />
                <Fila k="Puertas" v={String(modelo.puertas)} />
                <Fila k="Baúl" v={`${formatNumero(modelo.baulLitros)} litros`} />
                <Fila k="Año de modelo" v={String(modelo.anio)} />
                <Fila k="Entrega estimada" v={`${modelo.entregaDias} días`} />
              </dl>
            </div>
          )}

          {tab === 'posventa' && (
            <div id="panel-posventa" role="tabpanel" aria-labelledby="tab-posventa" className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl">Lo que declara la marca</h3>
                <dl className="mt-3 text-sm">
                  <Fila k="Service oficial" v={formatARS(modelo.posventa.costoServiceARS)} />
                  <Fila k="Cada" v={`${formatNumero(modelo.posventa.intervaloKm)} km`} />
                  <Fila k="Garantía" v={`${marca.garantiaAnios} años o ${formatNumero(marca.garantiaKm)} km`} />
                  <Fila k="Talleres oficiales" v={`${marca.talleresOficiales} en el país`} />
                  <Fila k="Provincias con service" v={`${marca.provinciasConService.length} de 24`} />
                </dl>
                <p className="mt-3 text-sm text-soft">{modelo.posventa.repuestosNota}</p>
              </div>
              {pv && (
                <div className="card p-5">
                  <p className="eyebrow">Lo que medimos nosotros</p>
                  <h3 className="mt-1 text-2xl">Llamamos a {pv.talleresLlamados} talleres {marca.nombre}</h3>
                  <p className="mt-1 text-sm text-soft">
                    Corte de {formatFecha(pv.fechaCorte)}. Respondieron {pv.talleresRespondieron} de {pv.talleresLlamados}.
                  </p>
                  <dl className="tabular mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-soft">Turno para service</dt>
                      <dd className="font-semibold">{pv.diasTurno != null ? `${pv.diasTurno} días` : 'Sin dato'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-soft">Pastillas de freno</dt>
                      <dd className="font-semibold">{pv.diasRepuestoComun != null ? `${pv.diasRepuestoComun} días` : 'Sin dato'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-soft">Óptica delantera</dt>
                      <dd className="font-semibold">{pv.diasRepuestoCarroceria != null ? `${pv.diasRepuestoCarroceria} días` : 'Sin dato'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-soft">Tenían el repuesto en mostrador</dt>
                      <dd className="font-semibold">
                        {pv.stockEnMostrador} de {pv.talleresRespondieron}
                      </dd>
                    </div>
                  </dl>
                  {pv.nota && <p className="mt-3 border-t border-border pt-3 text-sm text-soft">{pv.nota}</p>}
                  <Link to="/posventa" className="mt-4 inline-block text-sm font-semibold hover:text-accent">
                    Cómo lo medimos y todas las marcas
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === 'comprar' && modelo.estado === 'vigente' && (
            <div id="panel-comprar" role="tabpanel" aria-labelledby="tab-comprar">
              <DondeComprarlo modelo={modelo} />
            </div>
          )}
        </div>
      </section>
    </Container>
  )
}

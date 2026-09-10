import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, ExternalLink, ChartNoAxesCombined } from 'lucide-react'
import { Container } from '../components/ui'
import { useTitle } from '../hooks/useTitle'
import { movimientos, FECHA_ULTIMO_RELEVAMIENTO } from '../data/movimientos'
import { historialPrecios } from '../data/historial-precios'
import { fechaPrecio, FUENTE_ACARA, precioOficial, ultimos30 } from '../lib/precios'
import type { MovimientoPrecio } from '../types'

function Cambios({ lista, vacio }: { lista: MovimientoPrecio[]; vacio: string }) {
  if (!lista.length) return <p className="mt-4 text-soft">{vacio}</p>
  return <ul className="mt-4 divide-y divide-border">{lista.slice(0, 15).map(m => <li key={m.id} className="py-3">
    <p className="font-semibold">{m.marca} {m.modelo} · {m.version}</p>
    <p className="text-sm text-soft">{fechaPrecio(m.fecha)} · {m.tipo.replaceAll('_', ' ')}{m.porcentaje !== null ? ` · ${m.porcentaje > 0 ? '+' : ''}${m.porcentaje.toLocaleString('es-AR')}%` : ''}</p>
    {m.precioLista !== null && <p className="tabular mt-1">{precioOficial(m.precioLista, m.moneda)}</p>}
    {m.modeloSlug && <Link className="text-sm underline" to={`/modelos/${m.modeloSlug}`}>Ver modelo</Link>}
  </li>)}</ul>
}
function Grafico({ puntos, moneda }: { puntos: { fecha: string; precio: number }[]; moneda: string }) {
  if (puntos.length < 2) return <p className="mt-4 text-soft">Tenemos un primer registro. El gráfico aparecerá cuando haya otro relevamiento con una referencia disponible.</p>
  const min = Math.min(...puntos.map(p => p.precio)); const max = Math.max(...puntos.map(p => p.precio))
  const inicio = Date.parse(puntos[0].fecha); const fin = Date.parse(puntos.at(-1)!.fecha)
  const coords = puntos.map(p => `${40 + (Date.parse(p.fecha) - inicio) / (fin - inicio || 1) * 520},${180 - (p.precio - min) / (max - min || 1) * 145}`)
  return <div className="mt-4">
    <svg viewBox="0 0 600 210" role="img" aria-label={`Precio de referencia: de ${precioOficial(puntos[0].precio, moneda)} a ${precioOficial(puntos.at(-1)!.precio, moneda)}. Detalle en la tabla siguiente.`} className="w-full text-accent">
      <path d="M40 20V180H560" fill="none" stroke="currentColor" opacity=".25" />
      <polyline points={coords.join(' ')} fill="none" stroke="currentColor" strokeWidth="3" />
      {coords.map((c, i) => <circle key={i} cx={c.split(',')[0]} cy={c.split(',')[1]} r="4" fill="currentColor" />)}
      <text x="40" y="205" fontSize="12" fill="currentColor">{fechaPrecio(puntos[0].fecha)}</text>
      <text x="560" y="205" textAnchor="end" fontSize="12" fill="currentColor">{fechaPrecio(puntos.at(-1)!.fecha)}</text>
    </svg>
    <p className="text-xs text-soft">Escala vertical: {precioOficial(min, moneda)} a {precioOficial(max, moneda)}. Se muestran observaciones, no precios estimados entre fechas.</p>
  </div>
}
export default function Precios() {
  useTitle('Precios oficiales y movimientos')
  const [params] = useSearchParams()
  const [busqueda, setBusqueda] = useState('')
  const filtradas = historialPrecios.filter(s => (!params.get('modelo') || s.modeloSlug === params.get('modelo')) &&
    `${s.marca} ${s.modelo} ${s.version}`.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')))
  const [id, setId] = useState('')
  const serie = filtradas.find(s => s.id === id) ?? filtradas[0]
  const recientes = ultimos30(movimientos, FECHA_ULTIMO_RELEVAMIENTO)
  const subas = recientes.filter(m => m.tipo === 'suba').sort((a, b) => (b.porcentaje ?? 0) - (a.porcentaje ?? 0))
  const bajas = recientes.filter(m => m.tipo === 'baja').sort((a, b) => (a.porcentaje ?? 0) - (b.porcentaje ?? 0))
  const ultimaFecha = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha
  return <Container className="py-10">
    <p className="eyebrow">Guía oficial de ACARA</p>
    <h1 className="mt-2 text-4xl md:text-5xl">Qué cambió en los precios</h1>
    <p className="mt-4 max-w-3xl text-soft">Último relevamiento: {fechaPrecio(FECHA_ULTIMO_RELEVAMIENTO)}. ACARA actualiza su guía mensualmente; una consulta puede no traer cambios. Son referencias oficiales, no ofertas ni precios de calle.</p>
    <a href={FUENTE_ACARA} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm underline">Consultar fuente y condiciones de ACARA <ExternalLink size={14} aria-hidden /></a>
    <section className="card mt-8 p-6"><h2 className="text-2xl">Últimos movimientos registrados</h2>
      {ultimaFecha && <p className="mt-2 text-sm text-soft">Cambios detectados el {fechaPrecio(ultimaFecha)}. Se listan hasta 15; cada fila corresponde a una versión.</p>}
      <Cambios lista={movimientos.filter(m => m.fecha === ultimaFecha)} vacio="Todavía no hay cambios para comparar. El primer relevamiento establece la base del historial." />
    </section>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <section className="card p-6"><ArrowUpRight aria-hidden className="text-warn" /><h2 className="mt-2 text-2xl">Lo que más aumentó en 30 días</h2><Cambios lista={subas} vacio="No registramos aumentos en esta ventana." /></section>
      <section className="card p-6"><ArrowDownRight aria-hidden className="text-ok" /><h2 className="mt-2 text-2xl">Lo que bajó en 30 días</h2><Cambios lista={bajas} vacio="No registramos bajas en esta ventana." /></section>
    </div>
    <section className="card mt-8 p-6"><ChartNoAxesCombined aria-hidden /><h2 className="mt-2 text-2xl">Historial por versión</h2>
      <p className="mt-2 text-sm text-soft">Cada moneda tiene su propia serie. La versión de la guía puede diferir de la ficha del catálogo.</p>
      {params.get('modelo') && <Link to="/precios" className="mt-3 inline-block text-sm underline">Ver todas las referencias</Link>}
      <label className="mt-5 block text-sm" htmlFor="buscar-precio">Buscar marca, modelo o versión</label>
      <input id="buscar-precio" className="field mt-2 w-full" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Por ejemplo: Toyota Corolla" />
      <label className="mt-4 block text-sm" htmlFor="serie-precio">Versión de ACARA ({filtradas.length})</label>
      <select id="serie-precio" className="field mt-2 w-full min-w-0" value={serie?.id ?? ''} onChange={e => setId(e.target.value)}>
        {!filtradas.length && <option value="">Sin referencias para esta búsqueda</option>}
        {filtradas.map(s => <option key={s.id} value={s.id}>{s.marca} {s.modelo} {s.version} · {s.moneda === '$' ? 'ARS' : 'USD'}{s.vigente ? '' : ' · sin cotización vigente'}</option>)}
      </select>
      {serie && <><Grafico puntos={serie.puntos} moneda={serie.moneda} /><div className="mt-5 overflow-x-auto"><table className="w-full text-sm"><caption className="sr-only">Referencias oficiales de {serie.modelo} {serie.version}</caption><thead><tr className="text-left"><th className="py-2">Fecha</th><th className="py-2">Precio de referencia</th></tr></thead><tbody>{serie.puntos.map(p => <tr key={p.fecha} className="border-t border-border"><td className="py-2">{fechaPrecio(p.fecha)}</td><td className="tabular">{precioOficial(p.precio, serie.moneda)}</td></tr>)}</tbody></table></div></>}
    </section>
    <Link to="/buscar" className="btn btn-primary mt-6">Buscar por presupuesto</Link>
  </Container>
}

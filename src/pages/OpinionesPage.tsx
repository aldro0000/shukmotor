import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { formatNumero, marcasOrdenadas, marcasPorId, modelos, modelosPorId, opiniones } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, SectionHead } from '../components/ui'
import { TarjetaOpinion } from '../components/ficha/Opiniones'

type Orden = 'utiles' | 'recientes' | 'puntaje' | 'km'

export default function OpinionesPage() {
  useTitle('Opiniones de dueños')
  const [params, setParams] = useSearchParams()
  const marca = params.get('marca') ?? ''
  const modeloSlug = params.get('modelo') ?? ''
  const puntajeMin = Number(params.get('puntaje')) || 0
  const orden = (params.get('orden') as Orden) || 'utiles'
  const [limite, setLimite] = useState(24)

  const set = (k: string, v: string) => {
    const q = new URLSearchParams(params)
    if (v) q.set(k, v)
    else q.delete(k)
    if (k === 'marca') q.delete('modelo')
    setParams(q, { replace: true })
    setLimite(24)
  }

  const modelosDeLaMarca = useMemo(
    () => (marca ? modelos.filter((m) => m.marcaId === marca).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) : []),
    [marca],
  )

  const filtradas = useMemo(() => {
    let l = opiniones.filter((o) => modelosPorId[o.modeloId])
    if (marca) l = l.filter((o) => modelosPorId[o.modeloId].marcaId === marca)
    if (modeloSlug) l = l.filter((o) => o.modeloId === modeloSlug)
    if (puntajeMin) l = l.filter((o) => o.puntaje >= puntajeMin)
    switch (orden) {
      case 'recientes':
        return [...l].sort((a, b) => b.fecha.localeCompare(a.fecha))
      case 'puntaje':
        return [...l].sort((a, b) => b.puntaje - a.puntaje || b.util - a.util)
      case 'km':
        return [...l].sort((a, b) => b.kmRecorridos - a.kmRecorridos)
      default:
        return [...l].sort((a, b) => b.util - a.util)
    }
  }, [marca, modeloSlug, puntajeMin, orden])

  const kmTotales = useMemo(() => filtradas.reduce((a, o) => a + o.kmRecorridos, 0), [filtradas])
  const promedio = filtradas.length ? filtradas.reduce((a, o) => a + o.puntaje, 0) / filtradas.length : 0
  const marcasConOpiniones = marcasOrdenadas.filter((m) => modelos.some((x) => x.marcaId === m.id))

  return (
    <Container className="py-10">
      <SectionHead
        eyebrow={`${formatNumero(opiniones.length)} opiniones cargadas`}
        titulo="Lo que dicen los dueños"
        bajada="Son de gente que tiene el auto, con los kilómetros recorridos a la vista. No hay reviews de prensa ni textos de la marca. Nunca pagamos ni cobramos por una opinión."
      />

      <div className="card flex flex-wrap items-end gap-4 p-4">
        <div className="min-w-[180px] flex-1">
          <label htmlFor="f-marca" className="eyebrow">
            Marca
          </label>
          <div className="relative mt-1">
            <select id="f-marca" className="field" value={marca} onChange={(e) => set('marca', e.target.value)}>
              <option value="">Todas las marcas</option>
              {marcasConOpiniones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <label htmlFor="f-modelo" className="eyebrow">
            Modelo
          </label>
          <div className="relative mt-1">
            <select id="f-modelo" className="field" value={modeloSlug} onChange={(e) => set('modelo', e.target.value)} disabled={!marca}>
              <option value="">{marca ? 'Todos los modelos' : 'Elegí una marca primero'}</option>
              {modelosDeLaMarca.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nombre} {m.version}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
          </div>
        </div>
        <div className="min-w-[200px] flex-1">
          <label htmlFor="f-orden" className="eyebrow">
            Ordenar
          </label>
          <div className="relative mt-1">
            <select id="f-orden" className="field" value={orden} onChange={(e) => set('orden', e.target.value)}>
              <option value="utiles">Más útiles</option>
              <option value="recientes">Más recientes</option>
              <option value="puntaje">Mejor puntuadas</option>
              <option value="km">Más kilómetros recorridos</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-soft" aria-hidden />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Puntaje mínimo">
        {[0, 3, 4, 5].map((p) => (
          <Chip key={p} on={puntajeMin === p} onClick={() => set('puntaje', p ? String(p) : '')}>
            {p === 0 ? 'Cualquier puntaje' : p === 5 ? 'Solo 5' : `${p} o más`}
          </Chip>
        ))}
      </div>

      <p className="tabular mt-6 text-sm text-soft" aria-live="polite">
        <strong className="text-text">{filtradas.length}</strong> {filtradas.length === 1 ? 'opinión' : 'opiniones'} ·
        promedio {promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5 ·{' '}
        {formatNumero(kmTotales)} km recorridos entre todos
      </p>

      {filtradas.length === 0 ? (
        <div className="card mt-4 p-6">
          <p className="font-display text-2xl font-bold">Ese filtro no deja nada</p>
          <p className="mt-1 text-soft">Bajá el puntaje mínimo o sacá el modelo para ver todas las opiniones de la marca.</p>
          <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
            Ver todas
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtradas.slice(0, limite).map((o) => {
              const m = modelosPorId[o.modeloId]
              return (
                <div key={o.id}>
                  <Link to={`/modelos/${m.slug}`} className="mb-1.5 block text-sm font-semibold hover:text-accent">
                    {marcasPorId[m.marcaId].nombre} {m.nombre} <span className="font-normal text-soft">{m.version}</span>
                  </Link>
                  <TarjetaOpinion o={o} />
                </div>
              )
            })}
          </div>
          {limite < filtradas.length && (
            <button type="button" className="btn btn-ghost mt-6" onClick={() => setLimite((l) => l + 24)}>
              Ver más opiniones ({filtradas.length - limite} restantes)
            </button>
          )}
        </>
      )}
    </Container>
  )
}

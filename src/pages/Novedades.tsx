import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CategoriaNovedad } from '../types'
import { formatFecha, novedades } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, Img, SectionHead } from '../components/ui'

const CATEGORIAS: { v: CategoriaNovedad | 'todas'; l: string }[] = [
  { v: 'todas', l: 'Todas' },
  { v: 'lanzamiento', l: 'Lanzamientos' },
  { v: 'precios', l: 'Precios' },
  { v: 'comparativa', l: 'Comparativas' },
  { v: 'analisis', l: 'Análisis' },
  { v: 'opiniones', l: 'Opiniones' },
]

export default function Novedades() {
  useTitle('Novedades')
  const [cat, setCat] = useState<CategoriaNovedad | 'todas'>('todas')
  const lista = novedades.filter((n) => cat === 'todas' || n.categoria === cat)
  const [primera, ...resto] = lista

  return (
    <Container className="py-10">
      <SectionHead
        eyebrow={`${novedades.length} notas`}
        titulo="Novedades"
        bajada="Precios, llegadas, comparativas y lo que dicen los dueños. Sin gacetillas de prensa copiadas."
      />
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Categoría">
        {CATEGORIAS.map((c) => (
          <Chip key={c.v} on={cat === c.v} onClick={() => setCat(c.v)}>
            {c.l}
          </Chip>
        ))}
      </div>

      {primera && (
        <Link to={`/novedades/${primera.slug}`} className="card card-link grid overflow-hidden md:grid-cols-[1.4fr_1fr]">
          <span className="card-img block aspect-[16/10]">
            <Img src={primera.imagen} alt="" width={primera.imagenWidth} height={primera.imagenHeight} eager className="h-full w-full object-cover" />
          </span>
          <span className="flex flex-col justify-center p-6">
            <span className="eyebrow">
              {primera.categoria} · {formatFecha(primera.fecha)}
            </span>
            <span className="mt-2 block font-display text-3xl font-extrabold leading-tight md:text-4xl">{primera.titulo}</span>
            <span className="mt-3 block text-soft">{primera.bajada}</span>
          </span>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resto.map((n) => (
          <Link key={n.id} to={`/novedades/${n.slug}`} className="card card-link overflow-hidden">
            <span className="card-img block aspect-[16/10]">
              <Img src={n.imagen} alt="" width={n.imagenWidth} height={n.imagenHeight} className="h-full w-full object-cover" />
            </span>
            <span className="block p-4">
              <span className="eyebrow">
                {n.categoria} · {formatFecha(n.fecha)}
              </span>
              <span className="mt-1 block font-display text-xl font-bold leading-tight">{n.titulo}</span>
              <span className="mt-2 block text-sm text-soft">{n.bajada}</span>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  )
}

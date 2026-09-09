import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { formatFecha, novedades, novedadesPorSlug } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container, Img } from '../components/ui'
import NotFound from './NotFound'

export default function NovedadPage() {
  const { slug = '' } = useParams()
  const nota = novedadesPorSlug[slug]
  useTitle(nota ? nota.titulo : 'Novedad')
  if (!nota) return <NotFound />

  const relacionadas = novedades.filter((n) => n.id !== nota.id && n.categoria === nota.categoria).slice(0, 3)
  const otras = relacionadas.length >= 3 ? relacionadas : [...relacionadas, ...novedades.filter((n) => n.id !== nota.id && !relacionadas.includes(n))].slice(0, 3)

  return (
    <Container className="py-10">
      <article className="mx-auto max-w-3xl">
        <Link to="/novedades" className="inline-flex items-center gap-1 text-sm text-soft hover:text-text">
          <ArrowLeft className="size-4" aria-hidden />
          Novedades
        </Link>
        <p className="eyebrow mt-6">
          {nota.categoria} · {formatFecha(nota.fecha)}
        </p>
        <h1 className="mt-2 text-3xl leading-[1] md:text-5xl">{nota.titulo}</h1>
        <p className="mt-4 text-xl text-soft">{nota.bajada}</p>
        <figure className="card mt-8 overflow-hidden">
          <Img src={nota.imagen} alt="" width={nota.imagenWidth} height={nota.imagenHeight} eager />
          <figcaption className="border-t border-border px-3 py-2 text-xs text-soft">
            Foto: {nota.imagenCredito} · {nota.imagenFuente}
          </figcaption>
        </figure>
        <div className="prose mt-8 text-lg leading-relaxed">
          {nota.cuerpo.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="mt-8 border-t border-border pt-4 text-sm text-soft">
          Redacción SHUKMOTOR. Datos de ejemplo: precios y fechas ilustrativos. No cobramos de marcas ni importadores por
          escribir.
        </p>
      </article>

      <section className="mx-auto mt-14 max-w-5xl">
        <h2 className="text-2xl">Seguir leyendo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {otras.map((n) => (
            <Link key={n.id} to={`/novedades/${n.slug}`} className="card card-link overflow-hidden">
              <span className="card-img block aspect-[16/10]">
                <Img src={n.imagen} alt="" width={n.imagenWidth} height={n.imagenHeight} className="h-full w-full object-cover" />
              </span>
              <span className="block p-4">
                <span className="eyebrow">{formatFecha(n.fecha)}</span>
                <span className="mt-1 block font-display text-lg font-bold leading-tight">{n.titulo}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  )
}

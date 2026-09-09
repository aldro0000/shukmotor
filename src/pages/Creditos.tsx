import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { marcasPorId, modelos, novedades } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, SectionHead } from '../components/ui'

type Credito = {
  clave: string
  donde: string
  a: string
  autor: string
  fuente: string
  cantidad: number
}

/**
 * Créditos de todas las fotos. Las licencias Creative Commons exigen atribuir
 * al autor, y esta página es donde queda junta. Cada foto también lleva su
 * crédito al pie en la ficha donde aparece.
 */
export default function Creditos() {
  useTitle('Créditos de las fotos')
  const [filtro, setFiltro] = useState<'todas' | 'modelos' | 'notas'>('todas')

  const creditos = useMemo(() => {
    const lista: Credito[] = []
    for (const m of modelos) {
      const reales = m.fotos.filter((f) => !f.url.endsWith('.svg'))
      if (reales.length === 0) continue
      // Agrupamos por autor: un fotógrafo suele aportar varias fotos del mismo auto.
      const porAutor = new Map<string, { fuente: string; n: number }>()
      for (const f of reales) {
        const prev = porAutor.get(f.credito)
        porAutor.set(f.credito, { fuente: f.fuente, n: (prev?.n ?? 0) + 1 })
      }
      for (const [autor, v] of porAutor) {
        lista.push({
          clave: `m-${m.slug}-${autor}`,
          donde: 'modelos',
          a: `${marcasPorId[m.marcaId].nombre} ${m.nombre}`,
          autor,
          fuente: v.fuente,
          cantidad: v.n,
        })
      }
    }
    for (const n of novedades) {
      if (n.imagen.endsWith('.svg')) continue
      lista.push({ clave: `n-${n.slug}`, donde: 'notas', a: n.titulo, autor: n.imagenCredito, fuente: n.imagenFuente, cantidad: 1 })
    }
    return lista.sort((a, b) => a.a.localeCompare(b.a, 'es'))
  }, [])

  const mostrados = creditos.filter((c) => filtro === 'todas' || c.donde === filtro)
  const totalFotos = creditos.reduce((a, c) => a + c.cantidad, 0)
  const autores = new Set(creditos.map((c) => c.autor)).size
  const sinFoto = modelos.filter((m) => m.fotos.every((f) => f.url.endsWith('.svg'))).length

  return (
    <Container className="py-10">
      <SectionHead
        eyebrow="Atribución"
        titulo="Créditos de las fotos"
        bajada="Todas las fotos de autos y de notas salen de Wikimedia Commons, con licencia libre. Las licencias Creative Commons exigen nombrar al autor, y acá está la lista completa. Cada foto además lleva su crédito al pie donde aparece."
      />

      <dl className="tabular mb-8 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
        <div>
          <dt className="eyebrow">Fotos con licencia libre</dt>
          <dd className="font-display text-4xl font-black leading-none">{totalFotos}</dd>
        </div>
        <div>
          <dt className="eyebrow">Autores distintos</dt>
          <dd className="font-display text-4xl font-black leading-none">{autores}</dd>
        </div>
        <div>
          <dt className="eyebrow">Modelos con foto real</dt>
          <dd className="font-display text-4xl font-black leading-none">{modelos.length - sinFoto}</dd>
          <p className="mt-1 text-xs text-soft">de {modelos.length}</p>
        </div>
        <div>
          <dt className="eyebrow">Todavía sin foto real</dt>
          <dd className="font-display text-4xl font-black leading-none text-warn">{sinFoto}</dd>
          <p className="mt-1 text-xs text-soft">van con ilustración</p>
        </div>
      </dl>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar créditos">
        {(
          [
            ['todas', 'Todas'],
            ['modelos', 'Fotos de modelos'],
            ['notas', 'Fotos de notas'],
          ] as ['todas' | 'modelos' | 'notas', string][]
        ).map(([v, l]) => (
          <Chip key={v} on={filtro === v} onClick={() => setFiltro(v)}>
            {l}
          </Chip>
        ))}
      </div>

      <div className="scroll-x card">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-soft">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Dónde aparece</th>
              <th scope="col" className="px-4 py-3 font-semibold">Autor</th>
              <th scope="col" className="px-4 py-3 font-semibold">Licencia y fuente</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Fotos</th>
            </tr>
          </thead>
          <tbody>
            {mostrados.map((c) => {
              const url = c.fuente.match(/https?:\/\/\S+/)?.[0]
              const licencia = c.fuente.split(' · ')[0]
              return (
                <tr key={c.clave} className="border-t border-border">
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">{c.a}</th>
                  <td className="px-4 py-2.5 font-medium">{c.autor}</td>
                  <td className="px-4 py-2.5 text-soft">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 hover:text-accent">
                        {licencia}
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    ) : (
                      licencia
                    )}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right">{c.cantidad}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card mt-8 p-5">
        <h2 className="text-2xl">Cómo elegimos las fotos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-soft">
          <li>
            Solo usamos fotos con licencia libre: Creative Commons, dominio público o equivalentes. No publicamos fotos de
            prensa ni de otros medios, porque tienen derechos y no son nuestras.
          </li>
          <li>
            Ninguna foto está generada ni retocada con inteligencia artificial. Una foto inventada de un auto real vale menos
            que no tener foto.
          </li>
          <li>
            Las fotos son del modelo global, que puede tener diferencias de equipamiento o de frente con la versión que se
            vende en Argentina. Cuando la diferencia importa, lo decimos en la ficha.
          </li>
          <li>
            Los modelos sin foto real llevan una ilustración, marcada como tal. Preferimos eso antes que poner la foto de otro
            auto parecido.
          </li>
          <li>
            Si sos el autor de una foto y querés que la saquemos o que cambiemos cómo te acreditamos, escribinos y lo hacemos.
          </li>
        </ul>
        <Link to="/novedades/independencia-editorial-como-trabajamos" className="mt-4 inline-block text-sm font-semibold hover:text-accent">
          Cómo trabajamos y de qué vivimos
        </Link>
      </div>
    </Container>
  )
}

import { useEffect, useState } from 'react'
import { Play, X } from 'lucide-react'
import type { VideoReview } from '../../types'
import { formatDuracion, formatFecha } from '../../data'
import { Img } from '../ui'

/**
 * Fila de video reviews. El iframe de YouTube NO se carga hasta el click:
 * hasta entonces solo hay una miniatura local con el botón de play.
 */
export function Videos({ videos, titulo }: { videos: VideoReview[]; titulo: string }) {
  const [abierto, setAbierto] = useState<VideoReview | null>(null)

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [abierto])

  if (videos.length === 0) return null

  return (
    <section aria-label={`Video reviews de ${titulo}`}>
      <div className="scroll-x">
        <ul className="flex gap-4 pb-2 md:grid md:grid-cols-3" role="list">
          {videos.map((v) => (
            <li key={v.youtubeId} className="w-[280px] shrink-0 md:w-auto">
              <article className="card card-link h-full overflow-hidden">
                <button type="button" onClick={() => setAbierto(v)} className="group relative block w-full text-left" aria-label={`Reproducir: ${v.titulo}, del canal ${v.canal}`}>
                  <span className="card-img block aspect-video">
                    <Img src={v.miniatura} alt="" width={1280} height={720} className="h-full w-full object-cover" />
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-text transition-transform group-hover:scale-110">
                      <Play className="size-6 fill-current" aria-hidden />
                    </span>
                  </span>
                  <span className="tabular absolute bottom-2 right-2 rounded-sm bg-[#0E1114]/85 px-1.5 py-0.5 text-xs font-semibold text-[#ECEFF2]">
                    {formatDuracion(v.duracionSeg)}
                  </span>
                </button>
                <div className="p-3">
                  <p className="font-semibold leading-snug">{v.titulo}</p>
                  <p className="tabular mt-1 text-xs text-soft">
                    {v.canal} · {formatFecha(v.fecha)}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs text-soft">
        Los videos son de canales independientes. No pagamos ni cobramos por aparecer en ellos.
      </p>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
          role="dialog"
          aria-modal="true"
          aria-label={abierto.titulo}
          onClick={() => setAbierto(null)}
        >
          <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="min-w-0 text-[#ECEFF2]">
                <p className="truncate font-semibold">{abierto.titulo}</p>
                <p className="text-sm text-[#9AA3AD]">{abierto.canal}</p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(null)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#3A424B] px-3 py-1.5 text-sm text-[#ECEFF2] hover:bg-[#171B20]"
                aria-label="Cerrar (Escape)"
                autoFocus
              >
                <X className="size-4" aria-hidden />
                Cerrar
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-md border border-[#3A424B] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${abierto.youtubeId}?autoplay=1&rel=0`}
                title={abierto.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

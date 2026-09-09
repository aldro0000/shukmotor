import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import type { Foto } from '../../types'
import { Img } from '../ui'
import { srcSetDe } from '../../lib/imagenes'
import { CreditoFoto } from './CreditoFoto'

/**
 * Galería de fotos: flechas, arrastre (mouse y dedo), teclado, vista ampliada
 * con fondo oscurecido y cierre con Escape. Solo la primera foto se carga de
 * entrada; el resto se carga al interactuar. Crédito y fuente siempre visibles
 * en la vista ampliada.
 */
export function Galeria({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [i, setI] = useState(0)
  const [ampliada, setAmpliada] = useState(false)
  const [vistas, setVistas] = useState<Set<number>>(() => new Set([0]))
  const inicioX = useRef<number | null>(null)
  const arrastrando = useRef(false)

  const ir = useCallback(
    (n: number) => {
      const idx = (n + fotos.length) % fotos.length
      setI(idx)
      setVistas((v) => (v.has(idx) ? v : new Set(v).add(idx)))
    },
    [fotos.length],
  )

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(i + 1)
      else if (e.key === 'ArrowLeft') ir(i - 1)
      else if (e.key === 'Escape') setAmpliada(false)
    },
    [i, ir],
  )

  useEffect(() => {
    if (!ampliada) return
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [ampliada, onKey])

  const onPointerDown = (e: ReactPointerEvent) => {
    inicioX.current = e.clientX
    arrastrando.current = true
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    if (!arrastrando.current || inicioX.current === null) return
    const dx = e.clientX - inicioX.current
    arrastrando.current = false
    inicioX.current = null
    if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1)
  }

  const foto = fotos[i]

  // Con una sola imagen no hay galería: sin flechas, sin contador y sin tira de
  // miniaturas. Un carrusel de un elemento promete algo que no está.
  if (fotos.length < 2) {
    const unica = fotos[0]
    if (!unica) return null
    return (
      <section aria-label={`Foto de ${titulo}`} className="min-w-0">
        <figure className="relative overflow-hidden rounded-md border border-border bg-skeleton" style={{ aspectRatio: '16 / 10' }}>
          <img
            src={unica.url}
            srcSet={srcSetDe(unica.url)}
            sizes="(max-width: 1024px) 100vw, 60vw"
            alt={unica.alt}
            width={unica.width}
            height={unica.height}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <CreditoFoto foto={unica} />
        </figure>
        {unica.esIlustracion && (
          <p className="mt-2 text-xs text-soft">
            Ilustración nuestra: todavía no conseguimos una foto de este modelo con licencia libre.
          </p>
        )}
      </section>
    )
  }

  return (
    <section aria-label={`Fotos de ${titulo}`} className="min-w-0">
      <div
        className="group relative select-none overflow-hidden rounded-md border border-border bg-skeleton"
        style={{ aspectRatio: '16 / 10' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          arrastrando.current = false
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') ir(i + 1)
          if (e.key === 'ArrowLeft') ir(i - 1)
          if (e.key === 'Enter') setAmpliada(true)
        }}
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label={`Foto ${i + 1} de ${fotos.length}`}
      >
        {fotos.map((f, idx) =>
          vistas.has(idx) ? (
            <img
              key={f.url}
              src={f.url}
              srcSet={srcSetDe(f.url)}
              sizes="(max-width: 1024px) 100vw, 60vw"
              alt={f.alt}
              width={f.width}
              height={f.height}
              loading={idx === 0 ? 'eager' : 'lazy'}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={idx !== i}
            />
          ) : null,
        )}

        <button
          type="button"
          onClick={() => ir(i - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-bg/80 p-2 text-text opacity-0 backdrop-blur transition-opacity hover:bg-bg group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => ir(i + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-bg/80 p-2 text-text opacity-0 backdrop-blur transition-opacity hover:bg-bg group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Foto siguiente"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/80 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-bg"
          aria-label="Ver ampliada"
        >
          <Maximize2 className="size-3.5" aria-hidden />
          Ampliar
        </button>
        <p className="tabular absolute bottom-3 left-3 rounded-full border border-border bg-bg/80 px-2.5 py-1 text-xs backdrop-blur">
          {i + 1} / {fotos.length}
        </p>
        <CreditoFoto foto={foto} className="bottom-3 right-3" />
      </div>

      <ul className="scroll-x mt-2 flex gap-2 pb-1" role="list">
        {fotos.map((f, idx) => (
          <li key={f.url} className="shrink-0">
            <button
              type="button"
              onClick={() => ir(idx)}
              className={`block w-20 overflow-hidden rounded-sm border md:w-24 ${idx === i ? 'border-accent' : 'border-border hover:border-text-soft'}`}
              aria-label={`Ver ${f.alt}`}
              aria-current={idx === i ? 'true' : undefined}
            >
              <Img src={f.url} alt="" width={f.width} height={f.height} sizes="96px" />
            </button>
          </li>
        ))}
      </ul>

      {ampliada && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${titulo}, foto ampliada`}
          onClick={() => setAmpliada(false)}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-[#ECEFF2]">
            <p className="tabular">
              {i + 1} / {fotos.length} · {foto.alt}
            </p>
            <button
              type="button"
              onClick={() => setAmpliada(false)}
              className="inline-flex items-center gap-1 rounded-full border border-[#3A424B] px-3 py-1.5 hover:bg-[#171B20]"
              aria-label="Cerrar (Escape)"
              autoFocus
            >
              <X className="size-4" aria-hidden />
              Cerrar
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => ir(i - 1)}
              className="absolute left-4 rounded-full border border-[#3A424B] bg-[#171B20]/80 p-3 text-[#ECEFF2] hover:bg-[#171B20]"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <img
              src={foto.url}
              srcSet={srcSetDe(foto.url)}
              sizes="100vw"
              alt={foto.alt}
              width={foto.width}
              height={foto.height}
              className="max-h-full w-auto max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => ir(i + 1)}
              className="absolute right-4 rounded-full border border-[#3A424B] bg-[#171B20]/80 p-3 text-[#ECEFF2] hover:bg-[#171B20]"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </div>
          <p className="px-4 py-3 text-center text-xs text-[#9AA3AD]">
            Foto: <strong className="text-[#ECEFF2]">{foto.credito}</strong> · Fuente: {foto.fuente}
          </p>
        </div>
      )}
    </section>
  )
}

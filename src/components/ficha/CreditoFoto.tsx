import { useEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import type { Foto } from '../../types'

/**
 * Crédito de la foto como ícono en la esquina, no como dos renglones de texto
 * con la URL a la vista. Se abre al pasar el mouse o al tocarlo, y ahí sí
 * aparecen autor, licencia y enlace: la atribución se cumple igual y el diseño
 * no se rompe. La lista completa vive en /creditos.
 */
export function CreditoFoto({ foto, className = '' }: { foto: Foto; className?: string }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const etiqueta = foto.esIlustracion ? 'Ver de dónde sale esta ilustración' : 'Ver el crédito de la foto'

  return (
    <div
      ref={caja}
      className={`absolute bottom-2 right-2 z-10 ${className}`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={etiqueta}
        title={etiqueta}
        className="inline-flex size-7 items-center justify-center rounded-full border border-border bg-bg/85 text-soft backdrop-blur transition-colors hover:text-text focus-visible:text-text"
      >
        <Info className="size-3.5" aria-hidden />
      </button>

      {abierto && (
        <div
          role="note"
          className="absolute bottom-9 right-0 w-64 rounded-md border border-border bg-surface p-3 text-left shadow-sm"
        >
          {foto.esIlustracion ? (
            <p className="text-xs leading-relaxed text-soft">
              Ilustración de SHUKMOTOR. Todavía no conseguimos una foto de este modelo con licencia libre, y preferimos eso
              antes que mostrar el auto de otro.
            </p>
          ) : (
            <>
              <p className="eyebrow">Foto de</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug">{foto.credito}</p>
              <p className="mt-1.5 text-xs text-soft">{foto.fuente}</p>
              {foto.pagina && (
                <a
                  href={foto.pagina}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-2 inline-block text-xs font-semibold hover:text-accent"
                >
                  Ver el original
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

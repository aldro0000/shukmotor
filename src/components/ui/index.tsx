import { useState, type ComponentProps, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Veredicto } from '../../types'
import { ETIQUETA_VEREDICTO, LEYENDA_DATOS, logoEsClaro } from '../../data'
import { srcSetDe } from '../../lib/imagenes'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`container-x ${className}`}>{children}</div>
}

export function SectionHead({
  eyebrow,
  titulo,
  bajada,
  accion,
  className = '',
}: {
  eyebrow?: string
  titulo: string
  bajada?: string
  accion?: { to: string; label: string }
  className?: string
}) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-2xl md:text-3xl">{titulo}</h2>
        {bajada && <p className="mt-1 max-w-2xl text-soft">{bajada}</p>}
      </div>
      {accion && (
        <Link to={accion.to} className="group inline-flex items-center gap-1 text-sm font-semibold text-text hover:text-accent">
          {accion.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  )
}

export function DatosEjemplo({ className = '' }: { className?: string }) {
  return (
    <p className={`inline-flex items-center gap-1.5 text-xs text-soft ${className}`}>
      <span className="inline-block size-1.5 rounded-full bg-warn" aria-hidden />
      {LEYENDA_DATOS}: precios ilustrativos
    </p>
  )
}

export function Chip({
  on,
  children,
  ...rest
}: { on?: boolean; children: ReactNode } & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button type="button" className="chip" aria-pressed={on ? 'true' : 'false'} {...rest}>
      {children}
    </button>
  )
}

const CLASE_VEREDICTO: Record<Veredicto, string> = {
  conviene: 'badge-ok',
  'con reparos': 'badge-warn',
  'no conviene': 'badge-bad',
}

export function VeredictoBadge({ veredicto, grande = false }: { veredicto: Veredicto; grande?: boolean }) {
  return (
    <span className={`badge ${CLASE_VEREDICTO[veredicto]} ${grande ? 'px-3 py-1 text-sm' : ''}`}>
      {ETIQUETA_VEREDICTO[veredicto]}
    </span>
  )
}

export function Stat({ label, valor, sub, className = '' }: { label: string; valor: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="eyebrow truncate">{label}</p>
      <p className="tabular mt-0.5 font-display text-2xl font-bold leading-none">{valor}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-soft">{sub}</p>}
    </div>
  )
}

export function Img({
  src,
  alt,
  width,
  height,
  eager = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: {
  src: string
  alt: string
  width: number
  height: number
  eager?: boolean
  className?: string
  /** Qué tan ancha se ve la imagen en cada breakpoint. */
  sizes?: string
}) {
  const srcSet = srcSetDe(src)
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      fetchPriority={eager ? 'high' : 'auto'}
      className={className}
    />
  )
}

/** Iniciales de una marca, para cuando no hay logo. */
function inicialesDe(nombre: string): string {
  const partes = nombre.replace(/[&]/g, ' ').split(/[\s-]+/).filter(Boolean)
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

/**
 * Logo de marca. Dos reglas:
 *
 * 1. Si no hay archivo de logo, o si el que hay no carga, NO se renderiza un
 *    <img>: se muestran las iniciales de la marca en la misma caja. Un cuadrado
 *    vacío se lee como error; las iniciales se leen como decisión.
 * 2. Los logos reales suelen ser negros y en modo oscuro desaparecerían, así que
 *    van sobre base clara. Los que son casi blancos, sobre base oscura.
 */
export function LogoMarca({
  marca,
  size = 40,
  className = '',
}: {
  marca: { logo?: string; nombre: string; slug?: string }
  size?: number
  className?: string
}) {
  const [fallo, setFallo] = useState(false)
  const claro = marca.slug ? logoEsClaro(marca.slug) : false
  const base = `shrink-0 rounded-full ${claro ? 'bg-[#171B20]' : 'bg-white'} ${className}`
  const caja = { width: size, height: size } as const

  if (!marca.logo || fallo) {
    return (
      <span
        aria-hidden
        title={marca.nombre}
        className={`inline-flex items-center justify-center border border-border bg-surface-2 font-display font-bold leading-none text-soft ${className} shrink-0 rounded-full`}
        style={{ ...caja, fontSize: Math.max(9, Math.round(size * 0.36)), letterSpacing: '-0.02em' }}
      >
        {inicialesDe(marca.nombre)}
      </span>
    )
  }

  return (
    <img
      src={marca.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
      className={`${base} object-contain p-[2px]`}
      style={caja}
    />
  )
}

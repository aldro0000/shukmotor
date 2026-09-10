import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, X, Search } from 'lucide-react'
import { BotonMoneda } from './BotonMoneda'
import { useTheme } from '../../hooks/useTheme'

const NAV = [
  { to: '/novedades', label: 'Novedades' },
  { to: '/reventa', label: 'Reventa' },
  { to: '/posventa', label: 'Posventa' },
  { to: '/marcas', label: 'Marcas' },
  { to: '/opiniones', label: 'Opiniones' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/financiacion', label: 'Financiación' },
]

export function Header() {
  const { tema, alternar } = useTheme()
  const { pathname } = useLocation()
  // El menú se cierra solo al navegar: recuerda en qué ruta se abrió.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null)
  const abierto = abiertoEn === pathname
  const setAbierto = (v: boolean) => setAbiertoEn(v ? pathname : null)

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbiertoEn(null)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/92 backdrop-blur">
      <div className="container-x flex h-14 items-center justify-between gap-4">
        <Link to="/" className="wordmark shrink-0" aria-label="SHUKMOTOR, inicio">
          SHUK<em>MOTOR</em>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-5 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="nav-link shrink-0">
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <BotonMoneda />
          <Link to="/buscar" className="btn btn-primary btn-sm hidden sm:inline-flex">
            <Search className="size-4" aria-hidden />
            Qué me conviene
          </Link>
          <button
            type="button"
            onClick={alternar}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-soft hover:bg-surface-2 hover:text-text sm:size-9"
            aria-label={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {tema === 'dark' ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-soft hover:bg-surface-2 hover:text-text sm:size-9 lg:hidden"
            aria-expanded={abierto}
            aria-controls="menu-mobile"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {abierto ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {abierto && (
        <div id="menu-mobile" className="drawer fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto border-t border-border bg-bg lg:hidden">
          <nav className="container-x flex flex-col py-2" aria-label="Principal móvil">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-border py-4 font-display text-2xl font-bold ${isActive ? 'text-accent' : ''}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/buscar" className="btn btn-primary mt-6">
              <Search className="size-4" aria-hidden />
              Qué auto me conviene
            </Link>
            <p className="mt-6 text-sm text-soft">
              No cobramos de marcas ni importadores. Los espacios pagos se marcan como tales.
            </p>
          </nav>
        </div>
      )}
    </header>
  )
}

import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

const COLUMNAS = [
  {
    titulo: 'Elegir',
    links: [
      { to: '/buscar', label: 'Buscar por presupuesto' },
      { to: '/marcas', label: 'Todas las marcas' },
      { to: '/calendario', label: 'Calendario de llegadas' },
      { to: '/financiacion', label: 'Cómo financiar un 0km' },
    ],
  },
  {
    titulo: 'Leer',
    links: [
      { to: '/novedades', label: 'Novedades' },
      { to: '/como-trabajamos', label: 'Cómo trabajamos' },
      { to: '/novedades/reventa-2026-que-marcas-mantienen-valor', label: 'Reventa 2026' },
      { to: '/creditos', label: 'Créditos de las fotos' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <p className="wordmark">
            SHUK<em>MOTOR</em>
          </p>
          <p className="mt-3 max-w-md text-sm text-soft">
            Todo lo que se vende en Argentina, con fotos reales, opiniones de dueños y video reviews. Partimos de tu
            presupuesto, no de un catálogo.
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-md border border-border bg-bg p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
            <div className="text-sm">
              <p className="font-semibold">Regla de independencia</p>
              <p className="mt-1 text-soft">
                No cobramos de marcas ni importadores por escribir. Los veredictos, puntajes y el orden del buscador no se
                venden. Los espacios publicitarios se marcan siempre como "Espacio patrocinado" y algunos links de compra
                pueden generarnos una comisión.
              </p>
            </div>
          </div>
        </div>
        {COLUMNAS.map((c) => (
          <div key={c.titulo}>
            <p className="eyebrow">{c.titulo}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-text hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-soft">
          <p>© 2026 SHUKMOTOR. Hecho en Argentina.</p>
          <p>Datos de ejemplo: precios, tasas y fechas son ilustrativos.</p>
        </div>
      </div>
    </footer>
  )
}

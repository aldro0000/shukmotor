import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useMoneda } from '../../hooks/monedaContexto'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function Layout() {
  // Los precios se formatean leyendo un store que vive fuera de React, para no
  // tener que pasar la moneda por parámetro a los sesenta lugares que muestran
  // plata. Suscribir el layout hace que al cambiar de moneda se vuelva a dibujar
  // el árbol entero, que es lo que hace falta para que todos esos precios se
  // actualicen a la vez.
  useMoneda()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-text"
      >
        Ir al contenido
      </a>
      <ScrollToTop />
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

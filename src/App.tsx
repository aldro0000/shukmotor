import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Home from './pages/Home'

/**
 * Home va en el bundle inicial. El resto se carga al navegar, para que la
 * portada abra rápido en un celular.
 */
const Buscar = lazy(() => import('./pages/Buscar'))
const Marcas = lazy(() => import('./pages/Marcas'))
const MarcaPage = lazy(() => import('./pages/MarcaPage'))
const ModeloPage = lazy(() => import('./pages/ModeloPage'))
const Comparar = lazy(() => import('./pages/Comparar'))
const OpinionesPage = lazy(() => import('./pages/OpinionesPage'))
const Reventa = lazy(() => import('./pages/Reventa'))
const Posventa = lazy(() => import('./pages/Posventa'))
const Calendario = lazy(() => import('./pages/Calendario'))
const Financiacion = lazy(() => import('./pages/Financiacion'))
const Cotizar = lazy(() => import('./pages/Cotizar'))
const Novedades = lazy(() => import('./pages/Novedades'))
const NovedadPage = lazy(() => import('./pages/NovedadPage'))
const Creditos = lazy(() => import('./pages/Creditos'))
const ComoTrabajamos = lazy(() => import('./pages/ComoTrabajamos'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Placeholder de carga: ocupa alto para que el layout no salte. */
function Cargando() {
  return (
    <div className="container-x py-20" role="status" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <div className="h-8 w-48 animate-pulse rounded-sm bg-skeleton" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-sm bg-skeleton" />
      <div className="mt-2 h-4 w-2/3 max-w-md animate-pulse rounded-sm bg-skeleton" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Suspense fallback={<Cargando />}>
              <Layout />
            </Suspense>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/marcas" element={<Marcas />} />
          <Route path="/marcas/:slug" element={<MarcaPage />} />
          <Route path="/modelos/:slug" element={<ModeloPage />} />
          <Route path="/comparar" element={<Comparar />} />
          <Route path="/opiniones" element={<OpinionesPage />} />
          <Route path="/reventa" element={<Reventa />} />
          <Route path="/posventa" element={<Posventa />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/financiacion" element={<Financiacion />} />
          <Route path="/cotizar" element={<Cotizar />} />
          <Route path="/novedades" element={<Novedades />} />
          <Route path="/novedades/:slug" element={<NovedadPage />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/como-trabajamos" element={<ComoTrabajamos />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

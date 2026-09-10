import { createContext, useContext } from 'react'
import type { Moneda } from '../lib/moneda'
import type { EstadoDolar } from './useDolar'

/**
 * El contexto y su hook viven acá, separados del proveedor, porque el
 * refresco en caliente de Vite sólo funciona si un archivo exporta
 * componentes o cosas que no son componentes, nunca las dos.
 */

export type CtxMoneda = {
  moneda: Moneda
  cambiar: (m: Moneda) => void
  alternar: () => void
  dolar: EstadoDolar
}

export const MonedaCtx = createContext<CtxMoneda | null>(null)

export function useMoneda(): CtxMoneda {
  const c = useContext(MonedaCtx)
  if (!c) throw new Error('useMoneda necesita estar dentro de <MonedaProvider>')
  return c
}

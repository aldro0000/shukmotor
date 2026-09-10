import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fijarMoneda, type Moneda } from '../lib/moneda'
import { MonedaCtx, type CtxMoneda } from './monedaContexto'
import { useDolar } from './useDolar'

/**
 * Moneda elegida por quien mira, con la cotización que le corresponde.
 *
 * El estado se escribe en el store de `lib/moneda` antes de cada render, así
 * los formateadores y las frases que arma `lib/encaje` ya salen en la moneda
 * correcta sin recibir nada por parámetro.
 */

const CLAVE = 'shukmotor:moneda'

function leerGuardada(): Moneda {
  try {
    return localStorage.getItem(CLAVE) === 'USD' ? 'USD' : 'ARS'
  } catch {
    // Modo privado o cookies bloqueadas: pesos, que es el default del país.
    return 'ARS'
  }
}

export function MonedaProvider({ children }: { children: ReactNode }) {
  const [moneda, setMoneda] = useState<Moneda>(leerGuardada)
  const dolar = useDolar()

  // Antes de pintar: si el store quedara desactualizado, un render mostraría
  // precios de la moneda anterior.
  fijarMoneda({ moneda, dolar: dolar.valor })

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, moneda)
    } catch {
      // Que no se pueda recordar la preferencia no es motivo para romper nada.
    }
  }, [moneda])

  const valor = useMemo<CtxMoneda>(
    () => ({
      moneda,
      cambiar: setMoneda,
      alternar: () => setMoneda((m) => (m === 'ARS' ? 'USD' : 'ARS')),
      dolar,
    }),
    [moneda, dolar],
  )

  return <MonedaCtx.Provider value={valor}>{children}</MonedaCtx.Provider>
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { DOLAR_RESPALDO } from '../lib/moneda'

/**
 * Cotización del dólar oficial, en vivo.
 *
 * No leemos dolarhoy.com ni ningún otro sitio: sacarle el número al HTML de una
 * página es scraping, que este proyecto no hace, y además el navegador lo
 * bloquearía porque esos sitios no habilitan CORS. Usamos APIs públicas que
 * publican el mismo dato oficial en JSON y permiten el pedido desde el
 * navegador. La fuente que respondió se muestra en pantalla.
 *
 * El valor es el de venta, que es lo que cuesta comprar un dólar: es el que
 * corresponde para pasar un precio en pesos a dólares.
 */

const FUENTES = [
  {
    nombre: 'DolarAPI',
    url: 'https://dolarapi.com/v1/dolares/oficial',
    sitio: 'https://dolarapi.com',
    leer: (d: { venta?: number; fechaActualizacion?: string }) => ({
      valor: d.venta,
      fecha: d.fechaActualizacion,
    }),
  },
  {
    nombre: 'Bluelytics',
    url: 'https://api.bluelytics.com.ar/v2/latest',
    sitio: 'https://bluelytics.com.ar',
    leer: (d: { oficial?: { value_sell?: number }; last_update?: string }) => ({
      valor: d.oficial?.value_sell,
      fecha: d.last_update,
    }),
  },
] as const

/** Cada cinco minutos. El oficial se mueve una vez por día, pero así el valor nunca queda viejo. */
const CADA_MS = 5 * 60 * 1000

export type EstadoDolar = {
  valor: number
  /** 'vivo' = lo trajimos recién. 'respaldo' = ninguna fuente contestó. */
  estado: 'cargando' | 'vivo' | 'respaldo'
  fuente: string
  sitio: string
  /** Cuándo lo actualizó la fuente, en ISO. */
  actualizado: string | null
}

const INICIAL: EstadoDolar = {
  valor: DOLAR_RESPALDO,
  estado: 'cargando',
  fuente: '',
  sitio: '',
  actualizado: null,
}

export function useDolar(): EstadoDolar & { refrescar: () => void } {
  const [d, setD] = useState<EstadoDolar>(INICIAL)
  // Evita pisar el estado si el componente se desmontó mientras esperábamos.
  const vivo = useRef(true)

  const traer = useCallback(async () => {
    for (const f of FUENTES) {
      try {
        const r = await fetch(f.url, { headers: { Accept: 'application/json' } })
        if (!r.ok) continue
        const { valor, fecha } = f.leer(await r.json())
        if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) continue
        if (!vivo.current) return
        setD({ valor, estado: 'vivo', fuente: f.nombre, sitio: f.sitio, actualizado: fecha ?? null })
        return
      } catch {
        // Sin internet o la fuente caída: probamos la que sigue.
      }
    }
    if (vivo.current) setD((p) => (p.estado === 'vivo' ? p : { ...INICIAL, estado: 'respaldo' }))
  }, [])

  useEffect(() => {
    vivo.current = true
    // El linter avisa por el setState dentro del efecto, pero acá es exactamente
    // para lo que sirve un efecto: sincronizar con un sistema externo. `traer`
    // espera la respuesta HTTP antes de tocar el estado, así que no encadena
    // renders.
    void traer()
    const id = setInterval(() => void traer(), CADA_MS)
    // Al volver a la pestaña, y al recuperar internet, conviene revisar ya.
    const alVolver = () => {
      if (document.visibilityState === 'visible') void traer()
    }
    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('online', alVolver)
    return () => {
      vivo.current = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('online', alVolver)
    }
  }, [traer])

  return { ...d, refrescar: () => void traer() }
}

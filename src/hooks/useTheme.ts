import { useCallback, useEffect, useState } from 'react'

export type Tema = 'dark' | 'light'

function leer(): Tema {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(() => (typeof document === 'undefined' ? 'dark' : leer()))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    try {
      localStorage.setItem('shuk-theme', tema)
    } catch {
      /* sin storage, sin drama */
    }
  }, [tema])

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { tema, alternar }
}

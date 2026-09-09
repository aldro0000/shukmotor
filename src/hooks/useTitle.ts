import { useEffect } from 'react'

export function useTitle(titulo: string) {
  useEffect(() => {
    const previo = document.title
    document.title = titulo ? `${titulo} · SHUKMOTOR` : 'SHUKMOTOR — Qué auto me conviene'
    return () => {
      document.title = previo
    }
  }, [titulo])
}

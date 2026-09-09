/**
 * Las fotos se guardan en tres anchos: 360 para grillas, 720 para cards
 * grandes y 1200 para la galería. Si la URL termina en -1200.webp armamos el
 * srcset con los tres, para que un celular no baje una imagen de escritorio.
 */
export const ANCHOS_FOTO = [360, 720, 1200] as const

export function srcSetDe(src: string): string | undefined {
  if (!/-1200\.webp$/.test(src)) return undefined
  const base = src.replace(/-1200\.webp$/, '')
  return ANCHOS_FOTO.map((w) => `${base}-${w}.webp ${w}w`).join(', ')
}

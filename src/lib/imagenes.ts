/**
 * Las fotos se guardan en dos anchos: 360 para grillas y 720 para cards
 * grandes y galería. Si la URL termina en -720.webp armamos el srcset con los
 * dos, para que un celular no baje una imagen de escritorio.
 */
export const ANCHOS_FOTO = [360, 720] as const

export function srcSetDe(src: string): string | undefined {
  if (!/-720\.webp$/.test(src)) return undefined
  const base = src.replace(/-720\.webp$/, '')
  return ANCHOS_FOTO.map((w) => `${base}-${w}.webp ${w}w`).join(', ')
}

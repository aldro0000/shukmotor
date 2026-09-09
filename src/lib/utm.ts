/** Agrega UTM sin pisar parámetros existentes de la URL destino. */
export function conUtm(url: string, modeloSlug: string, tienda: string): string {
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', 'shukmotor')
    u.searchParams.set('utm_medium', 'referral')
    u.searchParams.set('utm_campaign', 'ficha-modelo')
    u.searchParams.set('utm_content', modeloSlug)
    u.searchParams.set('utm_term', tienda.toLowerCase().replace(/\s+/g, '-'))
    return u.toString()
  } catch {
    return url
  }
}

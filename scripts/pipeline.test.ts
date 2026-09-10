import test from 'node:test'
import assert from 'node:assert/strict'
import { parsearFeed } from './rss'
import { canonico } from './radar'
import { menciona } from './pipeline-utils'
import { cabeEnCuota, diaCuota, duracionISO, seleccionar } from './videos'
import { generarNotas } from './borradores'
import { publicarSeleccionados } from './publicar-borradores'
import { resumenModelo, ultimos30 } from '../src/lib/precios'
import type { MovimientoPrecio } from '../src/types'
import { acumularMovimientos, detectarCambios, type Estado } from './diff-precios'

const mov = (id: string, fecha = '2026-09-10', version = '1.6'): MovimientoPrecio => ({
  id, fecha, version, marca: 'Toyota', modelo: 'Corolla', tipo: 'suba', moneda: '$',
  precioLista: 42000000, precioAnterior: 40000000, precioListaARS: 42000000, precioAnteriorARS: 40000000,
  porcentaje: 5, modeloSlug: 'toyota-corolla-xli', diasDesdeCambioAnterior: 30,
})
test('RSS real Motor1: el helper dinámico extrae título, URL y fecha', () => {
  const xml = `<rss><channel><item><title>Hyundai Could Turn Its Best Seller Into A 350-HP Performance SUV</title><description><![CDATA[NO REPUBLICAR ESTA PROSA]]></description><pubDate>Wed, 09 Sep 2026 23:00:00 +0000</pubDate><link>https://www.motor1.com/news/807726/hyundai-tucson-n-hybrid-powertrain-rumor/</link></item></channel></rss>`
  const r = parsearFeed(xml)
  assert.equal(r.length, 1)
  assert.equal(r[0].fecha, '2026-09-09T23:00:00.000Z')
  assert.match(r[0].titulo, /^Hyundai/)
  assert.equal(JSON.stringify(r).includes('NO REPUBLICAR'), false)
})
test('Google News, CDATA, entidades, fechas inválidas y protocolos', () => {
  const r = parsearFeed('<rss><item><title><![CDATA[Citroën &amp; Peugeot - Medio]]></title><source url="https://medio.ar">Medio</source><pubDate>fecha rota</pubDate><link>https://medio.ar/nota?a=1&amp;b=2</link></item><item><title>Malo</title><link>javascript:alert(1)</link></item></rss>')
  assert.deepEqual(r, [{ titulo: 'Citroën & Peugeot', fuente: 'Medio', fecha: null, link: 'https://medio.ar/nota?a=1&b=2' }])
})
test('Canonicalización y matching no confunden Polo con Polonia ni 208 sin marca', () => {
  assert.equal(canonico('https://medio.ar/nota/?utm_source=x#foto'), 'https://medio.ar/nota')
  assert.equal(canonico('https://medio.ar/?id=9&utm_campaign=x'), 'https://medio.ar/?id=9')
  assert.ok(menciona('Prueba Peugeot 208 en Argentina', '208', 'Peugeot'))
  assert.ok(!menciona('208 patentamientos', '208', 'Peugeot'))
  assert.ok(!menciona('Autos de Polonia', 'Polo', 'Volkswagen'))
})
test('RSS decodifica entidades numéricas una sola vez y conserva comparaciones', () => {
  const [r] = parsearFeed('<item><title><![CDATA[Auto &#8211; &lt; 3 millones &amp;lt;]]></title><link>https://medio.ar/nota</link></item>')
  assert.equal(r.titulo, 'Auto – < 3 millones &lt;')
})
test('YouTube: reloj de cuota Pacífico, duración y límite conservador', () => {
  assert.equal(diaCuota(new Date('2026-09-10T02:00:00Z')), '2026-09-09')
  assert.equal(duracionISO('PT1H2M3S'), 3723)
  assert.equal(duracionISO('PT3M'), 180)
  assert.equal(duracionISO('roto'), 0)
  assert.ok(!cabeEnCuota({ fecha: '', unidades: 7950, busquedas: 79, cursor: 0 }, 100, true))
  assert.ok(!cabeEnCuota({ fecha: '', unidades: 100, busquedas: 80, cursor: 0 }, 100, true))
})
test('Videos: canal permitido, fecha, duración, id, orden por vistas y máximo tres', () => {
  const video = (n: number) => ({ id: `abcdefghij${n}`, snippet: { title: 'Toyota Corolla prueba', channelId: 'canal-real', channelTitle: 'Canal', publishedAt: '2026-09-01T00:00:00Z', liveBroadcastContent: 'none', thumbnails: { high: { url: 'https://i.ytimg.com/vi/abcdefghij0/hqdefault.jpg' } } }, contentDetails: { duration: 'PT10M' }, statistics: { viewCount: String(n * 1000) }, status: { privacyStatus: 'public', embeddable: true } })
  const items = Array.from({ length: 5 }, (_, n) => video(n))
  items.push({ ...video(5), contentDetails: { duration: 'PT2M' } })
  items.push({ ...video(6), snippet: { ...video(6).snippet, channelId: 'ajeno' } })
  items.push({ ...video(7), snippet: { ...video(7).snippet, publishedAt: '2025-01-01T00:00:00Z' } })
  assert.deepEqual(seleccionar(items, 'Corolla', 'Toyota', new Set(['canal-real']), Date.parse('2026-09-10')).map(v => v.youtubeId), ['abcdefghij4', 'abcdefghij3', 'abcdefghij2'])
})
test('Borradores: evidencia propia, moneda, fechas distintas y publicación selectiva', () => {
  assert.deepEqual(generarNotas([], '2026-09-10'), [])
  const ms = [mov('a'), mov('b', '2026-09-10', '2.0'), mov('c', '2026-09-10', 'hybrid')]
  assert.ok(!generarNotas(ms, '2026-09-10').some(n => n.titulo.includes('relevamientos del año')))
  ms.push(mov('d', '2026-08-10'), mov('e', '2026-07-10'))
  const notas = generarNotas(ms, '2026-09-10')
  assert.ok(notas.some(n => n.titulo.includes('3 relevamientos')))
  assert.ok(notas.every(n => n.estado === 'borrador' && n.evidencia.length))
  const publicadas = publicarSeleccionados(notas, new Set([notas[0].id]))
  assert.equal(publicadas[0].estado, 'publicado')
  assert.equal(publicadas[1].estado, 'borrador')
  assert.equal(notas[0].estado, 'borrador')
  const dolar = { ...mov('usd'), moneda: 'u$s' as const, precioLista: 30000, precioAnterior: 28000, precioListaARS: null, precioAnteriorARS: null }
  assert.match(generarNotas([dolar], '2026-09-10')[0].cuerpo, /USD 30\.000/)
})
test('Ventana 30 días y resumen de ficha cuentan sólo la misma versión', () => {
  const ms = [mov('a'), mov('b', '2026-08-20'), mov('c', '2026-08-25', 'otra'), mov('d', '2026-01-01')]
  assert.equal(ultimos30(ms, '2026-09-10').length, 3)
  assert.match(resumenModelo(ms, 'toyota-corolla-xli')!, /2 relevamientos/)
  assert.equal(resumenModelo(ms, 'inexistente'), null)
})
test('Diff: no borra historia sin cambios, separa USD y no inventa variación cambiaria', () => {
  const estado: Estado = { 'TOYOTA|COROLLA|X': { moneda: 'u$s', precioLista: 20000, fechaUltimoCambio: '2026-08-10' } }
  const snapshot = { fecha: '2026-09-10', fuente: 'ACARA', items: [{ marca: 'TOYOTA', modelo: 'COROLLA', version: 'X', moneda: 'u$s' as const, precioLista: 21000, porAnio: [] }] }
  const r = detectarCambios(snapshot, estado)
  assert.equal(r.movimientos.length, 1)
  assert.equal(r.movimientos[0].precioListaARS, null)
  assert.equal(r.movimientos[0].precioLista, 21000)
  assert.equal(r.movimientos[0].porcentaje, 5)
  const segundo = detectarCambios(snapshot, r.estadoNuevo)
  assert.equal(segundo.movimientos.length, 0)
  assert.equal(acumularMovimientos(r.movimientos, segundo.movimientos).length, 1)
  assert.equal(acumularMovimientos(r.movimientos, r.movimientos).length, 1)
  assert.equal(detectarCambios({ ...snapshot, items: [{ ...snapshot.items[0], moneda: '$' }] }, estado).movimientos.length, 0)
  assert.equal(detectarCambios(snapshot, {}).movimientos.length, 0)
})

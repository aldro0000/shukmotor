import { Link } from 'react-router-dom'
import { Check, Minus, ShieldCheck } from 'lucide-react'
import { FECHA_CORTE, METODOLOGIA_POSVENTA, METODOLOGIA_REVENTA, formatFecha, modelos } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container } from '../components/ui'

export default function ComoTrabajamos() {
  useTitle('Cómo trabajamos')

  return (
    <Container className="py-10">
      <div className="max-w-3xl">
        <p className="eyebrow">Regla de la casa</p>
        <h1 className="mt-2 text-4xl leading-[1] md:text-5xl">Cómo trabajamos y de qué vivimos</h1>
        <p className="mt-4 text-lg text-soft">
          Este sitio existe para responder una sola pregunta: si este auto te sirve a vos. Para que esa respuesta valga
          algo, quien la escribe no puede depender de que la marca esté contenta.
        </p>

        <section className="card mt-8 p-5 md:p-6">
          <p className="inline-flex items-center gap-2 eyebrow">
            <ShieldCheck className="size-4 text-ok" aria-hidden />
            Lo que sí se compra y lo que no
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-1.5 eyebrow text-ok">
                <Check className="size-3.5" aria-hidden />
                Una marca puede
              </p>
              <ul className="mt-2 space-y-2 text-[0.95rem] leading-snug">
                <li>Comprar un espacio publicitario, que aparece siempre rotulado como espacio patrocinado.</li>
                <li>Publicar sus planes de financiación en el bloque marcado de la sección de financiación.</li>
                <li>Aparecer en los links de compra de sus propios modelos, con el orden fijo que usamos en todas las fichas.</li>
              </ul>
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 eyebrow text-bad">
                <Minus className="size-3.5" aria-hidden />
                Una marca no puede
              </p>
              <ul className="mt-2 space-y-2 text-[0.95rem] leading-snug">
                <li>
                  Cambiar una sola línea del bloque <strong>Te sirve si / Buscá otra si</strong>. Ese bloque sale del dato
                  del auto y de nuestras mediciones, y no está en venta.
                </li>
                <li>Mover su posición en el índice de reventa, en el relevamiento de posventa ni en el orden del buscador.</li>
                <li>Pedir que saquemos una contra, ni pagar para que aparezca una virtud.</li>
                <li>Comprar una opinión de dueño, ni que la borremos.</li>
              </ul>
            </div>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-sm text-soft">
            Las marcas pueden anunciar en el sitio. Eso no cambia ni una línea de la sección de encaje, ni un número de
            nuestras mediciones. Si alguna vez lo hiciera, este sitio dejaría de tener sentido.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl">Por qué el veredicto ya no es una nota</h2>
          <p className="mt-3">
            Antes cada ficha cerraba con un veredicto de tres estados: conviene, con reparos, no conviene. Lo sacamos por
            una razón simple: casi todos los autos que se venden hoy son razonablemente buenos, así que el veredicto
            terminaba diciendo lo mismo en casi todas las fichas, y un juicio que siempre dice lo mismo no informa nada.
          </p>
          <p>
            Además la pregunta estaba mal planteada. Un auto no es bueno ni malo: encaja o no encaja con quién lo compra.
            La misma pickup que es la mejor compra posible para alguien que carga media tonelada por día es una mala compra
            para alguien que hace veinte cuadras en el centro. Por eso ahora cada ficha tiene tres razones para comprarlo y
            tres para no, con el mismo peso visual, y cada línea lleva un dato en lugar de un adjetivo.
          </p>
          <p>
            En las tarjetas de resultado va una sola etiqueta descriptiva, y siempre positiva. Una tarjeta no tiene lugar
            para el matiz, y una advertencia sin matiz es injusta con el auto. Lo que hay que advertir está en la ficha, con
            el contexto al lado.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl">De dónde salen los números</h2>
          <dl className="mt-4 space-y-5">
            <div>
              <dt className="font-display text-xl font-bold">Índice de reventa</dt>
              <dd className="mt-1 text-soft">
                {METODOLOGIA_REVENTA.resumen} Corte de {formatFecha(FECHA_CORTE)}.{' '}
                <Link to="/reventa" className="font-semibold text-text hover:text-accent">
                  Ver el método completo
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="font-display text-xl font-bold">Relevamiento de posventa</dt>
              <dd className="mt-1 text-soft">
                {METODOLOGIA_POSVENTA.resumen}{' '}
                <Link to="/posventa" className="font-semibold text-text hover:text-accent">
                  Ver el método completo
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="font-display text-xl font-bold">Opiniones</dt>
              <dd className="mt-1 text-soft">
                Son de dueños, con los kilómetros recorridos a la vista. Nunca pagamos ni cobramos por una opinión.
              </dd>
            </div>
            <div>
              <dt className="font-display text-xl font-bold">Fotos</dt>
              <dd className="mt-1 text-soft">
                Todas con licencia libre y con el autor acreditado. Ninguna está generada con inteligencia artificial. Un
                modelo que no tiene al menos dos fotos que pasen nuestro filtro no se publica hasta conseguirlas: hoy hay{' '}
                {modelos.length} modelos en el catálogo por esa razón.{' '}
                <Link to="/creditos" className="font-semibold text-text hover:text-accent">
                  Ver los créditos
                </Link>
                .
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl md:text-3xl">De qué vivimos</h2>
          <p className="mt-3">
            De espacios publicitarios rotulados, de comisiones de algunos links de compra que también están rotulados, y de
            acuerdos con rubros que no tienen nada que perder si decimos la verdad sobre la depreciación: repuestos,
            accesorios, seguros y concesionarias de usados.
          </p>
          <p>
            No cobramos de las marcas ni de los importadores por escribir. Esa es toda la explicación de por qué podemos
            publicar que una marca pierde treinta por ciento de su valor en un año.
          </p>
        </section>
      </div>
    </Container>
  )
}

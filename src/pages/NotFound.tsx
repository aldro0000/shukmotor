import { Link } from 'react-router-dom'
import { marcasOrdenadas, masMirados } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Container } from '../components/ui'
import { MarcasGrid } from '../components/marca/MarcasGrid'
import { ModeloCard } from '../components/modelo/ModeloCard'

export default function NotFound() {
  useTitle('No encontramos esa página')
  return (
    <Container className="py-12">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 text-4xl">Esa página no existe, pero los autos sí</h1>
      <p className="mt-3 max-w-xl text-soft">
        Puede que el link esté viejo o mal escrito. Arrancá por el presupuesto o buscá la marca.
      </p>
      <Link to="/buscar" className="btn btn-primary mt-6">
        Buscar por presupuesto
      </Link>
      <h2 className="mt-12 text-2xl">Los más mirados</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {masMirados.slice(0, 4).map((m) => (
          <ModeloCard key={m.id} modelo={m} />
        ))}
      </div>
      <h2 className="mt-12 text-2xl">Todas las marcas</h2>
      <div className="mt-4">
        <MarcasGrid marcas={marcasOrdenadas} compacta />
      </div>
    </Container>
  )
}

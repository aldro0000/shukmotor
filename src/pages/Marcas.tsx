import { useMemo, useState } from 'react'
import { marcasOrdenadas, modelos } from '../data'
import { useTitle } from '../hooks/useTitle'
import { Chip, Container, SectionHead } from '../components/ui'
import { MarcasGrid } from '../components/marca/MarcasGrid'

type Filtro = 'todas' | 'tradicional' | 'nueva'

export default function Marcas() {
  useTitle('Marcas')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const lista = useMemo(
    () => (filtro === 'todas' ? marcasOrdenadas : marcasOrdenadas.filter((m) => m.tipo === filtro)),
    [filtro],
  )
  const nuevas = marcasOrdenadas.filter((m) => m.tipo === 'nueva').length

  return (
    <Container className="py-10">
      <SectionHead
        eyebrow={`${marcasOrdenadas.length} marcas · ${modelos.length} modelos`}
        titulo="Todas las marcas que venden 0km en Argentina"
        bajada={`Cada marca tiene su hub con la misma estructura: datos de la red, garantía, reventa y todos sus modelos. ${nuevas} llegaron en los últimos tres años.`}
      />
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar marcas">
        {(
          [
            ['todas', 'Todas'],
            ['tradicional', 'Tradicionales'],
            ['nueva', 'Llegaron hace menos de 3 años'],
          ] as [Filtro, string][]
        ).map(([v, label]) => (
          <Chip key={v} on={filtro === v} onClick={() => setFiltro(v)}>
            {label}
          </Chip>
        ))}
      </div>
      <MarcasGrid marcas={lista} />
    </Container>
  )
}

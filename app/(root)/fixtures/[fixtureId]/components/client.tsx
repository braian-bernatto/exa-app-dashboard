'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import FixtureForm, { FixtureType } from './FixtureForm'
import { GetFixturesTeams, Locations, TiposPartido, Torneos } from '@/types'

interface FixtureDetailsClientProps {
  torneos: Torneos[]
  tiposPartido: TiposPartido[]
  locations: Locations[]
  data: FixtureType | undefined
  fixtureDetails: GetFixturesTeams
}

const FixtureDetailsClient = ({
  torneos,
  tiposPartido,
  locations,
  data,
  fixtureDetails
}: FixtureDetailsClientProps) => {
  const router = useRouter()
  const params = useParams()

  return (
    <>
      <FixtureForm
        initialData={data}
        torneos={torneos}
        tiposPartido={tiposPartido}
        locations={locations}
      />
      {data && (
        <>
          <Separator />
          <div className='flex items-center justify-end'>
            <Button
              onClick={() =>
                router.push(`/fixtures/${params.fixtureId}/agregar`)
              }>
              <Plus className='mr-2 h-4 w-4' /> Agregar Versus
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={fixtureDetails || []}
            filterLabel='Fecha'
            filterKey='date'
          />
        </>
      )}
    </>
  )
}

export default FixtureDetailsClient

'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { GetFixturesTeams } from '@/types'

export const revalidate = 0

interface FixtureDetailsClientProps {
  fixtureDetails: GetFixturesTeams
}

const FixtureDetailsClient = ({
  fixtureDetails
}: FixtureDetailsClientProps) => {
  const router = useRouter()
  const params = useParams()

  return (
    <div className='flex flex-wrap justify-center gap-5 w-full'>
      {fixtureDetails && (
        <article className='flex flex-col gap-5 w-full md:w-auto'>
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
        </article>
      )}
    </div>
  )
}

export default FixtureDetailsClient

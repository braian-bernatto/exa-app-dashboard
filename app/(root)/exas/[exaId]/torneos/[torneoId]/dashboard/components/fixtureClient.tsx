'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, Shuffle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { GetFixturesTeams } from '@/types'

export const revalidate = 0

interface FixtureDetailsClientProps {
  id: string
  fixtureDetails: GetFixturesTeams
}

const FixtureDetailsClient = ({
  id,
  fixtureDetails
}: FixtureDetailsClientProps) => {
  const router = useRouter()

  return (
    <div className='flex flex-wrap justify-center gap-5 w-full'>
      {fixtureDetails && (
        <article className='flex flex-col gap-5 w-full md:w-auto'>
          <Separator />
          <span className='flex flex-wrap gap-2'>
            <Button onClick={() => router.push(`fixtures/generar`)}>
              <Shuffle className='mr-2 h-4 w-4' /> Generar
            </Button>
            <Button onClick={() => router.push(`fixtures/${id}/agregar`)}>
              <Plus className='mr-2 h-4 w-4' /> Agregar Versus
            </Button>
          </span>
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

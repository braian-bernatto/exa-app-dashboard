'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus, Shuffle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { FixtureColumn, columns } from './columns'

interface FixtureClientProps {
  data: FixtureColumn[] | []
}

const FixtureClient = ({ data }: FixtureClientProps) => {
  const router = useRouter()
  return (
    <div>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Fixtures (${data.length})`}
          description='Maneja todos los fixtures de tus torneos'
        />
        <span className='gap-2 flex flex-wrap'>
          <Button onClick={() => router.push(`/fixtures/generar`)}>
            <Shuffle className='mr-2 h-4 w-4' /> Generar
          </Button>
          <Button onClick={() => router.push(`/fixtures/agregar`)}>
            <Plus className='mr-2 h-4 w-4' /> Agregar
          </Button>
        </span>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={data}
        filterLabel='Torneo'
        filterKey='torneo'
      />
    </div>
  )
}

export default FixtureClient

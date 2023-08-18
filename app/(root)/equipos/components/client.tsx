'use client'

import { Heading } from '@/components/ui/heading'
import { TeamColumn, columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'

interface TeamClientProps {
  data: TeamColumn[]
}

const TeamClient = ({ data }: TeamClientProps) => {
  const router = useRouter()
  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Equipos (${data.length})`}
          description='Maneja los datos de tus equipos'
        />
        <Button onClick={() => router.push(`/equipos/agregar`)}>
          <Plus className='mr-2 h-4 w-4' />
          Agregar
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={data}
        filterLabel='Nombre'
        filterKey='name'
      />
    </>
  )
}

export default TeamClient

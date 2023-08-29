'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { PlayerColumn, columns } from './columns'

interface PlayerClientProps {
  data: PlayerColumn[]
}

const PlayerClient = ({ data }: PlayerClientProps) => {
  const router = useRouter()
  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Jugadores (${data.length})`}
          description='Maneja todos los datos de tus jugadores'
        />
        <Button onClick={() => router.push(`/jugadores/agregar`)}>
          <Plus className='mr-2 h-4 w-4' /> Agregar
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={data}
        filterLabel='Equipo'
        filterKey='team_name'
      />
    </>
  )
}

export default PlayerClient

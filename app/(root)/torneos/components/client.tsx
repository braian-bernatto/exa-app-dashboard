'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Exas, Torneos } from '@/types'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { columns } from './columns'

interface TorneosClientProps {
  data: (Torneos & Exas)[]
}

const TorneosClient = ({ data }: TorneosClientProps) => {
  const router = useRouter()

  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Torneos (${data.length})`}
          description='Maneja todos los datos de tus torneos'
        />
        <Button onClick={() => router.push('/torneos/agregar')}>
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

export default TorneosClient

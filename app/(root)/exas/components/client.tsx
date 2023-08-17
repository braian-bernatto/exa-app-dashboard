'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExaColumn, columns } from './columns'
import { DataTable } from '@/components/ui/data-table'

interface ExaClientProps {
  data: ExaColumn[]
}

const ExaClient = ({ data }: ExaClientProps) => {
  const router = useRouter()
  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title={`Exas (${data.length})`}
          description='Maneja todos los datos de tus exas'
        />
        <Button onClick={() => router.push(`/exas/agregar`)}>
          <Plus className='mr-2 h-4 w-4' /> Agregar
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

export default ExaClient

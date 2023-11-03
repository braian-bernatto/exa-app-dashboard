'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Exa from './exa'

interface ExaClientProps {
  data: any[]
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
      <div className='w-full flex justify-center gap-10'>
        {data && data.map(exa => <Exa key={exa.id} data={exa} />)}
      </div>
    </>
  )
}

export default ExaClient

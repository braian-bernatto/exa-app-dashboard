'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Exas, Torneos } from '@/types'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Torneo from './torneo'

interface TorneosClientProps {
  data: (Torneos & {
    exas: Pick<Exas, 'id' | 'name' | 'image_url'> | null
  })[]
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
        <Button onClick={() => router.push('torneos/agregar')}>
          <Plus className='mr-2 h-4 w-4' />
          Agregar
        </Button>
      </div>
      <Separator />
      <div className='w-full flex justify-center gap-10'>
        {data && data.map(torneo => <Torneo key={torneo.id} data={torneo} />)}
      </div>
    </>
  )
}

export default TorneosClient

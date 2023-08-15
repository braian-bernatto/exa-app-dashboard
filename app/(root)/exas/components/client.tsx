'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

const ExaClient = () => {
  const router = useRouter()
  const params = useParams()
  return (
    <>
      <div className='flex items-center justify-between'>
        <Heading
          title='Exas (0)'
          description='Maneja todos los datos de tus exas'
        />
        <Button onClick={() => router.push(`/exas/agregar`)}>
          <Plus className='mr-2 h-4 w-4' /> Agregar
        </Button>
      </div>
      <Separator />
    </>
  )
}

export default ExaClient

'use client'

import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { ExaColumn } from './columns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSupabase } from '@/providers/SupabaseProvider'
import { AlertModal } from '@/components/modals/AlertModal'

interface CellActionProps {
  data: ExaColumn
}

const CellAction = ({ data }: CellActionProps) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()
  const onCopy = () => {
    navigator.clipboard.writeText(data.id.toString())
    toast.success('ID copiado en el portapapeles')
  }

  const onDelete = async () => {
    try {
      setLoading(true)

      const { error: supabaseError } = await supabase
        .from('exas')
        .delete()
        .eq('id', data.id)

      if (supabaseError) {
        console.log(supabaseError)
        setLoading(false)
        return toast.error(`No se pudo Borrar`)
      }
      router.refresh()
      toast.success('Borrado con éxito')
    } catch (error) {
      toast.error('Hubo un error')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open Menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCopy}>
            <Copy className='mr-2 h-4 w-4' /> Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/exas/${data.id}`)}>
            <Edit className='mr-2 h-4 w-4' /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' /> Borrar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default CellAction

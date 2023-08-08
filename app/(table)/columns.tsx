'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Players } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

export const columns: ColumnDef<Players>[] = [
  {
    accessorKey: 'position_id',
    header: 'Posición'
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          type='button'
          className='text-xs'
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    id: 'goals',
    header: ({ column }) => {
      return (
        <Button
          type='button'
          className='text-xs'
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Goles
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Input
          type='number'
          min={0}
          className='min-w-[60px] w-full text-center text-xs h-[30px]'
        />
      )
    }
  },
  {
    id: 'yellow_cards',
    header: 'T.A.',
    cell: ({ row }) => {
      return (
        <Input
          type='number'
          min={0}
          max={2}
          className='min-w-[60px] w-full text-center text-xs h-[30px]'
        />
      )
    }
  },
  {
    id: 'red_cards',
    header: 'T.R.',
    cell: ({ row }) => {
      return <Checkbox />
    }
  },
  {
    id: 'motivo',
    header: 'Motivo',
    cell: ({ row }) => {
      return <Input className='min-w-[150px] text-xs h-[30px]' />
    }
  }
]

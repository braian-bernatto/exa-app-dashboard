'use client'

import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import { Exas } from '@/types'
import CellImage from './cell-image'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export type ExaColumn = Exas

export const columns: ColumnDef<ExaColumn>[] = [
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  },
  {
    accessorKey: 'image_url',
    header: 'Logo',
    cell: ({ row }) => <CellImage data={row.original} />
  },
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Fecha Creación
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  }
]

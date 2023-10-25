'use client'

import { Teams } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellImage from './cell-image'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export type TeamColumn = Teams

export const columns: ColumnDef<TeamColumn>[] = [
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
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'exa_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Exa
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
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

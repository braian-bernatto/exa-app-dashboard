'use client'

import { Fixtures } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellTorneoImage from './cell-torneo-image'
import CellLocal from './cell-local'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export type FixtureColumn = Fixtures & {
  torneos: { name: string | null; image_url: string | null } | null
  locations: { name: string | null } | null
}

export const columns: ColumnDef<FixtureColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    id: 'torneos.name',
    accessorKey: 'torneos.name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Torneo
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => <CellTorneoImage data={row.original} />
  },
  {
    accessorKey: 'locations.name',
    header: 'Local',
    cell: ({ row }) => <CellLocal data={row.original} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

'use client'

import { Fixtures } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellTorneoImage from './cell-torneo-image'

export type FixtureColumn = Fixtures & {
  torneos: { name: string | null; image_url: string | null } | null
}

export const columns: ColumnDef<FixtureColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'torneos.name',
    header: 'Torneo',
    cell: ({ row }) => <CellTorneoImage data={row.original} />
  },
  {
    accessorKey: 'locations.name',
    header: 'Local'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

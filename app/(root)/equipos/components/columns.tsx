'use client'

import { Teams } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellImage from './cell-image'

export type TeamColumn = Teams

export const columns: ColumnDef<TeamColumn>[] = [
  {
    accessorKey: 'logo_url',
    header: 'Logo',
    cell: ({ row }) => <CellImage data={row.original} />
  },
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'exa_name', header: 'Exa' },
  {
    accessorKey: 'created_at',
    header: 'Fecha Creación'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

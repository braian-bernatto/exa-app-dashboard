'use client'

import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'

export type ExaColumn = {
  id: number
  name: string
  logo_url: string
  created_at: string
}

export const columns: ColumnDef<ExaColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'logo_url',
    header: 'Logo URL'
  },
  {
    accessorKey: 'created_at',
    header: 'Fecha Creación'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

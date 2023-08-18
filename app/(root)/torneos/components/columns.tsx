'use client'

import { Torneos } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellImage from './cell-image'

export type TorneoColumn = Torneos

export const columns: ColumnDef<TorneoColumn>[] = [
  {
    accessorKey: 'logo_url',
    header: 'Logo',
    cell: ({ row }) => <CellImage data={row.original} />
  },
  {
    accessorKey: 'name',
    header: 'Nombre'
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

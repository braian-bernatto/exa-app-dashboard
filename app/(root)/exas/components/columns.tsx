'use client'

import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import { Exas } from '@/types'
import CellImage from './cell-image'

export type ExaColumn = Exas

export const columns: ColumnDef<ExaColumn>[] = [
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
    header: 'Fecha Creación'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

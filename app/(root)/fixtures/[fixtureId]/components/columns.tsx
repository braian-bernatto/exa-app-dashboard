'use client'

import { FixtureDetails } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellDate from './cell-date'

export type FixtureDetailsColumn = FixtureDetails

export const columns: ColumnDef<FixtureDetailsColumn>[] = [
  {
    accessorKey: 'date',
    header: 'Fecha',
    cell: ({ row }) => <CellDate data={row.original} />
  },
  {
    accessorKey: 'cancha_nro',
    header: 'N° Cancha'
  },
  {
    accessorKey: 'team_1',
    header: 'Equipo 1'
  },
  {
    accessorKey: 'team_2',
    header: 'Equipo 2'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

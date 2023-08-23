'use client'
import { FixtureDetails } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellDate from './cell-date'
import CellTeamOneImage from './cell-team-one-image'
import CellTeamTwoImage from './cell-team-two-image'

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
    header: 'Equipo 1',
    cell: ({ row }) => <CellTeamOneImage data={row.original} />
  },
  {
    accessorKey: 'team_2',
    header: 'Equipo 2',
    cell: ({ row }) => <CellTeamTwoImage data={row.original} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

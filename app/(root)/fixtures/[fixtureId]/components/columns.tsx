'use client'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellDate from './cell-date'
import CellTeamOneImage from './cell-team-one-image'
import CellTeamTwoImage from './cell-team-two-image'
import CellCancha from './cell-cancha'

export type FixtureDetailsColumn =
  | {
      fixture_id: number
      team_1: { id: number; name: string; image_url: string }
      team_2: { id: number; name: string; image_url: string }
      cancha_nro: number | null
      date: string
    }
  | any

export const columns: ColumnDef<FixtureDetailsColumn>[] = [
  {
    accessorKey: 'date',
    header: 'Fecha',
    cell: ({ row }) => <CellDate data={row.original} />
  },
  {
    accessorKey: 'cancha_nro',
    header: 'N° Cancha',
    cell: ({ row }) => <CellCancha data={row.original} />
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

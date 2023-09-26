'use client'
import { ColumnDef } from '@tanstack/react-table'
import CellAction from './cell-action'
import CellDate from './cell-date'
import CellTeamOneImage from './cell-team-one-image'
import CellTeamTwoImage from './cell-team-two-image'
import CellCancha from './cell-cancha'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { GetFixturesTeams } from '@/types'

export type FixtureDetailsColumn = GetFixturesTeams[0]

export const columns: ColumnDef<FixtureDetailsColumn>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Fecha
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => <CellDate data={row.original} />
  },
  {
    accessorKey: 'cancha_nro',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          N° Cancha
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => <CellCancha data={row.original} />
  },
  {
    accessorKey: 'team_local',
    header: 'Local',
    cell: ({ row }) => <CellTeamOneImage data={row.original} />
  },
  {
    accessorKey: 'team_visit',
    header: 'Visitante',
    cell: ({ row }) => <CellTeamTwoImage data={row.original} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

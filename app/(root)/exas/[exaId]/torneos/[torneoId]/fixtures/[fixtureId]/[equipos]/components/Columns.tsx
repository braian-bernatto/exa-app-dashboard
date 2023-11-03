'use client'

import { Button } from '@/components/ui/button'
import { GetFixturesPlayers, Players } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import TableCellYellowCard from './TableCellYellowCard'
import TableCellGoals from './TableCellGoals'
import TableCellRedCard from './TableCellRedCard'
import TableCellMotivo from './TableCellMotivo'
import TableCellPresent from './TableCellPresent'

export const Columns: ColumnDef<Players | GetFixturesPlayers[0]>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          type='button'
          className='text-xs'
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'position_id',
    header: 'Posición'
  },
  {
    accessorKey: 'goals',
    header: ({ column }) => {
      return (
        <Button
          type='button'
          className='text-xs'
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Goles
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: TableCellGoals
  },
  {
    accessorKey: 'yellow_cards',
    header: 'T.A.',
    cell: TableCellYellowCard
  },
  {
    accessorKey: 'red_card',
    header: 'T.R.',
    cell: TableCellRedCard
  },
  {
    accessorKey: 'red_card_motive',
    header: 'Motivo',
    cell: TableCellMotivo
  },
  {
    accessorKey: 'is_present',
    header: 'Presente',
    cell: TableCellPresent
  }
]

'use client'

import { Players } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellImage from './cell-image'
import CellAction from './cell-action'
import CellTeamImage from './cell-team-image'
import CellCountryImage from './cell-country-image'

export type PlayerColumn = Players & {
  team_image_url: string
}

export const columns: ColumnDef<PlayerColumn>[] = [
  {
    accessorKey: 'image_url',
    header: 'Foto',
    cell: ({ row }) => <CellImage data={row.original} />
  },
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'team_image_url',
    header: 'Equipo',
    cell: ({ row }) => <CellTeamImage data={row.original} />
  },
  {
    accessorKey: 'position_name',
    header: 'Posición'
  },
  {
    accessorKey: 'foot',
    header: 'Pie'
  },
  {
    accessorKey: 'rating',
    header: 'Rating'
  },
  {
    accessorKey: 'rit',
    header: 'Ritmo'
  },
  {
    accessorKey: 'tir',
    header: 'Tiro'
  },
  {
    accessorKey: 'pas',
    header: 'Pase'
  },
  {
    accessorKey: 'reg',
    header: 'Regate'
  },
  {
    accessorKey: 'def',
    header: 'Defensa'
  },
  {
    accessorKey: 'fis',
    header: 'Físico'
  },
  {
    accessorKey: 'country_iso2',
    header: 'País',
    cell: ({ row }) => <CellCountryImage data={row.original} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]

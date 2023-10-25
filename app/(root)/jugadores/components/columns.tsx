'use client'

import { Players } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import CellImage from './cell-image'
import CellAction from './cell-action'
import CellTeamImage from './cell-team-image'
import CellCountryImage from './cell-country-image'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export type PlayerColumn = Players & {
  team_image_url: string
  team_name: string
}

export const columns: ColumnDef<PlayerColumn>[] = [
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  },
  {
    accessorKey: 'image_url',
    header: 'Foto',
    cell: ({ row }) => <CellImage data={row.original} />
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'team_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Equipo
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => <CellTeamImage data={row.original} />
  },
  {
    accessorKey: 'active',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Estado
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span
        className={`rounded-full shadow px-2 text-white font-semibold ${
          row.original.active ? 'bg-emerald-500' : 'bg-pink-700'
        }`}>
        {row.original.active ? 'Activo' : 'Inactivo'}
      </span>
    )
  },
  {
    accessorKey: 'position_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Posición
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'foot',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Pie
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Rating
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  // {
  //   accessorKey: 'rit',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Ritmo
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'tir',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Tiro
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'pas',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Pase
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'reg',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Regate
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'def',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Defensa
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'fis',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant='ghost'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
  //         Físico
  //         <ArrowUpDown className='ml-2 h-4 w-4' />
  //       </Button>
  //     )
  //   }
  // },
  {
    accessorKey: 'country_iso2',
    header: 'País',
    cell: ({ row }) => <CellCountryImage data={row.original} />
  }
]

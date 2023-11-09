'use client'
import { Teams } from '@/types'
import Image from 'next/image'
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface TeamProps {
  team: Teams
  pass: boolean
}

const Team = ({ team, pass }: TeamProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: team.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <li
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex-1 flex gap-4 items-center shadow rounded p-1 justify-between px-3 ${
        pass ? 'grayscale line-through opacity-50' : ''
      }`}>
      <span className='flex gap-4 items-center'>
        <div className='w-10 h-10 relative'>
          {team.image_url && (
            <Image
              src={team.image_url}
              fill
              className='object-contain'
              alt='team logo'
            />
          )}
        </div>
        <h2 className='text-xs capitalize text-center text-muted-foreground'>
          {team.name}
        </h2>
      </span>
      <GripVertical size={20} className='text-muted-foreground' />
    </li>
  )
}

export default Team

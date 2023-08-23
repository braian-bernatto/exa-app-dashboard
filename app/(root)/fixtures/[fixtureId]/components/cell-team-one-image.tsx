'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamOneImage = async ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  let url = ''

  const { data: team } = await supabase
    .from('teams')
    .select('name, image_url')
    .eq('id', data.team_1)

  if (team) {
    const { data: storage } = supabase.storage
      .from('teams')
      .getPublicUrl(team[0].image_url!)
    url = storage.publicUrl
  }

  return (
    <div className='flex gap-2'>
      {data.team_1}
      <div className='w-[30px] h-[30px] relative'>
        {!imageError ? (
          <Image
            src={url}
            onError={() => {
              setImageError(true)
            }}
            fill
            alt='logo de equipo'
            className='object-contain'
          />
        ) : (
          team && team[0].name
        )}
      </div>
    </div>
  )
}

export default CellTeamOneImage

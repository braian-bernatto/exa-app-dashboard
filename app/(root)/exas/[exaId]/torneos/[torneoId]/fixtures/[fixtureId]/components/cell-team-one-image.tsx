import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useEffect, useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamOneImage = ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  const { data: imageUrl } = supabase.storage
    .from('teams')
    .getPublicUrl(data.team_local_image_url)

  return (
    <div className='flex gap-2 items-center relative text-xs'>
      {!imageError ? (
        <div className='w-[30px] h-[30px] relative'>
          <Image
            src={imageUrl.publicUrl}
            onError={() => {
              setImageError(true)
            }}
            fill
            alt='logo de equipo'
            className='object-contain'
          />
        </div>
      ) : (
        data.team_local_name
      )}
      <span className='font-semibold text-muted-foreground rounded-full shadow text-lg w-[25px] h-[25px] text-center flex justify-center items-center border bg-white'>
        {data.team_local_goals !== null
          ? data.team_local_goals
          : data.walkover_local_goals !== null
          ? data.walkover_local_goals
          : '-'}
      </span>
      {data.walkover_local && (
        <span className='text-pink-800 shadow rounded-full px-2 bg-white absolute -top-[13px] opacity-80 text-xs'>
          Walkover
        </span>
      )}
    </div>
  )
}

export default CellTeamOneImage

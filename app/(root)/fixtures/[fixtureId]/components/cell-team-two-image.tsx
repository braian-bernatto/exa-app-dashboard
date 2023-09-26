import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamTwoImage = ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  const { data: imageUrl } = supabase.storage
    .from('teams')
    .getPublicUrl(data.team_visit_image_url)

  return (
    <div className='flex gap-2 items-center relative text-xs'>
      <span className='font-semibold text-muted-foreground rounded-full shadow text-lg w-[25px] h-[25px] text-center flex justify-center items-center border bg-white'>
        {data.team_visit_goals || '-'}
      </span>
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
        data.team_visit_name
      )}
      {data.walkover_visit && (
        <span className='text-pink-800 shadow rounded-full px-2 bg-white absolute -top-[13px] opacity-80 text-xs'>
          Walkover
        </span>
      )}
    </div>
  )
}

export default CellTeamTwoImage

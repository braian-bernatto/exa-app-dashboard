import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamImage = async ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  let url = ''

  const { data: team } = await supabase
    .from('teams')
    .select('image_url')
    .eq('id', data.team_1)

  if (team) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(team.image_url)
    url = storage.publicUrl
  }

  return (
    <div className='flex gap-2'>
      <div className='w-[30px] h-[30px] relative shadow rounded-full overflow-hidden border'>
        {!imageError && (
          <Image
            src={url}
            onError={() => {
              setImageError(true)
            }}
            fill
            alt='logo de torneo'
            className='object-contain'
          />
        )}
      </div>
      {data.torneos!.name}
    </div>
  )
}

export default CellTeamImage

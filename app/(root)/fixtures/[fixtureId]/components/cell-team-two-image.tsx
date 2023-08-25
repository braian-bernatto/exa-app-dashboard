import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamTwoImage = async ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  let url = ''
  let goals

  const { data: goles } = await supabase.rpc('get_goals', {
    fixture: data.fixture_id,
    team: data.team_2
  })

  if (goles) {
    goals = goles
  } else {
    goals = 0
  }

  const { data: team } = await supabase
    .from('teams')
    .select('name, image_url')
    .eq('id', data.team_2)

  if (team && team.length) {
    const { data: storage } = supabase.storage
      .from('teams')
      .getPublicUrl(team[0].image_url!)
    url = storage.publicUrl
  }

  return (
    <div className='flex gap-2 justify-center items-center'>
      <span className='font-semibold text-muted-foreground rounded-full shadow text-lg w-[25px] h-[25px] text-center flex justify-center items-center border'>
        {goals}
      </span>
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

export default CellTeamTwoImage

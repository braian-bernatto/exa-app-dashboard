import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureDetailsColumn } from './columns'
import { useEffect, useState } from 'react'

interface CellTeamImageProps {
  data: FixtureDetailsColumn
}

const CellTeamOneImage = ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const [goals, setGoals] = useState<number | '-'>('-')
  const [walkover, setWalkover] = useState(false)
  const { supabase } = useSupabase()

  const { data: imageUrl } = supabase.storage
    .from('teams')
    .getPublicUrl(data.team_1.image_url)

  useEffect(() => {
    const getDetails = async () => {
      // goals
      const { data: goles } = await supabase.rpc('get_goals', {
        fixture: data.fixture_id,
        team: data.team_1.id
      })

      if (goles) {
        setGoals(goles)
      } else {
        setGoals(0)
      }

      // walkover
      const { data: isWalkover } = await supabase
        .from('walkover')
        .select()
        .eq('team_id', data.team_1.id)
        .eq('fixture_id', data.fixture_id)

      if (isWalkover?.length) {
        setWalkover(true)
      }
    }

    getDetails()
  }, [])

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
        data.team_1.name
      )}
      <span className='font-semibold text-muted-foreground rounded-full shadow text-lg w-[25px] h-[25px] text-center flex justify-center items-center border bg-white'>
        {goals}
      </span>
      {walkover && (
        <span className='text-pink-800 shadow rounded-full px-2 bg-white absolute -top-[13px] opacity-80 text-xs'>
          Walkover
        </span>
      )}
    </div>
  )
}

export default CellTeamOneImage

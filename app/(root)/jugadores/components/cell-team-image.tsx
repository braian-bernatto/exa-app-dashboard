import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { PlayerColumn } from './columns'
import { useState } from 'react'

interface CellTeamImageProps {
  data: PlayerColumn
}

const CellTeamImage = ({ data }: CellTeamImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  if (!data.team_image_url || imageError) {
    return data.team_name
  }

  const { data: url } = supabase.storage
    .from('teams')
    .getPublicUrl(data.team_image_url!)

  return (
    <>
      <Image
        src={url.publicUrl}
        width={40}
        height={40}
        alt='logo de equipo'
        onError={() => {
          setImageError(true)
        }}
      />
      <p className='hidden'>{data.team_name}</p>
    </>
  )
}

export default CellTeamImage

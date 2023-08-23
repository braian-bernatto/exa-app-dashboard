import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { FixtureColumn } from './columns'
import { useState } from 'react'

interface CellTorneoImageProps {
  data: FixtureColumn
}

const CellTorneoImage = ({ data }: CellTorneoImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  let fallbackUrl = '/img/player-gray.png'
  let url = ''

  if (data.torneos.image_url) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(data.torneos.image_url)
    url = storage.publicUrl
  }

  return (
    <div className='w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] relative shadow rounded-full overflow-hidden border'>
      <Image
        src={imageError ? fallbackUrl : url}
        onError={() => {
          setImageError(true)
        }}
        fill
        alt='logo de torneo'
        className='object-contain'
      />
    </div>
  )
}

export default CellTorneoImage

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

  let url = ''

  if (data.torneos!.image_url) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(data.torneos!.image_url)
    url = storage.publicUrl
  }

  return (
    <div className='flex gap-2'>
      <div className='w-[30px] h-[30px] relative shadow rounded-full overflow-hidden border flex-none'>
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

export default CellTorneoImage

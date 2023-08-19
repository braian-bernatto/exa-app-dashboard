'use client'
import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { PlayerColumn } from './columns'
import { useState } from 'react'

interface CellImageProps {
  data: PlayerColumn
}

const CellImage = ({ data }: CellImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  let fallbackUrl = '/img/player-gray.png'
  let url = ''

  if (data.image_url) {
    const { data: storage } = supabase.storage
      .from('players')
      .getPublicUrl(data.image_url)
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
        alt='foto de jugador'
        className='object-contain'
      />
    </div>
  )
}

export default CellImage

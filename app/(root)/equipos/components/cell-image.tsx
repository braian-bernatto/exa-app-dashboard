import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { TeamColumn } from './columns'
import { useState } from 'react'

interface CellImageProps {
  data: TeamColumn
}

const CellImage = ({ data }: CellImageProps) => {
  const [imageError, setImageError] = useState(false)
  const { supabase } = useSupabase()

  if (!data.image_url || imageError) {
    return <p>Sin logo</p>
  }

  const { data: url } = supabase.storage
    .from('teams')
    .getPublicUrl(data.image_url!)

  return (
    <Image
      src={url.publicUrl}
      width={50}
      height={50}
      alt='logo'
      onError={() => {
        setImageError(true)
      }}
    />
  )
}

export default CellImage

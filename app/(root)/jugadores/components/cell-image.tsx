import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { PlayerColumn } from './columns'

interface CellImageProps {
  data: PlayerColumn
}

const CellImage = ({ data }: CellImageProps) => {
  const { supabase } = useSupabase()

  if (!data.image_url) {
    return <p>Sin Foto</p>
  }

  const { data: url } = supabase.storage
    .from('players')
    .getPublicUrl(data.image_url!)

  return (
    <Image
      src={url.publicUrl}
      width={50}
      height={50}
      alt='foto de jugador'
      className='shadow flex rounded-full overflow-hidden border'
    />
  )
}

export default CellImage

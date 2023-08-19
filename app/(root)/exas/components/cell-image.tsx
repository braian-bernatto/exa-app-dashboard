import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { ExaColumn } from './columns'

interface CellImageProps {
  data: ExaColumn
}

const CellImage = ({ data }: CellImageProps) => {
  const { supabase } = useSupabase()

  if (!data.image_url) {
    return <p className='text-center'>Sin logo</p>
  }

  const { data: url } = supabase.storage
    .from('exas')
    .getPublicUrl(data.image_url!)

  return <Image src={url.publicUrl} width={50} height={50} alt='logo' />
}

export default CellImage

import { useSupabase } from '@/providers/SupabaseProvider'
import Image from 'next/image'
import { PlayerColumn } from './columns'

interface CellTeamImageProps {
  data: PlayerColumn
}

const CellTeamImage = ({ data }: CellTeamImageProps) => {
  const { supabase } = useSupabase()

  if (!data.team_image_url) {
    return data.team_name
  }

  const { data: url } = supabase.storage
    .from('teams')
    .getPublicUrl(data.team_image_url!)

  return (
    <Image src={url.publicUrl} width={40} height={40} alt='logo de equipo' />
  )
}

export default CellTeamImage

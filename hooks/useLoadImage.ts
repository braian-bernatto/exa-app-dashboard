import { useSupabase } from '@/providers/SupabaseProvider'
import { Teams } from '@/types'

const useLoadImage = (team: Teams) => {
  const { supabase } = useSupabase()

  if (!team) {
    return null
  }

  const { data: imageData } = supabase.storage
    .from('teams')
    .getPublicUrl(team.logo_url!)

  return imageData.publicUrl
}

export default useLoadImage

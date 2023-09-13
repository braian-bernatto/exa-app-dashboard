import { Teams } from '@/types'
import { createClient } from '@/utils/supabaseServer'


const getTeamsByExa = async (id: number): Promise<Teams[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_teams_by_exa_id', {
    exa_id:id
  })

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    if (data.image_url?.length) {
      const { data: imageData } = supabase.storage
        .from('teams')
        .getPublicUrl(data.image_url!)
      return { ...data, image_url: imageData.publicUrl }
    }
    return data
  })

  return (dataWithImage as any) || []
}

export default getTeamsByExa

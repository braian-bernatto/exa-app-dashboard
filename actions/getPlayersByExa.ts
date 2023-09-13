import { Players } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getPlayersByExa = async (id: number): Promise<Players[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_players_by_exa_id', {
    exa_id:id
  })

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    if (data.image_url?.length) {
      const { data: imageData } = supabase.storage
        .from('players')
        .getPublicUrl(data.image_url!)
      return { ...data, image_url: imageData.publicUrl }
    }
    return data
  })

  return (dataWithImage as any) || []
}

export default getPlayersByExa

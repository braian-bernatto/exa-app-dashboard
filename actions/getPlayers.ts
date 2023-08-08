import { Players } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getPlayers = async (): Promise<Players[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('players').select('*')

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    const { data: imageData } = supabase.storage
      .from('players')
      .getPublicUrl(data.image_url!)
    return { ...data, image_url: imageData.publicUrl }
  })

  return (dataWithImage as any) || []
}

export default getPlayers

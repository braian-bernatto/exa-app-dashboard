import { Teams } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getTeams = async (): Promise<Teams[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('teams').select('*')

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    const { data: imageData } = supabase.storage
      .from('teams')
      .getPublicUrl(data.logo_url!)
    return { ...data, logo_url: imageData.publicUrl }
  })

  return (dataWithImage as any) || []
}

export default getTeams

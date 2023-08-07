import { Exas } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getExas = async (): Promise<Exas[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('exas').select('*')

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    const { data: imageData } = supabase.storage
      .from('exas')
      .getPublicUrl(data.logo_url!)
    return { ...data, logo_url: imageData.publicUrl }
  })

  return (dataWithImage as any) || []
}

export default getExas

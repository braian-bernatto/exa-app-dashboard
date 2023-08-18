import { Torneos } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getTorneos = async (): Promise<Torneos[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('torneos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  const dataWithImage = data?.map(data => {
    const { data: imageData } = supabase.storage
      .from('torneos')
      .getPublicUrl(data.image_url!)
    return { ...data, image_url: imageData.publicUrl }
  })

  return (dataWithImage as any) || []
}

export default getTorneos

import { createClient } from '@/utils/supabaseServer'
import TorneoForm from './components/TorneoForm'

export const revalidate = 0

const TorneoPage = async ({
  params
}: {
  params: {
    torneoId: string
  }
}) => {
  const supabase = createClient()
  const { data: torneo } = await supabase
    .from('torneos')
    .select('name, image_url')
    .eq('id', params.torneoId)
    .single()

  let data

  if (torneo) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(torneo.image_url!)

    if (storage) {
      data = { ...torneo, public_image_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <TorneoForm initialData={data} />
    </div>
  )
}

export default TorneoPage

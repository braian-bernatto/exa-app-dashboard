import { createClient } from '@/utils/supabaseServer'
import TorneoForm from './components/TorneoForm'
import getExas from '@/actions/getExas'

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
    .select()
    .eq('id', params.torneoId)
    .single()

  const exas = await getExas()

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
      <TorneoForm initialData={data} exas={exas} />
    </div>
  )
}

export default TorneoPage

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
  const { data: fases } = await supabase.from('fases').select()

  //torneo_fase update
  const { data: torneo_fase } = await supabase
    .from('torneo_fase')
    .select('fase_id')
    .eq('torneo_id', params.torneoId)

  let data

  if (torneo) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(torneo.image_url!)

    data = { ...torneo, public_image_url: '', fases: [] }

    if (storage) {
      data = { ...data, public_image_url: storage.publicUrl }
    }
  }

  if (torneo && torneo_fase) {
    const ids = torneo_fase.map(fase => fase.fase_id)
    data = { ...data, fases: [...ids] }
  }

  return (
    <div className='flex flex-col items-center'>
      <TorneoForm initialData={data} exas={exas} fases={fases || []} />
    </div>
  )
}

export default TorneoPage

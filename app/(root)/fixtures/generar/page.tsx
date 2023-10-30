import { createClient } from '@/utils/supabaseServer'
import getTorneos from '@/actions/getTorneos'
import getLocations from '@/actions/getLocations'
import FixtureGenerarForm from './components/FixtureGenerarForm'

export const revalidate = 0

const FixutreGenerar = async () => {
  const supabase = createClient()
  const torneos = await getTorneos()
  const locations = await getLocations()

  const { data: tipos_partido } = await supabase
    .from('tipo_partido')
    .select()
    .order('id', { ascending: true })

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureGenerarForm
        torneos={torneos}
        tiposPartido={tipos_partido || []}
        locations={locations}
      />
    </div>
  )
}

export default FixutreGenerar

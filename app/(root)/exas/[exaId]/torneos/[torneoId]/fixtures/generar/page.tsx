import { createClient } from '@/utils/supabaseServer'
import getLocations from '@/actions/getLocations'
import FixtureGenerarForm from './components/FixtureGenerarForm'
import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import { shuffle } from '@/utils/shuffle'

export const revalidate = 0

const FixutreGenerar = async ({
  params
}: {
  params: {
    exaId: string
    torneoId: string
  }
}) => {
  const supabase = createClient()
  const locations = await getLocations()

  const { data: fases } = await supabase
    .from('fases')
    .select()
    .order('id', { ascending: true })

  const { data: tipos_partido } = await supabase
    .from('tipo_partido')
    .select()
    .order('id', { ascending: true })

  const teams = await getTeamsByTorneo(params.torneoId)
  const shuffledTeams = shuffle(teams)

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureGenerarForm
        teams={shuffledTeams}
        fases={fases || []}
        tiposPartido={tipos_partido || []}
        locations={locations}
      />
    </div>
  )
}

export default FixutreGenerar

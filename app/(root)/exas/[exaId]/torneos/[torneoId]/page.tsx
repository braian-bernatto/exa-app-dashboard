import { createClient } from '@/utils/supabaseServer'
import TorneoForm from './components/TorneoForm'
import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import getTeamsByExa from '@/actions/getTeamsByExa'

export const revalidate = 0

const TorneoPage = async ({
  params
}: {
  params: {
    exaId: number
    torneoId: string
  }
}) => {
  const supabase = createClient()

  const { data: torneo } = await supabase
    .from('torneos')
    .select()
    .eq('id', params.torneoId)
    .single()

  //torneo_teams update
  const { data: torneo_teams } = await supabase
    .from('torneo_teams')
    .select('team_id')
    .eq('torneo_id', params.torneoId)

  let data

  if (torneo) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(torneo.image_url!)

    data = { ...torneo, public_image_url: '', fases: [], teams: [] }

    if (storage) {
      data = { ...data, public_image_url: storage.publicUrl }
    }

    if (torneo_teams) {
      const ids = torneo_teams.map(team => team.team_id)
      data = { ...data, teams: [...ids] }
    }
  }

  const teams = await getTeamsByExa(params.exaId)

  return (
    <div className='flex flex-col items-center'>
      <TorneoForm initialData={data} teams={teams} />
    </div>
  )
}

export default TorneoPage

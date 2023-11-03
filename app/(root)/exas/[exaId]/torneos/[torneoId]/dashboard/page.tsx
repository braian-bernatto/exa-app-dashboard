import { createClient } from '@/utils/supabaseServer'
import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import { getTorneoFases } from '@/actions/getTorneoFases'
import TorneoClient from './components/client'

export const revalidate = 0

const TorneoDashboardPage = async ({
  params
}: {
  params: {
    torneoId: string
  }
}) => {
  const supabase = createClient()
  const teams = await getTeamsByTorneo(params.torneoId)
  const fases = await getTorneoFases(params.torneoId)

  return (
    <div className='flex flex-col items-center'>
      <TorneoClient id={params.torneoId} teams={teams} fases={fases} />
    </div>
  )
}

export default TorneoDashboardPage

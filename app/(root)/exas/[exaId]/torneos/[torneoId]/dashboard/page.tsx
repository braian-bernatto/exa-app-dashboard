import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import { getTorneoFases } from '@/actions/getTorneoFases'
import TorneoClient from './components/client'
import getLocations from '@/actions/getLocations'

export const revalidate = 0

const TorneoDashboardPage = async ({
  params
}: {
  params: {
    torneoId: string
  }
}) => {
  const teams = await getTeamsByTorneo(params.torneoId)
  const fases = await getTorneoFases(params.torneoId)
  const locations = await getLocations()

  return (
    <div className='flex flex-col items-center'>
      <TorneoClient
        id={params.torneoId}
        teams={teams}
        fases={fases}
        locations={locations}
      />
    </div>
  )
}

export default TorneoDashboardPage

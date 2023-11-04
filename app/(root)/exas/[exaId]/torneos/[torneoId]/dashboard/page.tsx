import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import { getTorneoFases } from '@/actions/getTorneoFases'
import TorneoClient from './components/client'
import getLocations from '@/actions/getLocations'
import getFases from '@/actions/getFases'
import getTiposPartido from '@/actions/getTiposPartido'

export const revalidate = 0

const TorneoDashboardPage = async ({
  params
}: {
  params: {
    torneoId: string
  }
}) => {
  const teams = await getTeamsByTorneo(params.torneoId)
  const torneoFases = await getTorneoFases(params.torneoId)
  const locations = await getLocations()
  const fases = await getFases()
  const tiposPartido = await getTiposPartido()

  return (
    <div className='flex flex-col items-center'>
      <TorneoClient
        id={params.torneoId}
        teams={teams}
        torneoFases={torneoFases}
        locations={locations}
        fases={fases}
        tiposPartido={tiposPartido}
      />
    </div>
  )
}

export default TorneoDashboardPage

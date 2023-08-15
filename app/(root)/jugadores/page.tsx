import getCountries from '@/actions/getCountries'
import getFoot from '@/actions/getFoot'
import getPositions from '@/actions/getPositions'
import getTeams from '@/actions/getTeams'
import PlayerForm from '@/components/PlayerForm'

export default async function JugadoresPage() {
  const teams = await getTeams()
  const positions = await getPositions()
  const countries = await getCountries()
  const foot = await getFoot()
  return (
    <PlayerForm
      teams={teams}
      positions={positions}
      countries={countries}
      foot={foot}
    />
  )
}

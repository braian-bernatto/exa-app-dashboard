import getCountries from '@/actions/getCountries'
import getExas from '@/actions/getExas'
import getFixtures from '@/actions/getFixtures'
import getFoot from '@/actions/getFoot'
import getLocations from '@/actions/getLocations'
import getPlayers from '@/actions/getPlayers'
import getPositions from '@/actions/getPositions'
import getTeams from '@/actions/getTeams'
import getTorneos from '@/actions/getTorneos'
import ExaForm from '@/components/ExaForm'
import FixtureForm from '@/components/FixtureForm'
import FixtureTeamsForm from '@/components/FixtureTeamsForm'
import PlayerForm from '@/components/PlayerForm'
import TeamForm from '@/components/TeamForm'
import TorneoForm from '@/components/TorneoForm'

export default async function Home() {
  const teams = await getTeams()
  const positions = await getPositions()
  const countries = await getCountries()
  const exas = await getExas()
  const foot = await getFoot()
  const players = await getPlayers()
  const locations = await getLocations()
  const torneos = await getTorneos()
  const fixtures = await getFixtures()

  return (
    <>
      <FixtureTeamsForm fixtures={fixtures} teams={teams} players={players} />
      <FixtureForm torneos={torneos} locations={locations} />
      <TorneoForm />
      <PlayerForm
        teams={teams}
        positions={positions}
        countries={countries}
        foot={foot}
      />
      <TeamForm exas={exas} />
      <ExaForm />
    </>
  )
}

import getFixtures from '@/actions/getFixtures'
import getLocations from '@/actions/getLocations'
import getPlayers from '@/actions/getPlayers'
import getTeams from '@/actions/getTeams'
import getTorneos from '@/actions/getTorneos'
import FixtureForm from '@/components/FixtureForm'
import FixtureTeamsForm from '@/components/FixtureTeamsForm'

export default async function FixturesPage() {
  const teams = await getTeams()
  const players = await getPlayers()
  const locations = await getLocations()
  const torneos = await getTorneos()
  const fixtures = await getFixtures()

  return (
    <>
      <FixtureForm torneos={torneos} locations={locations} />
      <FixtureTeamsForm fixtures={fixtures} teams={teams} players={players} />
    </>
  )
}

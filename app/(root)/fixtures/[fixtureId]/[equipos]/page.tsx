import FixtureTeamsForm from '@/app/(root)/fixtures/[fixtureId]/[equipos]/components/FixtureTeamsForm'
import getFixtures from '@/actions/getFixtures'
import getTeams from '@/actions/getTeams'
import getPlayers from '@/actions/getPlayers'
import { createClient } from '@/utils/supabaseServer'

export const revalidate = 0

const FixutrePage = async ({
  params
}: {
  params: {
    fixtureId: string
  }
}) => {
  const fixtures = await getFixtures()
  const teams = await getTeams()
  const players = await getPlayers()

  const supabase = createClient()
  const { data: fixtureDetails } = await supabase
    .from('fixture_details')
    .select('*, team_1(id, name, image_url), team_2(id, name, image_url)')
    .eq('fixture_id', +params.fixtureId)

  const { data: player } = await supabase
    .from('goals')
    .select('*, players(name)')
    .eq('fixture_id', +params.fixtureId)

  console.log(player)

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureTeamsForm
        initialData={fixtureDetails[0] || []}
        fixtures={fixtures}
        teams={teams}
        players={players}
      />
    </div>
  )
}

export default FixutrePage

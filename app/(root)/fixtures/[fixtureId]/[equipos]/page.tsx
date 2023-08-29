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
    equipos: string
  }
}) => {
  const fixtures = await getFixtures()
  const teams = await getTeams()
  const players = await getPlayers()

  // TODO: revisar porque se refresca 6 veces el dom

  console.log(params.equipos.split('-vs-'))

  const supabase = createClient()
  const { data: fixtureDetails } = await supabase
    .from('fixture_details')
    .select()
    .eq('fixture_id', +params.fixtureId)
    .eq('team_1', +params.equipos.split('-vs-')[0])
    .eq('team_2', +params.equipos.split('-vs-')[1])

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureTeamsForm
        initialData={fixtureDetails?.length ? fixtureDetails[0] : undefined}
        fixtures={fixtures}
        teams={teams}
        players={players}
      />
    </div>
  )
}

export default FixutrePage

import FixtureTeamsForm from '@/app/(root)/fixtures/[fixtureId]/[equipos]/components/FixtureTeamsForm'
import getFixtures from '@/actions/getFixtures'
import { createClient } from '@/utils/supabaseServer'
import getTeamsByExa from '@/actions/getTeamsByExa'
import getPlayersByExa from '@/actions/getPlayersByExa'

export const revalidate = 0

const FixutrePage = async ({
  params
}: {
  params: {
    fixtureId: string
    equipos: string
  }
}) => {
  const supabase = createClient()

  const { data: fixture } = await supabase
    .from('fixtures')
    .select('torneos(exas(id))')
    .eq('id', +params.fixtureId)
    .single()

  const fixtures = await getFixtures()
  //@ts-ignore
  const teams = await getTeamsByExa(fixture?.torneos?.exas.id)
  //@ts-ignore
  const players = await getPlayersByExa(fixture?.torneos?.exas.id)

  // TODO: revisar porque se refresca 6 veces el dom

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

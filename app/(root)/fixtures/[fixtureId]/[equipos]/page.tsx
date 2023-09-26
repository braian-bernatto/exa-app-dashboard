import FixtureTeamsForm from '@/app/(root)/fixtures/[fixtureId]/[equipos]/components/FixtureTeamsForm'
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

  const { data: fixture, error } = await supabase
    .rpc('get_fixture_by_id', {
      fixture_id: params.fixtureId
    })
    .single()

  if (error) {
    console.log(error)
    return <p>Hubo un error en el servidor</p>
  }

  const teams = await getTeamsByExa(fixture.exa_id)
  const players = await getPlayersByExa(fixture.exa_id)

  // TODO: revisar porque se refresca 6 veces el dom

  const { data: fixtureTeams } = await supabase
    .from('fixture_teams')
    .select()
    .eq('fixture_id', params.fixtureId)
    .eq('team_local', +params.equipos.split('-vs-')[0])
    .eq('team_visit', +params.equipos.split('-vs-')[1])

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureTeamsForm
        initialData={fixtureTeams}
        teams={teams}
        players={players}
      />
    </div>
  )
}

export default FixutrePage

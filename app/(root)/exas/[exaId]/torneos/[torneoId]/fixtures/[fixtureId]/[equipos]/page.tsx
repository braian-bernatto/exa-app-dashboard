import { createClient } from '@/utils/supabaseServer'
import getPlayersByExa from '@/actions/getPlayersByExa'
import getTeamsByTorneo from '@/actions/getTeamsByTorneo'
import FixtureTeamsForm from './components/FixtureTeamsForm'

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
    return <p>Hubo un error en el servidor tembo</p>
  }

  const teams = await getTeamsByTorneo(fixture.torneo_id)
  const players = await getPlayersByExa(fixture.exa_id)

  // TODO: revisar porque se refresca 6 veces el dom

  const { data: fixtureTeams } = await supabase
    .from('fixture_teams')
    .select()
    .eq('fixture_id', params.fixtureId)
    .eq('team_local', +params.equipos.split('-vs-')[0])
    .eq('team_visit', +params.equipos.split('-vs-')[1])
    .single()

  const { data: fixturePlayers } = await supabase.rpc(
    'get_fixture_players_by_fixture_id',
    {
      fixture: params.fixtureId,
      local: +params.equipos.split('-vs-')[0],
      visit: +params.equipos.split('-vs-')[1]
    }
  )

  const data =
    fixtureTeams && fixturePlayers
      ? { ...fixtureTeams, fixturePlayers }
      : undefined

  return (
    <div className='flex flex-col gap-5 items-center'>
      <FixtureTeamsForm initialData={data} teams={teams} players={players} />
    </div>
  )
}

export default FixutrePage

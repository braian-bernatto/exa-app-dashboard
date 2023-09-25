import { createClient } from '@/utils/supabaseServer'
import getTorneos from '@/actions/getTorneos'
import getLocations from '@/actions/getLocations'
import FixtureDetailsClient from './components/client'

export const revalidate = 0

const FixutrePage = async ({
  params
}: {
  params: {
    fixtureId: string
  }
}) => {
  const supabase = createClient()
  const torneos = await getTorneos()
  const locations = await getLocations()

  const { data: fixture } = await supabase
    .rpc('get_fixture_by_id', {
      fixture_id: params.fixtureId
    })
    .single()

  let data

  if (fixture) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(fixture.torneo_image_url)
    if (storage) {
      data = { ...fixture, torneo_public_image_url: storage.publicUrl }
    }
  }

  const { data: fixtureDetails } = await supabase
    .from('fixture_details')
    .select('*, team_1(id, name, image_url), team_2(id, name, image_url)')
    .eq('fixture_id', +params.fixtureId)
    .order('date', { ascending: true })

  const { data: tipos_partido } = await supabase
    .from('tipo_partido')
    .select()
    .order('id', { ascending: true })

  return (
    <div className='flex flex-col gap-5'>
      <FixtureDetailsClient
        torneos={torneos}
        tiposPartido={tipos_partido || []}
        locations={locations}
        data={data}
        fixtureDetails={fixtureDetails || []}
      />
    </div>
  )
}

export default FixutrePage

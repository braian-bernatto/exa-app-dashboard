import { createClient } from '@/utils/supabaseServer'
import FixtureForm from './components/FixtureForm'
import getTorneos from '@/actions/getTorneos'
import getLocations from '@/actions/getLocations'

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
    .from('fixtures')
    .select('*, torneos(name, image_url)')
    .eq('id', params.fixtureId)
    .single()

  let data

  if (fixture) {
    const { data: storage } = supabase.storage
      .from('torneos')
      .getPublicUrl(fixture.torneos?.image_url!)
    if (storage) {
      data = { ...fixture, torneo_public_image_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <FixtureForm initialData={data} torneos={torneos} locations={locations} />
    </div>
  )
}

export default FixutrePage

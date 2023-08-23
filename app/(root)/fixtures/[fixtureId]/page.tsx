import { createClient } from '@/utils/supabaseServer'
import FixtureForm from './components/FixtureForm'
import getTorneos from '@/actions/getTorneos'
import getLocations from '@/actions/getLocations'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Separator } from '@/components/ui/separator'

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
    .select(
      '*, torneos(name, image_url), fixture_details(team_1, team_2, date, cancha_nro)'
    )
    .eq('id', +params.fixtureId)
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
    <div className='flex flex-col items-center gap-5'>
      <FixtureForm initialData={data} torneos={torneos} locations={locations} />
      <Separator />
      <DataTable
        columns={columns}
        data={data?.fixture_details || []}
        filterLabel='Nombre'
        filterKey='name'
      />
    </div>
  )
}

export default FixutrePage

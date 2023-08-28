import { createClient } from '@/utils/supabaseServer'
import FixtureForm from './components/FixtureForm'
import getTorneos from '@/actions/getTorneos'
import getLocations from '@/actions/getLocations'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './components/columns'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

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

  const { data: fixtureDetails } = await supabase
    .from('fixture_details')
    .select('*, team_1(id, name, image_url), team_2(id, name, image_url)')
    .eq('fixture_id', +params.fixtureId)
    .order('date', { ascending: true })

  return (
    <div className='flex flex-col gap-5'>
      <FixtureForm initialData={data} torneos={torneos} locations={locations} />
      <Separator />
      <div className='flex items-center justify-end'>
        <Link href={`/fixtures/${params.fixtureId}/agregar`}>
          <Button>
            <Plus className='mr-2 h-4 w-4' /> Agregar Versus
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={fixtureDetails || []}
        filterLabel='Fecha'
        filterKey='date'
      />
    </div>
  )
}

export default FixutrePage

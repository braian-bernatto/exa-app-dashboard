import FixtureClient from './components/client'
import { createClient } from '@/utils/supabaseServer'

export default async function FixturesPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('get_fixtures')
    .order('torneo_id', { ascending: true })
    .order('name', { ascending: false })

  if (error) {
    console.log(error)
    return <p>Hubo un error en el servidor</p>
  }

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <FixtureClient data={data || []} />
      </div>
    </div>
  )
}

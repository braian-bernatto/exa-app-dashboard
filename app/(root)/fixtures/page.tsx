import FixtureClient from './components/client'
import { createClient } from '@/utils/supabaseServer'

export default async function FixturesPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('fixtures')
    .select('*, torneos(name, image_url, exas(name)), locations(name)')
    .order('created_at', { ascending: true })

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <FixtureClient data={data || []} />
      </div>
    </div>
  )
}

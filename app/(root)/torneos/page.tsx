import { createClient } from '@/utils/supabaseServer'
import TorneosClient from './components/client'

export const revalidate = 0

export default async function TorneosPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('torneos')
    .select('*, exas(id, name, image_url)')
    .order('id', { ascending: false })

  if (error) {
    console.log(error)
    return <p>Hubo un error en el servidor</p>
  }

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <TorneosClient data={data || []} />
      </div>
    </div>
  )
}

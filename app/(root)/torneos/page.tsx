import { Torneos } from '@/types'
import { createClient } from '@/utils/supabaseServer'
import { format, parseISO } from 'date-fns'
import TorneosClient from './components/client'

export const revalidate = 0

export default async function TorneosPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('torneos')
    .select('*, exas(id, name, image_url)')
    .order('created_at', { ascending: false })

  const formattedTorneos: Torneos[] | undefined = data?.map(item => ({
    ...item,
    id: item.id,
    name: item.name,
    image_url: item.image_url || '',
    created_at: format(parseISO(item.created_at!), 'dd/MM/yyyy')
  }))

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <TorneosClient data={formattedTorneos || []} />
      </div>
    </div>
  )
}

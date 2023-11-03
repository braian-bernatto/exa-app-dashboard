import { createClient } from '@/utils/supabaseServer'
import ExaClient from './components/client'
import { format, parseISO } from 'date-fns'

export const revalidate = 0

export default async function ExasPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('exas')
    .select()
    .order('created_at', { ascending: false })

  const formattedExas: any[] | undefined = data?.map(item => ({
    id: item.id,
    name: item.name,
    image_url: item.image_url || '',
    created_at: format(parseISO(item.created_at!), 'dd/MM/yyyy')
  }))

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <ExaClient data={formattedExas || []} />
      </div>
    </div>
  )
}

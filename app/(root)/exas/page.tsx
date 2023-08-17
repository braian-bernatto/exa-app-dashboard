import { createClient } from '@/utils/supabaseBrowser'
import ExaClient from './components/client'
import { ExaColumn } from './components/columns'
import { format, parseISO } from 'date-fns'

export const revalidate = 0

export default async function ExasPage() {
  const supabase = createClient()
  const { data, error } = await supabase.from('exas').select()

  const formattedExas: ExaColumn[] | undefined = data?.map(item => ({
    id: item.id,
    name: item.name,
    logo_url: item.logo_url || '',
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

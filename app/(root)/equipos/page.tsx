import { createClient } from '@/utils/supabaseServer'
import { TeamColumn } from './components/columns'
import { format, parseISO } from 'date-fns'
import TeamClient from './components/client'

export const revalidate = 0

export default async function EquiposPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*, exas(id, name, image_url)')
    .order('created_at', { ascending: true })

  if (error) {
    console.log(error)
    return <p>Hubo un error en el servidor</p>
  }

  const formattedTeams: TeamColumn[] | undefined = data?.map(item => ({
    id: item.id,
    name: item.name,
    image_url: item.image_url || '',
    created_at: format(parseISO(item.created_at!), 'dd/MM/yyyy'),
    exa_id: item.exa_id,
    // @ts-ignore
    exa_name: item.exas?.name,
    // @ts-ignore
    exa_image_url: item.exas?.image_url
  }))

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <TeamClient data={formattedTeams || []} />
      </div>
    </div>
  )
}

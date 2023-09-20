import { createClient } from '@/utils/supabaseServer'
import PlayerClient from './components/client'
import { PlayerColumn } from './components/columns'
import { format, parseISO } from 'date-fns'

export default async function JugadoresPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select(
      '*, teams(id, name, image_url), positions(id, name), foot(id, name)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
    return <p>Hubo un error en el servidor</p>
  }

  const formattedPlayers: PlayerColumn[] | undefined = data?.map(item => ({
    id: item.id,
    name: item.name,
    team_id: item.team_id,
    team_name: item.teams?.name || '',
    team_image_url: item.teams?.image_url || '',
    image_url: item.image_url,
    position_id: item.position_id,
    position_name: item.positions?.name,
    foot_id: item.foot_id,
    foot: item.foot?.name,
    rating: item.rating,
    rit: item.rit,
    tir: item.tir,
    pas: item.pas,
    reg: item.reg,
    def: item.def,
    fis: item.fis,
    active: item.active,
    country_iso2: item.country_iso2,
    created_at: format(parseISO(item.created_at!), 'dd/MM/yyyy')
  }))

  return (
    <div className='flex-col w-full'>
      <div className='flex-1 space-y-4'>
        <PlayerClient data={formattedPlayers || []} />
      </div>
    </div>
  )
}

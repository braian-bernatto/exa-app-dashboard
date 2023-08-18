import getCountries from '@/actions/getCountries'
import getFoot from '@/actions/getFoot'
import getPositions from '@/actions/getPositions'
import getTeams from '@/actions/getTeams'
import PlayerForm from '@/app/(root)/jugadores/[jugadorId]/components/PlayerForm'
import { createClient } from '@/utils/supabaseServer'

export const revalidate = 0

const PlayerPage = async ({
  params
}: {
  params: {
    jugadorId: string
  }
}) => {
  const teams = await getTeams()
  const positions = await getPositions()
  const countries = await getCountries()
  const foot = await getFoot()

  const supabase = createClient()

  const { data: player } = await supabase
    .from('players')
    .select()
    .eq('id', params.jugadorId)
    .single()

  let data

  if (player) {
    const { data: storage } = supabase.storage
      .from('players')
      .getPublicUrl(player.image_url!)
    if (storage) {
      data = { ...player, public_image_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <PlayerForm
        initialData={data}
        teams={teams}
        positions={positions}
        countries={countries}
        foot={foot}
      />
    </div>
  )
}

export default PlayerPage

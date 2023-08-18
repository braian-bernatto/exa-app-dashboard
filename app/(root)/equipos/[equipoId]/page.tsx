import { createClient } from '@/utils/supabaseServer'
import TeamForm from './components/TeamForm'
import getExas from '@/actions/getExas'

const TeamPage = async ({
  params
}: {
  params: {
    equipoId: string
  }
}) => {
  const supabase = createClient()

  const exas = await getExas()

  const { data: team } = await supabase
    .from('teams')
    .select()
    .eq('id', +params.equipoId)
    .single()

  let data

  if (team) {
    const { data: storage } = supabase.storage
      .from('teams')
      .getPublicUrl(team.logo_url!)

    if (storage) {
      data = { ...team, public_logo_url: storage.publicUrl }
    }
  }

  return (
    <div className='flex flex-col items-center'>
      <TeamForm initialData={data} exas={exas} />
    </div>
  )
}

export default TeamPage

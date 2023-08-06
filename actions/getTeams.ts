import { Teams } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getTeams = async (): Promise<Teams[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('teams').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getTeams

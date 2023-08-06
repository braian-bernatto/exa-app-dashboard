import { Positions } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getPositions = async (): Promise<Positions[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('positions').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getPositions

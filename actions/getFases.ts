import { Fases } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getFases = async (): Promise<Fases[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('fases').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getFases

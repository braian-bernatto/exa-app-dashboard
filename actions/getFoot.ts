import { Foot } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getFoot = async (): Promise<Foot[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('foot').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getFoot

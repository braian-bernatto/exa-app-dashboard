import { Locations } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getLocations = async (): Promise<Locations[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('locations').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getLocations

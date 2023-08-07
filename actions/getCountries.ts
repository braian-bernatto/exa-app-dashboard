import { Countries } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getCountries = async (): Promise<Countries[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('continent', { ascending: false })

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getCountries

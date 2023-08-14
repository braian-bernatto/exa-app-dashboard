import { Fixtures } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getFixtures = async (): Promise<Fixtures[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getFixtures

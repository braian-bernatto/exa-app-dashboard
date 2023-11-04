import { TiposPartido } from '@/types'
import { createClient } from '@/utils/supabaseServer'

const getTiposPartido = async (): Promise<TiposPartido[]> => {
  const supabase = createClient()
  const { data, error } = await supabase.from('tipo_partido').select('*')

  if (error) {
    console.log(error)
  }

  return (data as any) || []
}

export default getTiposPartido

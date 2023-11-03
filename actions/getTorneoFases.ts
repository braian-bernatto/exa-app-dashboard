import { createClient } from '@/utils/supabaseServer'

export async function getTorneoFases(torneoId: string) {
    const supabase = createClient()
    const { data, count } = await supabase
      .from('torneo_fase')
      .select('*, fases(id, name), tipo_partido(id, name)')
      .eq('torneo_id', torneoId)

    return data || []
  }
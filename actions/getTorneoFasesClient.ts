import { createClient } from "@/utils/supabaseBrowser"

export async function getTorneoFasesClient(torneoId: string) {
    const supabase = createClient()
    const { data, count } = await supabase
      .from('torneo_fase')
      .select('*, fases(id, name), tipo_partido(id, name)')
      .eq('torneo_id', torneoId)
      .order('fase_nro', {ascending: true})

    return data || []
  }
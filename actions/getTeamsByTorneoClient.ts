'use client'
import { Teams } from '@/types'
import { createClient } from '@/utils/supabaseBrowser'


const getTeamsByTorneoClient = async (torneo: string): Promise<Teams[]> => {
  const supabase = createClient()

  const { data: teamsList, error: teamsError } = await supabase.from('torneo_teams').select('team_id').eq('torneo_id', torneo)

  if(teamsError){
    console.log(teamsError)    
  }

  if(teamsList){
    const idList = teamsList.map(team=> team.team_id)  

    const { data, error } = await supabase.from('teams').select().in('id', idList)
    
    if (error) {
      console.log(error)
    }
    
    const dataWithImage = data?.map(data => {
      if (data.image_url?.length) {
        const { data: imageData } = supabase.storage
        .from('teams')
        .getPublicUrl(data.image_url!)
        return { ...data, image_url: imageData.publicUrl }
      }
      return data
    })
    
    return (dataWithImage as any) || []
  }
  return []
}

export default getTeamsByTorneoClient

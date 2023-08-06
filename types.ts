import { Database } from './types_db'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Countries = Database['public']['Tables']['countries']['Row']
export type Positions = Database['public']['Tables']['positions']['Row']
export type Teams = Database['public']['Tables']['teams']['Row']

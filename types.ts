import { Database } from './types_db'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Countries = Database['public']['Tables']['countries']['Row']
export type Positions = Database['public']['Tables']['positions']['Row']
export type Teams = Database['public']['Tables']['teams']['Row']
export type Exas = Database['public']['Tables']['exas']['Row']
export type Foot = Database['public']['Tables']['foot']['Row']
export type Players = Database['public']['Tables']['players']['Row']

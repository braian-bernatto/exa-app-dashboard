import { Database } from './types_db'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Countries = Database['public']['Tables']['countries']['Row']
export type Positions = Database['public']['Tables']['positions']['Row']
export type Teams = Database['public']['Tables']['teams']['Row']
export type Exas = Database['public']['Tables']['exas']['Row']
export type Torneos = Database['public']['Tables']['torneos']['Row']
export type Fases = Database['public']['Tables']['fases']['Row']
export type Foot = Database['public']['Tables']['foot']['Row']
export type Players = Database['public']['Tables']['players']['Row']
export type Locations = Database['public']['Tables']['locations']['Row']
export type Fixtures = Database['public']['Tables']['fixtures']['Row']
export type GetFixtures = Database['public']['Functions']['get_fixtures']['Returns']

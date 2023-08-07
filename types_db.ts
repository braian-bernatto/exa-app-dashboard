export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          continent: Database["public"]["Enums"]["continents"] | null
          id: number
          iso2: string
          iso3: string | null
          local_name: string | null
          name: string | null
        }
        Insert: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Update: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2?: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      exas: {
        Row: {
          created_at: string | null
          id: number
          logo_url: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          country_id: number | null
          created_at: string | null
          def: number | null
          fis: number | null
          foot: string | null
          id: number
          image: string | null
          name: string | null
          pas: number | null
          position_id: string | null
          rating: number | null
          reg: number | null
          rit: number | null
          team_id: number | null
          tir: number | null
        }
        Insert: {
          country_id?: number | null
          created_at?: string | null
          def?: number | null
          fis?: number | null
          foot?: string | null
          id?: number
          image?: string | null
          name?: string | null
          pas?: number | null
          position_id?: string | null
          rating?: number | null
          reg?: number | null
          rit?: number | null
          team_id?: number | null
          tir?: number | null
        }
        Update: {
          country_id?: number | null
          created_at?: string | null
          def?: number | null
          fis?: number | null
          foot?: string | null
          id?: number
          image?: string | null
          name?: string | null
          pas?: number | null
          position_id?: string | null
          rating?: number | null
          reg?: number | null
          rit?: number | null
          team_id?: number | null
          tir?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_country_id_fkey"
            columns: ["country_id"]
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_position_id_fkey"
            columns: ["position_id"]
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      positions: {
        Row: {
          description: string | null
          id: string
        }
        Insert: {
          description?: string | null
          id: string
        }
        Update: {
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          exa_id: number | null
          id: number
          logo_url: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          exa_id?: number | null
          id?: number
          logo_url?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          exa_id?: number | null
          id?: number
          logo_url?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_exa_id_fkey"
            columns: ["exa_id"]
            referencedRelation: "exas"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

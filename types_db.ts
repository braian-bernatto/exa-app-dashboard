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
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      fases: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      fixture_players: {
        Row: {
          fixture_id: string
          goals: number
          is_local: boolean
          is_present: boolean
          player_id: number
          red_card: boolean
          red_card_motive: string | null
          team_id: number
          team_local: number
          team_visit: number
          yellow_cards: number
        }
        Insert: {
          fixture_id: string
          goals: number
          is_local: boolean
          is_present?: boolean
          player_id: number
          red_card?: boolean
          red_card_motive?: string | null
          team_id: number
          team_local: number
          team_visit: number
          yellow_cards?: number
        }
        Update: {
          fixture_id?: string
          goals?: number
          is_local?: boolean
          is_present?: boolean
          player_id?: number
          red_card?: boolean
          red_card_motive?: string | null
          team_id?: number
          team_local?: number
          team_visit?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixture_teams_fixture_players_fk"
            columns: ["fixture_id", "team_local", "team_visit"]
            referencedRelation: "fixture_teams"
            referencedColumns: ["fixture_id", "team_local", "team_visit"]
          },
          {
            foreignKeyName: "players_fixture_players_fk"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_fixture_players_fk"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      fixture_teams: {
        Row: {
          fixture_id: string
          team_local: number
          team_visit: number
          walkover_local: boolean
          walkover_visit: boolean
        }
        Insert: {
          fixture_id: string
          team_local: number
          team_visit: number
          walkover_local?: boolean
          walkover_visit?: boolean
        }
        Update: {
          fixture_id?: string
          team_local?: number
          team_visit?: number
          walkover_local?: boolean
          walkover_visit?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_fixture_teams_fk"
            columns: ["fixture_id"]
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_fixture_teams_fk"
            columns: ["team_local"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_fixture_teams_fk1"
            columns: ["team_visit"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      fixtures: {
        Row: {
          fase_id: number
          id: string
          location_id: number | null
          name: string
          torneo_id: string
        }
        Insert: {
          fase_id: number
          id?: string
          location_id?: number | null
          name: string
          torneo_id: string
        }
        Update: {
          fase_id?: number
          id?: string
          location_id?: number | null
          name?: string
          torneo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_fixtures_fk"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_fixtures_fk"
            columns: ["torneo_id", "fase_id"]
            referencedRelation: "torneo_fase"
            referencedColumns: ["torneo_id", "fase_id"]
          }
        ]
      }
      foot: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: number
          map_url: string | null
          name: string
        }
        Insert: {
          id?: number
          map_url?: string | null
          name: string
        }
        Update: {
          id?: number
          map_url?: string | null
          name?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          active: boolean
          country_iso2: string | null
          created_at: string | null
          def: number | null
          fis: number | null
          foot_id: number | null
          id: number
          image_url: string | null
          name: string
          pas: number | null
          position_id: string
          rating: number | null
          reg: number | null
          rit: number | null
          team_id: number
          tir: number | null
        }
        Insert: {
          active?: boolean
          country_iso2?: string | null
          created_at?: string | null
          def?: number | null
          fis?: number | null
          foot_id?: number | null
          id?: number
          image_url?: string | null
          name: string
          pas?: number | null
          position_id: string
          rating?: number | null
          reg?: number | null
          rit?: number | null
          team_id: number
          tir?: number | null
        }
        Update: {
          active?: boolean
          country_iso2?: string | null
          created_at?: string | null
          def?: number | null
          fis?: number | null
          foot_id?: number | null
          id?: number
          image_url?: string | null
          name?: string
          pas?: number | null
          position_id?: string
          rating?: number | null
          reg?: number | null
          rit?: number | null
          team_id?: number
          tir?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_country_iso2_fkey"
            columns: ["country_iso2"]
            referencedRelation: "countries"
            referencedColumns: ["iso2"]
          },
          {
            foreignKeyName: "players_foot_id_fkey"
            columns: ["foot_id"]
            referencedRelation: "foot"
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
          id: string
          name: string | null
        }
        Insert: {
          id: string
          name?: string | null
        }
        Update: {
          id?: string
          name?: string | null
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
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          exa_id?: number | null
          id?: number
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          exa_id?: number | null
          id?: number
          image_url?: string | null
          name?: string
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
      tipo_partido: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      torneo_fase: {
        Row: {
          fase_id: number
          tipo_partido_id: number | null
          torneo_id: string
        }
        Insert: {
          fase_id: number
          tipo_partido_id?: number | null
          torneo_id: string
        }
        Update: {
          fase_id?: number
          tipo_partido_id?: number | null
          torneo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fases_torneo_fase_fk"
            columns: ["fase_id"]
            referencedRelation: "fases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_fase_id_fkey"
            columns: ["fase_id"]
            referencedRelation: "fases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_tipo_partido_id_fkey"
            columns: ["tipo_partido_id"]
            referencedRelation: "tipo_partido"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_torneo_id_fkey"
            columns: ["torneo_id"]
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneos_torneo_fase_fk"
            columns: ["torneo_id"]
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          }
        ]
      }
      torneos: {
        Row: {
          exa_id: number
          id: string
          image_url: string | null
          name: string
          points_defeat: number
          points_tie: number
          points_victory: number
        }
        Insert: {
          exa_id: number
          id?: string
          image_url?: string | null
          name: string
          points_defeat?: number
          points_tie?: number
          points_victory?: number
        }
        Update: {
          exa_id?: number
          id?: string
          image_url?: string | null
          name?: string
          points_defeat?: number
          points_tie?: number
          points_victory?: number
        }
        Relationships: [
          {
            foreignKeyName: "torneos_exa_id_fkey"
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
      delete_exa_logo: {
        Args: {
          image_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_goals: {
        Args: {
          fixture: number
          team_1: number
          team_2: number
        }
        Returns: boolean
      }
      delete_not_goals: {
        Args: {
          fixture: number
          player_ids: number[]
        }
        Returns: boolean
      }
      delete_not_red_cards: {
        Args: {
          fixture: number
          player_ids: number[]
        }
        Returns: boolean
      }
      delete_not_yellow_cards_array: {
        Args: {
          fixture: number
          player_ids: number[]
        }
        Returns: boolean
      }
      delete_player_image: {
        Args: {
          image_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_red_cards: {
        Args: {
          fixture: number
          team_1: number
          team_2: number
        }
        Returns: boolean
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      delete_team_logo: {
        Args: {
          image_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_torneo_logo: {
        Args: {
          image_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_versus: {
        Args: {
          fixture: number
          team_one: number
          team_two: number
        }
        Returns: boolean
      }
      delete_walkovers: {
        Args: {
          fixture: number
          team_1: number
          team_2: number
        }
        Returns: boolean
      }
      delete_yellow_cards: {
        Args: {
          fixture: number
          team_1: number
          team_2: number
        }
        Returns: boolean
      }
      get_fases_torneo: {
        Args: {
          torneo: string
        }
        Returns: {
          torneo_id: string
          fase_id: number
          tipo_partido_id: number
          torneo: string
          torneo_image_url: string
          fase: string
          tipo_partido_name: string
        }[]
      }
      get_fixture_details: {
        Args: {
          fixture: number
        }
        Returns: Json
      }
      get_fixtures: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixture_id: string
          torneo_id: string
          fase_id: number
          name: string
          location_id: number
          exa: string
          torneo: string
          torneo_image_url: string
          fase: string
          tipo_partido_id: number
          tipo_partido_name: string
          location_name: string
        }[]
      }
      get_fixtures_by_torneo: {
        Args: {
          torneo_id: number
        }
        Returns: {
          id: number
          created_at: string
          name: string
          location_id: number
          torneo_id: number
          date: string
          location: string
        }[]
      }
      get_goals: {
        Args: {
          fixture: number
          team: number
        }
        Returns: number
      }
      get_players_by_exa_id: {
        Args: {
          exa_id: number
        }
        Returns: {
          active: boolean
          country_iso2: string | null
          created_at: string | null
          def: number | null
          fis: number | null
          foot_id: number | null
          id: number
          image_url: string | null
          name: string
          pas: number | null
          position_id: string
          rating: number | null
          reg: number | null
          rit: number | null
          team_id: number
          tir: number | null
        }[]
      }
      get_tabla_posiciones: {
        Args: {
          p_torneo_id: number
        }
        Returns: {
          team_id: number
          team_name: string
          team_image_url: string
          jugados: number
          ganados: number
          empatados: number
          perdidos: number
          goles_favor: number
          goles_contra: number
          diferencia: number
          puntos: number
        }[]
      }
      get_team_ids_fixture: {
        Args: {
          fixture: number
        }
        Returns: number[]
      }
      get_teams_by_exa_id: {
        Args: {
          exa_id: number
        }
        Returns: {
          created_at: string | null
          exa_id: number | null
          id: number
          image_url: string | null
          name: string
        }[]
      }
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

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
            foreignKeyName: "fixture_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_teams_fixture_players_fk"
            columns: ["fixture_id", "team_local", "team_visit"]
            isOneToOne: false
            referencedRelation: "fixture_teams"
            referencedColumns: ["fixture_id", "team_local", "team_visit"]
          }
        ]
      }
      fixture_teams: {
        Row: {
          cancha_nro: number | null
          date: string | null
          fixture_id: string
          order: number
          team_local: number
          team_visit: number
          walkover_local: boolean
          walkover_local_goals: number | null
          walkover_visit: boolean
          walkover_visit_goals: number | null
        }
        Insert: {
          cancha_nro?: number | null
          date?: string | null
          fixture_id: string
          order?: number
          team_local: number
          team_visit: number
          walkover_local?: boolean
          walkover_local_goals?: number | null
          walkover_visit?: boolean
          walkover_visit_goals?: number | null
        }
        Update: {
          cancha_nro?: number | null
          date?: string | null
          fixture_id?: string
          order?: number
          team_local?: number
          team_visit?: number
          walkover_local?: boolean
          walkover_local_goals?: number | null
          walkover_visit?: boolean
          walkover_visit_goals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fixture_teams_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_teams_team_local_fkey"
            columns: ["team_local"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixture_teams_team_visit_fkey"
            columns: ["team_visit"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_fixture_teams_fk"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          }
        ]
      }
      fixtures: {
        Row: {
          fase_nro: number | null
          id: string
          is_vuelta: boolean | null
          location_id: number | null
          name: string
          order: number
          torneo_id: string
        }
        Insert: {
          fase_nro?: number | null
          id?: string
          is_vuelta?: boolean | null
          location_id?: number | null
          name: string
          order?: number
          torneo_id: string
        }
        Update: {
          fase_nro?: number | null
          id?: string
          is_vuelta?: boolean | null
          location_id?: number | null
          name?: string
          order?: number
          torneo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
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
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["iso2"]
          },
          {
            foreignKeyName: "players_foot_id_fkey"
            columns: ["foot_id"]
            isOneToOne: false
            referencedRelation: "foot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
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
            isOneToOne: true
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
            isOneToOne: false
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
          fase_nro: number
          tipo_partido_id: number
          torneo_id: string
        }
        Insert: {
          fase_id: number
          fase_nro?: number
          tipo_partido_id: number
          torneo_id: string
        }
        Update: {
          fase_id?: number
          fase_nro?: number
          tipo_partido_id?: number
          torneo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "torneo_fase_fase_id_fkey"
            columns: ["fase_id"]
            isOneToOne: false
            referencedRelation: "fases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_tipo_partido_id_fkey"
            columns: ["tipo_partido_id"]
            isOneToOne: false
            referencedRelation: "tipo_partido"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_fase_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          }
        ]
      }
      torneo_teams: {
        Row: {
          team_id: number
          torneo_id: string
        }
        Insert: {
          team_id: number
          torneo_id: string
        }
        Update: {
          team_id?: number
          torneo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "torneo_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_teams_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id"]
          }
        ]
      }
      torneos: {
        Row: {
          created_at: string | null
          exa_id: number
          id: string
          image_url: string | null
          name: string
          points_defeat: number
          points_tie: number
          points_victory: number
        }
        Insert: {
          created_at?: string | null
          exa_id: number
          id?: string
          image_url?: string | null
          name: string
          points_defeat?: number
          points_tie?: number
          points_victory?: number
        }
        Update: {
          created_at?: string | null
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
            isOneToOne: false
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
      delete_fixture_players: {
        Args: {
          fixture: string
          local: number
          visit: number
        }
        Returns: boolean
      }
      delete_player_image: {
        Args: {
          image_url: string
        }
        Returns: Record<string, unknown>
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
          fixture: string
          local: number
          visit: number
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
      get_fixture_by_id: {
        Args: {
          fixture_id: string
        }
        Returns: {
          fixture_id: string
          name: string
          location_id: number
          fixture_order: number
          torneo_id: string
          fase_nro: number
          is_vuelta: boolean
          exa_id: number
          exa_name: string
          torneo: string
          torneo_image_url: string
          fase: string
          tipo_partido_id: number
          tipo_partido_name: string
          location_name: string
        }[]
      }
      get_fixture_details: {
        Args: {
          fixture: number
        }
        Returns: Json
      }
      get_fixture_front: {
        Args: {
          fixture: string
        }
        Returns: Json
      }
      get_fixture_players_by_fixture_id: {
        Args: {
          fixture: string
          local: number
          visit: number
        }
        Returns: {
          fixture_id: string
          team_local: number
          team_visit: number
          team_id: number
          id: number
          is_local: boolean
          goals: number
          yellow_cards: number
          red_card: boolean
          red_card_motive: string
          is_present: boolean
          name: string
          position_id: string
        }[]
      }
      get_fixture_teams_by_fixture_id: {
        Args: {
          fixture: string
        }
        Returns: {
          fixture_id: string
          team_local: number
          team_visit: number
          walkover_local: boolean
          walkover_visit: boolean
          date: string
          cancha_nro: number
          walkover_local_goals: number
          walkover_visit_goals: number
          fixture_order: number
          team_local_name: string
          team_local_image_url: string
          team_visit_name: string
          team_visit_image_url: string
          team_local_goals: number
          team_visit_goals: number
        }[]
      }
      get_fixtures_by_torneo: {
        Args: {
          torneo: string
          fase_nro: number
        }
        Returns: {
          fixture_id: string
          name: string
          location_id: number
          fixture_order: number
          torneo_id: string
          fase_nro: number
          is_vuelta: boolean
          exa_id: number
          exa_name: string
          torneo: string
          torneo_image_url: string
          fase: string
          tipo_partido_id: number
          tipo_partido_name: string
          location_name: string
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
          p_torneo_id: string
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
          fixture: string
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
      get_torneo_players_stats: {
        Args: {
          torneo: string
        }
        Returns: {
          player_id: number
          team_id: number
          team_image_url: string
          goals: number
          yellow_cards: number
          red_cards: number
          date: string
          name: string
          image_url: string
          position_id: string
          position_name: string
          foot: string
          rit: number
          tir: number
          pas: number
          reg: number
          def: number
          fis: number
          rating: number
          country_iso2: string
        }[]
      }
      insert_generated_fixtures: {
        Args: {
          data: Json
        }
        Returns: undefined
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          full_name: string | null;
          email: string | null;
          role: "admin" | "player";
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      players: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          nickname: string;
          player_type: "fixed" | "guest" | "goalkeeper";
          position: "line" | "goalkeeper";
          phone: string | null;
          active: boolean;
          fee_exempt: boolean;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      matches: {
        Row: {
          id: string;
          match_date: string;
          starts_at: string | null;
          location: string;
          status: "scheduled" | "completed" | "cancelled";
          notes: string | null;
          counts_for_ranking: boolean;
          created_by: string | null;
          created_at: string;
          completed_at: string | null;
          blue_score: number | null;
          red_score: number | null;
        };
      };
    };
    Views: {
      player_rankings_current_year: {
        Row: {
          player_id: string;
          full_name: string;
          nickname: string;
          active: boolean;
          position: "line" | "goalkeeper";
          wins: number;
          draws: number;
          losses: number;
          matches_played: number;
          season_year: number;
        };
      };
    };
    Functions: {
      get_financial_summary: {
        Args: { p_reference_month?: string };
        Returns: {
          reference_month: string;
          total_payments: number;
          total_expenses: number;
          prize_reserve: number;
          balance: number;
        }[];
      };
      get_player_home_snapshot: {
        Args: Record<PropertyKey, never>;
        Returns: {
          player_id: string;
          nickname: string;
          wins: number;
          draws: number;
          losses: number;
          matches_played: number;
          pending_amount: number;
          confirmed_next_match: boolean;
        }[];
      };
      admin_update_match_bundle: {
        Args: {
          p_match_id: string;
          p_match_date: string;
          p_starts_at?: string | null;
          p_location?: string | null;
          p_notes?: string | null;
          p_status?: "scheduled" | "completed" | "cancelled";
          p_counts_for_ranking?: boolean;
          p_blue_score?: number | null;
          p_red_score?: number | null;
          p_assignments?: Json;
        };
        Returns: undefined;
      };
    };
  };
};

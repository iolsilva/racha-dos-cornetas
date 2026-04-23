export type AppRole = "admin" | "player";

export type PlayerType = "fixed" | "guest" | "goalkeeper";
export type PositionType = "line" | "goalkeeper";
export type TeamColor = "blue" | "red";

export type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  phone: string | null;
};

export type Player = {
  id: string;
  profile_id: string | null;
  full_name: string;
  nickname: string;
  player_type: PlayerType;
  position: PositionType;
  phone: string | null;
  active: boolean;
  fee_exempt: boolean;
};

export type MatchSummary = {
  id: string;
  match_date: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
  blue_score: number | null;
  red_score: number | null;
};

export type RankingEntry = {
  player_id: string;
  full_name: string;
  nickname: string;
  rank_position: number;
  active: boolean;
  position: PositionType;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
};

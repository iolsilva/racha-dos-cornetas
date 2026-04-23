import type { AppRole, PositionType, TeamColor } from "@/lib/types/app";

type MatchStatus = "scheduled" | "completed" | "cancelled";
type PaymentType = "monthly_fee" | "guest_fee" | "adjustment";
type ExpenseCategory =
  | "field_rent"
  | "barbecue"
  | "equipment"
  | "awards"
  | "other";
type PlayerType = "fixed" | "guest" | "goalkeeper";
type AttendanceStatus = "confirmed" | "waitlist" | "declined";

export function formatRoleLabel(role: AppRole | string | null | undefined) {
  switch (role) {
    case "admin":
      return "Administrador";
    case "player":
      return "Jogador";
    default:
      return "-";
  }
}

export function formatPlayerTypeLabel(
  playerType: PlayerType | string | null | undefined,
) {
  switch (playerType) {
    case "fixed":
      return "Mensalista";
    case "guest":
      return "Diarista";
    case "goalkeeper":
      return "Goleiro";
    default:
      return "-";
  }
}

export function formatPlayerStatusLabel(active: boolean | null | undefined) {
  if (active === true) {
    return "Ativo";
  }

  if (active === false) {
    return "Inativo";
  }

  return "-";
}

export function formatPositionLabel(
  position: PositionType | string | null | undefined,
) {
  switch (position) {
    case "line":
      return "Linha";
    case "goalkeeper":
      return "Goleiro";
    default:
      return "-";
  }
}

export function formatMatchStatusLabel(
  status: MatchStatus | string | null | undefined,
) {
  switch (status) {
    case "scheduled":
      return "Agendada";
    case "completed":
      return "Concluida";
    case "cancelled":
      return "Cancelada";
    default:
      return "-";
  }
}

export function formatPaymentTypeLabel(
  paymentType: PaymentType | string | null | undefined,
) {
  switch (paymentType) {
    case "monthly_fee":
      return "Mensalidade";
    case "guest_fee":
      return "Diarista";
    case "adjustment":
      return "Ajuste";
    default:
      return "-";
  }
}

export function formatExpenseCategoryLabel(
  category: ExpenseCategory | string | null | undefined,
) {
  switch (category) {
    case "field_rent":
      return "Aluguel do campo";
    case "barbecue":
      return "Churrasco";
    case "equipment":
      return "Equipamento";
    case "awards":
      return "Premiacao";
    case "other":
      return "Outro";
    default:
      return "-";
  }
}

export function formatAttendanceStatusLabel(
  status: AttendanceStatus | string | null | undefined,
) {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "waitlist":
      return "Lista de espera";
    case "declined":
      return "Recusado";
    default:
      return "-";
  }
}

export function formatTeamColorLabel(
  teamColor: TeamColor | string | null | undefined,
) {
  switch (teamColor) {
    case "blue":
      return "Azul";
    case "red":
      return "Vermelho";
    default:
      return "-";
  }
}

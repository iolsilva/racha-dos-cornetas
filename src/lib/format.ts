const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatCurrency(value: number | null | undefined) {
  return currencyFormatter.format(value ?? 0);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return dateFormatter.format(new Date(value));
}

export function formatShortWeekday(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function formatOrdinalRank(value: number | null | undefined) {
  if (!value || value < 1) {
    return "-";
  }

  return `${value}\u00BA`;
}
